import { Client, GatewayIntentBits, Events, SlashCommandBuilder, REST, Routes, EmbedBuilder, ChannelType, PermissionsBitField } from 'discord.js';
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

// Slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('bump')
    .setDescription('Bump your server to all bump channels'),

  new SlashCommandBuilder()
    .setName('bumptools')
    .setDescription('Get information about bump tools and settings'),

  new SlashCommandBuilder()
    .setName('bumpchannel')
    .setDescription('Set or manage the bump channel for this server')
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set the current channel as the bump channel')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove bump channel from this server')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Show current bump channel settings')
    ),

  new SlashCommandBuilder()
    .setName('setbump')
    .setDescription('Get your server management link (only visible to you)')
];

client.once(Events.ClientReady, async () => {
  console.log(`✅ Discord bot logged in as ${client.user?.tag}!`);

  // Register slash commands
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(client.user!.id),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }

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

// Handle slash command interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'bump':
        await handleBumpCommand(interaction);
        break;
      case 'bumptools':
        await handleBumpToolsCommand(interaction);
        break;
      case 'bumpchannel':
        await handleBumpChannelCommand(interaction);
        break;
      case 'setbump':
        await handleSetBumpCommand(interaction);
        break;
    }
  } catch (error) {
    console.error('Error handling command:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
    }
  }
});

async function handleBumpCommand(interaction: any) {
  await interaction.deferReply();

  try {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    // Check if server has bump enabled
    const serverData = await storage.getServerByDiscordId(guildId);
    if (!serverData || !serverData.bumpEnabled) {
      await interaction.editReply({
        content: '❌ Bump is not enabled for this server. Server owners can enable it on the Smart Serve website.'
      });
      return;
    }

    // Check cooldown (2 hours between bumps)
    const lastBump = await storage.getLastBump(guildId);
    const cooldownTime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

    if (lastBump && Date.now() - lastBump.getTime() < cooldownTime) {
      const remainingTime = Math.ceil((cooldownTime - (Date.now() - lastBump.getTime())) / (60 * 1000));
      await interaction.editReply({
        content: `⏰ Server is on cooldown. You can bump again in ${remainingTime} minutes.`
      });
      return;
    }

    // Get all bump channels from all servers
    const bumpChannels = await storage.getAllBumpChannels();
    let successCount = 0;
    let errorCount = 0;

    // Create bump embed
    const bumpEmbed = new EmbedBuilder()
      .setTitle(`🚀 ${interaction.guild.name}`)
      .setDescription(serverData.description || 'Join our amazing Discord community!')
      .setColor('#7C3AED')
      .addFields(
        { name: '👥 Members', value: `${interaction.guild.memberCount || 'Unknown'}`, inline: true },
        { name: '🌐 Server', value: `[Join Now](https://discord.gg/${serverData.inviteCode})`, inline: true }
      )
      .setThumbnail(interaction.guild.iconURL() || null)
      .setFooter({ text: 'Powered by Smart Serve', iconURL: client.user?.avatarURL() || undefined })
      .setTimestamp();

    // Send bump to all channels
    for (const channelData of bumpChannels) {
      try {
        if (channelData.guildId === guildId) continue; // Don't bump to own server

        const channel = await client.channels.fetch(channelData.channelId);
        if (channel && channel.type === ChannelType.GuildText) {
          await (channel as any).send({ embeds: [bumpEmbed] });
          successCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`Failed to send bump to channel ${channelData.channelId}:`, error);
      }
    }

    // Update last bump time
    await storage.updateLastBump(guildId);

    await interaction.editReply({
      content: `✅ Successfully bumped to ${successCount} servers! ${errorCount > 0 ? `(${errorCount} failed)` : ''}`
    });

  } catch (error) {
    console.error('Bump command error:', error);
    await interaction.editReply({
      content: '❌ An error occurred while bumping your server.'
    });
  }
}

async function handleBumpToolsCommand(interaction: any) {
  const embed = new EmbedBuilder()
    .setTitle('🛠️ Bump Tools')
    .setDescription('Information about Smart Serve bump system')
    .setColor('#7C3AED')
    .addFields(
      { name: '📢 /bump', value: 'Bump your server to all bump channels (2 hour cooldown)', inline: false },
      { name: '🔧 /bumpchannel set', value: 'Set current channel as bump channel', inline: false },
      { name: '❌ /bumpchannel remove', value: 'Remove bump channel', inline: false },
      { name: '📊 /bumpchannel info', value: 'View bump channel settings', inline: false },
      { name: '⚙️ /setbump', value: 'Get server management link', inline: false }
    )
    .setFooter({ text: 'Powered by Smart Serve' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleBumpChannelCommand(interaction: any) {
  const subcommand = interaction.options.getSubcommand();

  // Check if user has manage channels permission
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
    await interaction.reply({
      content: '❌ You need **Manage Channels** permission to use this command.',
      ephemeral: true
    });
    return;
  }

  switch (subcommand) {
    case 'set':
      try {
        await storage.setBumpChannel(interaction.guild.id, interaction.channel.id);
        await interaction.reply({
          content: `✅ Successfully set ${interaction.channel} as the bump channel!`
        });
      } catch (error) {
        await interaction.reply({
          content: '❌ Failed to set bump channel.',
          ephemeral: true
        });
      }
      break;

    case 'remove':
      try {
        await storage.removeBumpChannel(interaction.guild.id);
        await interaction.reply({
          content: '✅ Successfully removed bump channel!'
        });
      } catch (error) {
        await interaction.reply({
          content: '❌ Failed to remove bump channel.',
          ephemeral: true
        });
      }
      break;

    case 'info':
      try {
        const bumpChannel = await storage.getBumpChannel(interaction.guild.id);
        if (bumpChannel) {
          const channel = await client.channels.fetch(bumpChannel.channelId);
          await interaction.reply({
            content: `📊 Current bump channel: ${channel}`
          });
        } else {
          await interaction.reply({
            content: '📊 No bump channel set for this server.'
          });
        }
      } catch (error) {
        await interaction.reply({
          content: '❌ Failed to get bump channel info.',
          ephemeral: true
        });
      }
      break;
  }
}

async function handleSetBumpCommand(interaction: any) {
  // Check if user has manage server permission
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
    await interaction.reply({
      content: '❌ You need **Manage Server** permission to use this command.',
      ephemeral: true
    });
    return;
  }

  const serverManageUrl = `${process.env.APP_URL || 'https://smartserve.com'}/your-servers`;

  const embed = new EmbedBuilder()
    .setTitle('⚙️ Server Management')
    .setDescription('Manage your server settings on Smart Serve')
    .setColor('#7C3AED')
    .addFields(
      { name: '🔗 Management Link', value: `[Click here to manage your servers](${serverManageUrl})`, inline: false },
      { name: '📝 What you can do:', value: '• Enable/disable bump feature\n• Update server description\n• Manage advertising\n• View analytics', inline: false }
    )
    .setFooter({ text: 'This link is only visible to you' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

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