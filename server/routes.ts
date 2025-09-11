import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServerSchema, insertBotSchema, insertAdSchema } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        discordId: string;
        username: string;
        avatar?: string;
      };
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin middleware
  const requireAdmin = (req: Request, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!(req.user as any).isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Auth routes
  app.get("/api/auth/me", (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  app.get("/api/auth/discord", (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID || "1372226433191247983";
    const redirectUri = `https://${req.get('host')}/api/auth/discord/callback`;
    const scope = 'identify email guilds';

    console.log('Discord OAuth - Client ID:', clientId);
    console.log('Discord OAuth - Redirect URI:', redirectUri);

    if (!clientId) {
      return res.status(500).json({ message: "Discord client ID not configured" });
    }

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

    res.redirect(discordAuthUrl);
  });

  app.get("/api/auth/discord/callback", async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: "Authorization code not provided" });
    }

    try {
      const clientId = process.env.DISCORD_CLIENT_ID || "1372226433191247983";
      const clientSecret = process.env.DISCORD_CLIENT_SECRET;
      const redirectUri = `https://${req.get('host')}/api/auth/discord/callback`;

      if (!clientSecret) {
        console.error('Discord client secret not configured');
        return res.status(500).json({ message: "Discord client secret not configured" });
      }

      console.log('Discord Callback - Client ID:', clientId);
      console.log('Discord Callback - Client Secret:', clientSecret ? 'Set' : 'Not set');

      // Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      console.log('Token Response Status:', tokenResponse.status);
      console.log('Token Response Data:', tokenData);

      if (!tokenResponse.ok) {
        console.error('Discord token exchange failed:', tokenData);
        throw new Error(tokenData.error_description || tokenData.error || 'Failed to get access token');
      }

      // Get user info from Discord
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const discordUser = await userResponse.json();
      
      console.log('User Response Status:', userResponse.status);
      console.log('Discord User Data:', discordUser);

      if (!userResponse.ok) {
        console.error('Discord user fetch failed:', discordUser);
        throw new Error('Failed to get user info');
      }

      // Check if user exists in database
      let user = await storage.getUserByDiscordId(discordUser.id);

      // Check if this is the admin user using Discord ID allowlist (more secure than username)
      const ADMIN_DISCORD_IDS = ['1168137833026945169']; // Add more admin Discord IDs here
      const isAdminUser = ADMIN_DISCORD_IDS.includes(discordUser.id);

      if (!user) {
        // Create new user
        user = await storage.createUser({
          discordId: discordUser.id,
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar,
          email: discordUser.email,
          isAdmin: isAdminUser,
          discordAccessToken: tokenData.access_token,
        });
      } else {
        // Update existing user
        user = await storage.updateUser(user.id, {
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar,
          email: discordUser.email,
          isAdmin: isAdminUser,
          discordAccessToken: tokenData.access_token,
        });
      }

      // Set user in session
      const session = req.session as any;
      session.userId = user?.id;

      // Redirect to home
      res.redirect('/?auth=success');

    } catch (error) {
      console.error('Discord OAuth error:', error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.get("/api/auth/logout", (req, res) => {
    const session = req.session as any;
    session.destroy((err: any) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.redirect('/');
    });
  });

  // Categories

  // Servers
  app.get("/api/servers", async (req, res) => {
    try {
      const { search, limit = "20", offset = "0" } = req.query;
      const servers = await storage.getServers({
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      // Ensure we always return an array
      res.json(Array.isArray(servers) ? servers : []);
    } catch (error) {
      console.error("Failed to fetch servers:", error);
      res.status(500).json({ message: "Failed to fetch servers" });
    }
  });

  app.get("/api/servers/popular", async (req, res) => {
    try {
      const { limit = "6" } = req.query;
      const servers = await storage.getPopularServers(parseInt(limit as string));
      // Ensure we always return an array
      res.json(Array.isArray(servers) ? servers : []);
    } catch (error) {
      console.error("Failed to fetch popular servers:", error);
      res.status(500).json({ message: "Failed to fetch popular servers" });
    }
  });

  app.get("/api/servers/:id", async (req, res) => {
    try {
      const server = await storage.getServer(req.params.id);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }
      res.json(server);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch server" });
    }
  });

  // Get Discord guilds where user has admin permissions
  app.get("/api/servers/user/:userId", async (req, res) => {
    // SECURITY: Require authentication
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // SECURITY: Verify ownership or admin access
    const isOwner = req.user.id === req.params.userId;
    const isAdmin = (req.user as any).isAdmin;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You can only access your own Discord servers" });
    }

    try {
      const user = await storage.getUser(req.params.userId);
      if (!user || !user.discordAccessToken) {
        return res.status(404).json({ message: "User not found or access token missing" });
      }

      // Fetch user's guilds from Discord API with member counts
      const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds?with_counts=true', {
        headers: {
          'Authorization': `Bearer ${user.discordAccessToken}`,
        },
      });

      if (!guildsResponse.ok) {
        if (guildsResponse.status === 401) {
          console.error('Discord access token expired or invalid');
          return res.status(401).json({ message: "Discord access token expired. Please re-authenticate." });
        }
        throw new Error(`Failed to fetch Discord guilds: ${guildsResponse.status}`);
      }

      const guilds = await guildsResponse.json();
      
      // Filter guilds where user has admin permissions
      // Discord permission value 8 = ADMINISTRATOR, 32 = MANAGE_GUILD
      const adminGuilds = guilds.filter((guild: any) => {
        const permissions = parseInt(guild.permissions);
        return (permissions & 8) === 8 || (permissions & 32) === 32 || guild.owner;
      });

      // Transform Discord guilds to our server format
      const servers = adminGuilds.map((guild: any) => ({
        id: guild.id,
        name: guild.name,
        description: guild.description || `${guild.name} Discord Server`,
        inviteCode: '', // We don't have invite codes from guilds API
        icon: guild.icon,
        memberCount: guild.approximate_member_count || 0,
        onlineCount: guild.approximate_presence_count || 0,
        ownerId: req.params.userId,
        tags: [], // Don't use Discord features as tags
        verified: guild.features?.includes('VERIFIED') || guild.features?.includes('PARTNERED') || false,
        featured: guild.features?.includes('FEATURED') || guild.features?.includes('DISCOVERABLE') || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      res.json(servers);
    } catch (error) {
      console.error('Discord guilds fetch error:', error);
      res.status(500).json({ message: "Failed to fetch Discord servers" });
    }
  });

  // Check if Smart Serve bot is present in a Discord server
  app.get("/api/discord/bot-check/:guildId", async (req, res) => {
    // SECURITY: Require authentication
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { guildId } = req.params;
      const botId = process.env.DISCORD_CLIENT_ID || "1372226433191247983";
      const botToken = process.env.DISCORD_BOT_TOKEN;
      
      console.log(`Bot check for guild ${guildId} with bot ID ${botId}`);
      console.log(`Bot token available: ${botToken ? 'Yes' : 'No'}`);
      
      // Validate bot token format
      if (!botToken) {
        console.error('❌ No bot token configured in environment variables');
        return res.status(500).json({ 
          message: "Bot token not configured. Please set DISCORD_BOT_TOKEN in Secrets.", 
          botPresent: false,
          checkMethod: "no_token",
          inviteUrl: `https://discord.com/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`
        });
      }

      // Basic bot token format validation
      if (!botToken.startsWith('MTM3MjIy') || botToken.length < 50) {
        console.error('❌ Invalid bot token format detected');
        return res.status(500).json({ 
          message: "Invalid bot token format. Please check your DISCORD_BOT_TOKEN in Secrets.", 
          botPresent: false,
          checkMethod: "invalid_token_format",
          inviteUrl: `https://discord.com/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`
        });
      }

      // Check if user has admin access to this guild first
      const user = await storage.getUser(req.user.id);
      if (!user || !user.discordAccessToken) {
        return res.status(404).json({ message: "User access token not found" });
      }

      // Fetch user's guilds to verify they have access to this guild
      const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: { 'Authorization': `Bearer ${user.discordAccessToken}` },
      });

      if (!guildsResponse.ok) {
        return res.status(401).json({ message: "Failed to verify guild access" });
      }

      const guilds = await guildsResponse.json();
      const guild = guilds.find((g: any) => g.id === guildId);
      
      if (!guild) {
        return res.status(403).json({ message: "You don't have access to this guild" });
      }

      let botPresent = false;
      let checkMethod = "none";
      let errorDetails = "";
      
      try {
        console.log(`Checking bot presence in guild ${guildId} using bot token (first 10 chars: ${botToken.substring(0, 10)}...)`);
        
        // Method 1: Check bot as guild member (most reliable)
        const botMemberResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${botId}`, {
          headers: { 'Authorization': `Bot ${botToken}` },
        });
        
        console.log(`Bot member response status: ${botMemberResponse.status}`);
        
        if (botMemberResponse.ok) {
          const memberData = await botMemberResponse.json();
          console.log(`Bot member data:`, memberData);
          botPresent = true;
          checkMethod = "member_check";
          console.log(`✅ Bot found in guild ${guildId} as member`);
        } else if (botMemberResponse.status === 404) {
          // 404 means bot is not in the server
          botPresent = false;
          checkMethod = "not_member";
          console.log(`❌ Bot NOT found in guild ${guildId} - not a member (404)`);
        } else if (botMemberResponse.status === 401) {
          // 401 means invalid bot token
          const errorData = await botMemberResponse.json();
          errorDetails = `Invalid bot token: ${errorData.message || 'Unauthorized'}`;
          botPresent = false;
          checkMethod = "invalid_token";
          console.log(`❌ Bot token invalid for guild ${guildId} check - ${errorDetails}`);
        } else {
          // Other error
          const errorData = await botMemberResponse.json();
          errorDetails = `API Error: ${errorData.message || 'Unknown error'}`;
          console.log(`❌ Bot check failed with status ${botMemberResponse.status}: ${errorDetails}`);
          
          // Fallback: Try guild info method
          const guildInfoResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
            headers: { 'Authorization': `Bot ${botToken}` },
          });
          
          console.log(`Guild info response status: ${guildInfoResponse.status}`);
          
          if (guildInfoResponse.ok) {
            botPresent = true;
            checkMethod = "guild_info";
            console.log(`✅ Bot found in guild ${guildId} via guild info check`);
          } else {
            botPresent = false;
            checkMethod = "all_failed";
            console.log(`❌ Bot NOT found in guild ${guildId} - all checks failed`);
          }
        }
      } catch (error) {
        console.error('Bot presence check error:', error);
        botPresent = false;
        checkMethod = "error";
        errorDetails = error instanceof Error ? error.message : 'Unknown error';
      }
      
      console.log(`Final bot presence result: ${botPresent} (method: ${checkMethod})`);
      if (errorDetails) {
        console.log(`Error details: ${errorDetails}`);
      }
      
      res.json({ 
        botPresent,
        checkMethod,
        errorDetails,
        inviteUrl: `https://discord.com/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`
      });
    } catch (error) {
      console.error('Bot check error:', error);
      res.status(500).json({ message: "Failed to check bot presence" });
    }
  });

  app.post("/api/servers", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      console.log("Creating server with data:", req.body);
      const serverData = insertServerSchema.parse({
        ...req.body,
        ownerId: req.user.id,
      });
      const server = await storage.createServer(serverData);
      console.log("Server created successfully:", server);
      res.status(201).json(server);
    } catch (error) {
      console.error("Server creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create server" });
    }
  });

  app.put("/api/servers/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const server = await storage.getServer(req.params.id);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }

      if (server.ownerId !== req.user.id) {
        return res.status(403).json({ message: "You can only edit your own servers" });
      }

      const serverData = insertServerSchema.partial().parse(req.body);
      const updatedServer = await storage.updateServer(req.params.id, serverData);
      res.json(updatedServer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update server" });
    }
  });

  app.delete("/api/servers/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const server = await storage.getServer(req.params.id);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }

      if (server.ownerId !== req.user.id) {
        return res.status(403).json({ message: "You can only delete your own servers" });
      }

      await storage.deleteServer(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete server" });
    }
  });

  // Bots
  app.get("/api/bots", async (req, res) => {
    try {
      const { search, limit = "20", offset = "0" } = req.query;
      const bots = await storage.getBots({
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(bots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bots" });
    }
  });

  app.get("/api/bots/popular", async (req, res) => {
    try {
      const { limit = "6" } = req.query;
      const bots = await storage.getPopularBots(parseInt(limit as string));
      res.json(bots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular bots" });
    }
  });

  app.post("/api/bots", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const botData = insertBotSchema.parse({
        ...req.body,
        ownerId: req.user.id,
      });
      const bot = await storage.createBot(botData);
      res.status(201).json(bot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bot" });
    }
  });

  // Discord invite validation
  app.post("/api/discord/validate-invite", async (req, res) => {
    try {
      const { inviteCode } = req.body;

      if (!inviteCode) {
        return res.status(400).json({ message: "Invite code is required" });
      }

      // Extract invite code from full URL if provided
      const code = inviteCode.split('/').pop().split('?')[0];

      // Get invite information
      const inviteResponse = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`);
      
      if (!inviteResponse.ok) {
        return res.status(400).json({ message: "Invalid invite code" });
      }

      const inviteData = await inviteResponse.json();
      const serverId = inviteData.guild.id;

      // Check if our bot is in the server
      const botToken = process.env.DISCORD_BOT_TOKEN;
      
      if (!botToken) {
        return res.status(500).json({ message: "Bot token not configured" });
      }

      const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}`, {
        headers: {
          'Authorization': `Bot ${botToken}`,
        },
      });

      if (!guildResponse.ok) {
        return res.status(400).json({ 
          message: "Bot is not in this server. Please invite our bot first.",
          botNotInServer: true 
        });
      }

      const guildData = await guildResponse.json();

      // Get additional guild info for member counts
      const guildMembersResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}?with_counts=true`, {
        headers: {
          'Authorization': `Bot ${botToken}`,
        },
      });

      const guildMembersData = await guildMembersResponse.json();

      const serverData = {
        name: guildData.name,
        icon: guildData.icon ? `https://cdn.discordapp.com/icons/${serverId}/${guildData.icon}.png` : null,
        banner: guildData.banner ? `https://cdn.discordapp.com/banners/${serverId}/${guildData.banner}.png` : null,
        description: guildData.description || "",
        memberCount: guildMembersData.approximate_member_count || inviteData.approximate_member_count || 0,
        onlineCount: guildMembersData.approximate_presence_count || inviteData.approximate_presence_count || 0,
        valid: true,
        serverId: serverId,
        inviteCode: code // Include the actual invite code
      };

      res.json(serverData);
    } catch (error) {
      console.error("Discord validation error:", error);
      res.status(500).json({ message: "Failed to validate invite" });
    }
  });

  // Ads routes
  app.get("/api/ads", async (req, res) => {
    try {
      const { position } = req.query;
      const ads = await storage.getAds(position as string);
      res.json(ads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });

  app.post("/api/ads", requireAdmin, async (req, res) => {
    try {
      const adData = insertAdSchema.parse(req.body);
      const ad = await storage.createAd(adData);
      res.status(201).json(ad);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create ad" });
    }
  });

  app.put("/api/ads/:id", requireAdmin, async (req, res) => {
    try {
      const adData = insertAdSchema.partial().parse(req.body);
      const updatedAd = await storage.updateAd(req.params.id, adData);
      if (!updatedAd) {
        return res.status(404).json({ message: "Ad not found" });
      }
      res.json(updatedAd);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update ad" });
    }
  });

  app.delete("/api/ads/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteAd(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Ad not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ad" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}