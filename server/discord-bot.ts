
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { storage } from './storage';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
  ],
});

// Store invite usage data
const inviteCache = new Map();

client.once(Events.ClientReady, async () => {
  console.log(`✅ Discord bot logged in as ${client.user?.tag}!`);
  
  // Cache existing invites for all guilds
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      inviteCache.set(guild.id, new Map(invites.map(invite => [invite.code, invite.uses || 0])));
    } catch (error) {
      console.error(`Failed to fetch invites for guild ${guild.name}:`, error);
    }
  }
});

// Track invite usage when someone joins
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const guild = member.guild;
    const cachedInvites = inviteCache.get(guild.id) || new Map();
    const newInvites = await guild.invites.fetch();
    
    // Find which invite was used
    const usedInvite = newInvites.find(invite => {
      const cachedUses = cachedInvites.get(invite.code) || 0;
      return (invite.uses || 0) > cachedUses;
    });
    
    if (usedInvite && usedInvite.inviter) {
      console.log(`${member.user.tag} joined using invite by ${usedInvite.inviter.tag}`);
      
      // Award coins to the inviter
      const inviterUser = await storage.getUserByDiscordId(usedInvite.inviter.id);
      if (inviterUser) {
        const coinsToAward = 5; // 5 coins for successful invite
        const newBalance = (inviterUser.coins || 0) + coinsToAward;
        await storage.updateUserCoins(inviterUser.id, newBalance);
        
        console.log(`Awarded ${coinsToAward} coins to ${usedInvite.inviter.tag} for inviting ${member.user.tag}`);
        
        // Optionally send a DM to the inviter
        try {
          await usedInvite.inviter.send(
            `🎉 You earned ${coinsToAward} coins for inviting ${member.user.tag} to ${guild.name}! Your balance is now ${newBalance} coins.`
          );
        } catch (dmError) {
          console.log(`Could not send DM to ${usedInvite.inviter.tag}`);
        }
      }
      
      // Award welcome bonus to new member
      const newMemberUser = await storage.getUserByDiscordId(member.id);
      if (newMemberUser) {
        const welcomeBonus = 2; // 2 coins welcome bonus
        const newMemberBalance = (newMemberUser.coins || 0) + welcomeBonus;
        await storage.updateUserCoins(newMemberUser.id, newMemberBalance);
        
        try {
          await member.send(
            `Welcome to ${guild.name}! 🎉 You received ${welcomeBonus} coins as a welcome bonus!`
          );
        } catch (dmError) {
          console.log(`Could not send welcome DM to ${member.user.tag}`);
        }
      }
    }
    
    // Update cached invites
    inviteCache.set(guild.id, new Map(newInvites.map(invite => [invite.code, invite.uses || 0])));
    
  } catch (error) {
    console.error('Error tracking invite usage:', error);
  }
});

// Update invite cache when new invites are created
client.on(Events.InviteCreate, async (invite) => {
  const guildInvites = inviteCache.get(invite.guild?.id) || new Map();
  guildInvites.set(invite.code, invite.uses || 0);
  inviteCache.set(invite.guild?.id, guildInvites);
});

// Clean up deleted invites
client.on(Events.InviteDelete, async (invite) => {
  const guildInvites = inviteCache.get(invite.guild?.id) || new Map();
  guildInvites.delete(invite.code);
  inviteCache.set(invite.guild?.id, guildInvites);
});

export async function startDiscordBot() {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    console.error('❌ DISCORD_BOT_TOKEN not found in environment variables');
    return;
  }
  
  try {
    await client.login(botToken);
  } catch (error) {
    console.error('❌ Failed to login Discord bot:', error);
  }
}

export { client as discordBot };
