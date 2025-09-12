import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { 
  servers, 
  bots, 
  events, 
  users, 
  ads, 
  slideshows, 
  reviews, 
  serverJoins, 
  bumpChannels,
  insertServerSchema, 
  insertBotSchema, 
  insertEventSchema, 
  insertAdSchema, 
  insertServerJoinSchema,
  insertSlideshowSchema
} from "@shared/schema";
import { z } from "zod";
import { eq, desc, asc, and, or, ilike, sql } from "drizzle-orm";
import { 
  strictLimiter, 
  reviewLimiter, 
  validateServerData, 
  validateReview 
} from "./middleware/security";
import crypto from "crypto";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        discordId: string;
        username: string;
        avatar?: string;
        isAdmin?: boolean;
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
    const protocol = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const redirectUri = `${protocol}://${req.get('host')}/api/auth/discord/callback`;
    const scope = 'identify email guilds';
    const rememberMe = req.query.remember === 'true';

    console.log('Discord OAuth - Client ID:', clientId);
    console.log('Discord OAuth - Redirect URI:', redirectUri);
    console.log('Discord OAuth - Remember Me:', rememberMe);

    if (!clientId) {
      return res.status(500).json({ message: "Discord client ID not configured" });
    }

    // Generate secure random state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Store both remember me preference and OAuth state in session
    const session = req.session as any;
    session.pendingRememberMe = rememberMe;
    session.oauthState = state;

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;

    res.redirect(discordAuthUrl);
  });

  app.get("/api/auth/discord/callback", async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ message: "Authorization code not provided" });
    }

    // Validate OAuth state parameter for CSRF protection
    const session = req.session as any;
    if (!state || !session.oauthState || state !== session.oauthState) {
      console.error('OAuth state validation failed:', { received: state, expected: session.oauthState });
      return res.status(400).json({ message: "Invalid OAuth state - possible CSRF attack" });
    }

    // Clear used OAuth state
    delete session.oauthState;

    try {
      const clientId = process.env.DISCORD_CLIENT_ID || "1372226433191247983";
      const clientSecret = process.env.DISCORD_CLIENT_SECRET;
      const protocol = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const redirectUri = `${protocol}://${req.get('host')}/api/auth/discord/callback`;

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
      // Sensitive token data logging removed for security

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
      // Sensitive user data logging removed for security

      if (!userResponse.ok) {
        console.error('Discord user fetch failed:', discordUser);
        throw new Error('Failed to get user info');
      }

      // Check if user exists in database
      let user = await storage.getUserByDiscordId(discordUser.id);

      // Check if this is the admin user using username
      const ADMIN_USERNAMES = ['aetherflux_002']; // Add more admin usernames here
      const isAdminUser = ADMIN_USERNAMES.includes(discordUser.username);

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

      // Regenerate session ID to prevent session fixation attacks
      const rememberMe = req.session.pendingRememberMe || false;

      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration failed:', err);
          return res.status(500).json({ message: "Authentication failed - session error" });
        }

        // Set user in session with persistent login settings
        const session = req.session as any;
        session.userId = user?.id;
        session.loginTime = Date.now();
        session.rememberMe = rememberMe;

        // Set appropriate session duration based on remember me preference
        if (session.rememberMe) {
          session.cookie.maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days for remember me
          console.log('User logged in with persistent session (90 days)');
        } else {
          session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days for regular session
          console.log('User logged in with regular session (7 days)');
        }

        // Save session and redirect
        session.save((saveErr: any) => {
          if (saveErr) {
            console.error('Session save failed:', saveErr);
            return res.status(500).json({ message: "Authentication failed - session save error" });
          }

          // Redirect to home
          res.redirect('/?auth=success');
        });
      });


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

  // Server routes
  app.get("/api/servers", async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const language = req.query.language as string;
      const timezone = req.query.timezone as string;
      const activity = req.query.activity as string;

      let query = db.select().from(servers).limit(limit).offset(offset);

      const conditions = [];

      if (search) {
        conditions.push(
          or(
            ilike(servers.name, `%${search}%`),
            ilike(servers.description, `%${search}%`)
          )
        );
      }

      if (language) {
        conditions.push(eq(servers.language, language));
      }

      if (timezone) {
        conditions.push(eq(servers.timezone, timezone));
      }

      if (activity) {
        conditions.push(eq(servers.activityLevel, activity));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const serverList = await query;
      res.json(serverList);
    } catch (error) {
      console.error("Error fetching servers:", error);
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
        console.log(`Checking bot presence in guild ${guildId} using bot token`);

        // Method 1: Check bot as guild member (most reliable)
        const botMemberResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${botId}`, {
          headers: { 'Authorization': `Bot ${botToken}` },
        });

        console.log(`Bot member response status: ${botMemberResponse.status}`);

        if (botMemberResponse.ok) {
          const memberData = await botMemberResponse.json();
          console.log(`Bot member check successful`);
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

  // Use requireAuth middleware for protected routes that require authentication
  const requireAuth = (req: Request, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Update server
  app.patch("/api/servers/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const server = await storage.getServer(id);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }

      // Check if user owns this server
      if (server.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this server" });
      }

      const updatedServer = await storage.updateServer(id, updates);
      res.json(updatedServer);
    } catch (error) {
      console.error("Error updating server:", error);
      res.status(500).json({ message: "Failed to update server" });
    }
  });

  // Update server bump settings
  app.patch("/api/servers/:id/bump-settings", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { bumpEnabled } = req.body;

      const server = await storage.getServer(id);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }

      // Check if user owns this server
      if (server.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this server" });
      }

      const updatedServer = await storage.updateServer(id, { bumpEnabled });
      res.json(updatedServer);
    } catch (error) {
      console.error("Error updating bump settings:", error);
      res.status(500).json({ message: "Failed to update bump settings" });
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

  // Slideshow routes
  app.get("/api/slideshows", async (req, res) => {
    try {
      const { page } = req.query;
      const slideshows = await storage.getSlideshows(page as string);
      res.json(slideshows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch slideshows" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const { search, limit = "20", offset = "0" } = req.query;
      const events = await storage.getEvents({
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Event creation route
  app.post("/api/events", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const eventData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent({
        ...eventData,
        ownerId: req.user.id,
      });
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid event data", 
          errors: error.errors 
        });
      }
      console.error("Event creation error:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Wallet system routes
  app.get("/api/servers/advertising", async (req, res) => {
    try {
      const advertisingServers = await storage.getAdvertisingServers();
      res.json(advertisingServers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch advertising servers" });
    }
  });

  app.post("/api/servers/:serverId/join", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { serverId } = req.params;
      const userId = req.user.id;
      const coinsToAward = 1;

      // Get current user for Discord verification (lightweight check before heavy transaction)
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!currentUser.discordAccessToken) {
        return res.status(400).json({ message: "Discord access required for verification" });
      }

      // DISCORD MEMBERSHIP VERIFICATION: Verify user is actually a member of the Discord server
      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        return res.status(500).json({ message: "Bot token not configured" });
      }

      try {
        // Check if user is a member of the guild using bot token
        const memberResponse = await fetch(`https://discord.com/api/v10/guilds/${serverId}/members/${currentUser.discordId}`, {
          headers: {
            'Authorization': `Bot ${botToken}`,
          },
        });

        if (!memberResponse.ok) {
          if (memberResponse.status === 404) {
            return res.status(400).json({ 
              message: "You must be a member of this Discord server to earn coins" 
            });
          }
          throw new Error(`Discord API error: ${memberResponse.status}`);
        }
      } catch (discordError) {
        console.error("Discord membership verification failed:", discordError);
        return res.status(500).json({ 
          message: "Failed to verify Discord membership" 
        });
      }

      // ATOMIC TRANSACTION: All validation and state checks are now inside the transaction
      const userForTransaction = await storage.getUser(userId);
      const serverForTransaction = await storage.getServer(serverId);
      const result = await storage.atomicServerJoin({
        userId,
        serverId,
        coinsToAward,
        currentCoins: userForTransaction?.coins || 0,
        advertisingMembersNeeded: serverForTransaction?.advertisingMembersNeeded || 0,
      });

      res.json({
        message: "Successfully joined server and earned coins",
        coinsEarned: coinsToAward,
        newBalance: result.newBalance,
      });
    } catch (error) {
      console.error("Server join error:", error);

      // Handle specific error cases with user-friendly messages
      if (error instanceof Error) {
        if (error.message.includes("already earned coins")) {
          return res.status(400).json({ message: error.message });
        }
        if (error.message.includes("not currently advertising") || error.message.includes("quota exhausted")) {
          return res.status(400).json({ message: "Server is not available for coin earning" });
        }
        if (error.message.includes("Server not found")) {
          return res.status(404).json({ message: "Server not found" });
        }
      }

      res.status(500).json({ message: "Failed to process server join" });
    }
  });

  app.post("/api/servers/:serverId/advertise", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { serverId } = req.params;
      const { members } = req.body;
      const userId = req.user.id;

      if (!members || typeof members !== 'number' || members <= 0) {
        return res.status(400).json({ message: "Valid members count required" });
      }

      const costPerMember = 2;
      const totalCost = members * costPerMember;

      // Get current user to check balance
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentCoins = currentUser.coins || 0;
      if (currentCoins < totalCost) {
        return res.status(400).json({ 
          message: "Insufficient coins",
          required: totalCost,
          available: currentCoins,
        });
      }

      // Verify the user owns/admins the server (using Discord API)
      if (!currentUser.discordAccessToken) {
        return res.status(400).json({ message: "Discord access required" });
      }

      // Fetch user's guilds to verify ownership
      const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
          'Authorization': `Bearer ${currentUser.discordAccessToken}`,
        },
      });

      if (!guildsResponse.ok) {
        return res.status(400).json({ message: "Failed to verify server ownership" });
      }

      const guilds = await guildsResponse.json();
      const userGuild = guilds.find((guild: any) => guild.id === serverId && (guild.permissions & 0x8) === 0x8); // ADMINISTRATOR permission

      if (!userGuild) {
        return res.status(403).json({ message: "You must be an admin of this server" });
      }

      // ATOMIC OPERATION: Deduct coins and set server as advertising
      const newCoinBalance = currentCoins - totalCost;
      await Promise.all([
        storage.updateUserCoins(userId, newCoinBalance),
        storage.updateServer(serverId, {
          isAdvertising: true,
          advertisingMembersNeeded: members,
          advertisingUserId: userId,
        }),
      ]);

      res.json({
        message: "Successfully purchased advertising",
        membersAdvertised: members,
        costPaid: totalCost,
        newBalance: newCoinBalance,
      });
    } catch (error) {
      console.error("Server advertise error:", error);
      res.status(500).json({ message: "Failed to process advertising purchase" });
    }
  });

  // Handle server leave notifications
  app.post("/api/servers/:serverId/leave", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { serverId } = req.params;
      const userId = req.user.id;

      // Handle the server leave and potential coin deduction
      const result = await storage.handleServerLeave(userId, serverId);

      if (!result) {
        return res.status(404).json({ message: "No active server join record found" });
      }

      res.json({
        message: result.coinsDeducted > 0 
          ? `You left the server within 3 days and lost ${result.coinsDeducted} coins`
          : "You left the server with no coin penalty",
        coinsDeducted: result.coinsDeducted,
        newBalance: result.newBalance,
      });
    } catch (error) {
      console.error("Server leave error:", error);
      res.status(500).json({ message: "Failed to process server leave" });
    }
  });

  // Quest system routes
  app.get("/api/quests", (req, res) => {
    const quests = [
      {
        id: "invite_members",
        title: "Invite New Members",
        description: "Invite 3 new members to the Discord server",
        reward: 15,
        type: "social",
        requirements: {
          count: 3,
          action: "invite"
        }
      },
      {
        id: "daily_login",
        title: "Daily Login",
        description: "Login to the platform daily",
        reward: 5,
        type: "daily",
        requirements: {
          frequency: "daily"
        }
      },
      {
        id: "join_server",
        title: "Join Discord Server",
        description: "Join the official Discord server",
        reward: 10,
        type: "one_time",
        requirements: {
          action: "join_discord"
        }
      }
    ];

    res.json(quests);
  });

  // Get user's quest progress and completions
  app.get("/api/quests/user-progress", requireAuth, async (req, res) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user.id),
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get quest completions from user metadata
      const questData = user.metadata as any || {};
      const completions = questData.questCompletions || [];
      const lastDailyReward = questData.lastDailyReward || null;

      res.json({
        completions,
        lastDailyReward
      });
    } catch (error) {
      console.error("Error fetching user quest progress:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Daily reward endpoint
  app.post("/api/quests/daily-reward", requireAuth, async (req, res) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user.id),
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const questData = user.metadata as any || {};
      const lastDailyReward = questData.lastDailyReward;

      // Check if user can claim daily reward
      if (lastDailyReward) {
        const lastClaim = new Date(lastDailyReward);
        const now = new Date();
        const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastClaim < 24) {
          return res.status(400).json({ message: "Daily reward already claimed. Try again in 24 hours." });
        }
      }

      // Award coins and update last claim time
      const coinsEarned = 2;
      const newCoins = (user.coins || 0) + coinsEarned;
      const newMetadata = {
        ...questData,
        lastDailyReward: new Date().toISOString()
      };

      await db.update(users)
        .set({ 
          coins: newCoins,
          metadata: newMetadata
        })
        .where(eq(users.id, req.user.id));

      res.json({ coinsEarned, totalCoins: newCoins });
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Join server quest endpoint
  app.post("/api/quests/join-server", requireAuth, async (req, res) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user.id),
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const questData = user.metadata as any || {};
      const completions = questData.questCompletions || [];

      // Check if already completed
      if (completions.some((c: any) => c.questId === "join-server")) {
        return res.status(400).json({ message: "Quest already completed" });
      }

      // Check if user is in Discord server (simplified check)
      // In a real implementation, you would verify with Discord API

      // Award coins and mark quest as completed
      const coinsEarned = 2;
      const newCoins = (user.coins || 0) + coinsEarned;
      const newCompletion = {
        questId: "join-server",
        completedAt: new Date().toISOString(),
        reward: coinsEarned
      };

      const newMetadata = {
        ...questData,
        questCompletions: [...completions, newCompletion]
      };

      await db.update(users)
        .set({ 
          coins: newCoins,
          metadata: newMetadata
        })
        .where(eq(users.id, req.user.id));

      res.json({ coinsEarned, totalCoins: newCoins });
    } catch (error) {
      console.error("Error completing join server quest:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Review routes
  app.post("/api/servers/:serverId/reviews", reviewLimiter, validateReview, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { serverId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      // Check if the user has already reviewed this server
      const existingReview = await storage.getReview(serverId, userId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this server." });
      }

      // Check if the user has joined the server (optional, but good for review integrity)
      // This would require a more complex check, potentially involving serverJoin records or Discord API calls

      const newReview = await storage.createReview({
        serverId,
        userId,
        rating,
        review: comment,
      });

      // Update server's average rating
      await storage.updateServerAverageRating(serverId);

      res.status(201).json(newReview);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get("/api/servers/:serverId/reviews", async (req, res) => {
    try {
      const { serverId } = req.params;
      const { limit = "10", offset = "0" } = req.query;
      const reviews = await storage.getReviewsForServer(serverId, { 
        limit: parseInt(limit as string), 
        offset: parseInt(offset as string) 
      });
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Update review (only by the user who wrote it)
  app.put("/api/reviews/:reviewId", reviewLimiter, validateReview, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      const review = await storage.getReviewById(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (review.userId !== userId) {
        return res.status(403).json({ message: "You can only edit your own reviews" });
      }

      const updatedReview = await storage.updateReview(reviewId, {
        rating,
        review: comment,
      });

      // Update server's average rating
      await storage.updateServerAverageRating(review.serverId);

      res.json(updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Delete review (only by the user who wrote it or admin)
  app.delete("/api/reviews/:reviewId", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { reviewId } = req.params;
      const userId = req.user.id;
      const isAdmin = (req.user as any).isAdmin;

      const review = await storage.getReviewById(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (review.userId !== userId && !isAdmin) {
        return res.status(403).json({ message: "You can only delete your own reviews or as an admin" });
      }

      await storage.deleteReview(reviewId);

      // Update server's average rating
      await storage.updateServerAverageRating(review.serverId);

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Comments routes
  app.get("/api/servers/:serverId/comments", async (req, res) => {
    try {
      const { serverId } = req.params;
      const { limit = "20", offset = "0" } = req.query;
      const comments = await storage.getCommentsForServer(serverId, {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/servers/:serverId/comments", requireAuth, async (req, res) => {
    try {
      const { serverId } = req.params;
      const { content, parentId } = req.body;
      const userId = req.user!.id;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content is required" });
      }

      if (content.length > 1000) {
        return res.status(400).json({ message: "Comment too long (max 1000 characters)" });
      }

      const comment = await storage.createComment({
        serverId,
        userId,
        content: content.trim(),
        parentId: parentId || null,
      });

      // Update server comment count
      await storage.incrementServerCommentCount(serverId);

      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.post("/api/comments/:commentId/like", requireAuth, async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;

      const result = await storage.toggleCommentLike(commentId, userId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling comment like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.delete("/api/comments/:commentId", requireAuth, async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;
      const isAdmin = (req.user as any).isAdmin;

      const comment = await storage.getComment(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      if (comment.userId !== userId && !isAdmin) {
        return res.status(403).json({ message: "You can only delete your own comments" });
      }

      await storage.deleteComment(commentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Voting routes
  app.post("/api/servers/:serverId/vote", requireAuth, async (req, res) => {
    try {
      const { serverId } = req.params;
      const { voteType } = req.body;
      const userId = req.user!.id;

      if (!['up', 'down'].includes(voteType)) {
        return res.status(400).json({ message: "Invalid vote type" });
      }

      const result = await storage.voteOnServer(serverId, userId, voteType);
      res.json(result);
    } catch (error) {
      console.error("Error voting on server:", error);
      res.status(500).json({ message: "Failed to vote" });
    }
  });

  app.get("/api/servers/:serverId/vote-status", requireAuth, async (req, res) => {
    try {
      const { serverId } = req.params;
      const userId = req.user!.id;

      const voteStatus = await storage.getUserVoteStatus(serverId, userId);
      res.json(voteStatus);
    } catch (error) {
      console.error("Error fetching vote status:", error);
      res.status(500).json({ message: "Failed to fetch vote status" });
    }
  });

  // Support ticket routes
  app.post("/api/support/ticket", requireAuth, async (req, res) => {
    try {
      const { message } = req.body;
      const userId = req.user!.id;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ message: "Support message is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const ticket = await storage.createSupportTicket({
        userId: userId,
        discordUserId: user.discordId,
        username: user.username,
        message: message.trim(),
        status: 'open',
      });

      // Here you could add Discord DM integration
      // The Discord bot will handle sending DMs to the user and admins

      res.status(201).json({ 
        message: "Support ticket created successfully",
        ticketId: ticket.id 
      });
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.get("/api/support/tickets", requireAdmin, async (req, res) => {
    try {
      const tickets = await storage.getSupportTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  // Blog routes
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const { search, category, limit = "20", offset = "0" } = req.query;
      const posts = await storage.getBlogPosts({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        featured: false,
      });
      // Note: search and category filtering will be implemented when blog table is added
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/featured", async (req, res) => {
    try {
      const posts = await storage.getFeaturedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching featured blog posts:", error);
      res.status(500).json({ message: "Failed to fetch featured blog posts" });
    }
  });

  app.post("/api/blog/posts", requireAdmin, async (req, res) => {
    try {
      const { title, content, excerpt, category, featured } = req.body;
      const authorId = req.user!.id;

      if (!title || !content || !category) {
        return res.status(400).json({ message: "Title, content, and category are required" });
      }

      const post = await storage.createBlogPost({
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        category,
        featured: featured || false,
        authorId,
      });

      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // Partnerships routes
  app.get("/api/partnerships", async (req, res) => {
    try {
      const { search, type, limit = "20", offset = "0" } = req.query;
      const partnerships = await storage.getPartnerships({
        search: search as string,
        type: type as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(partnerships);
    } catch (error) {
      console.error("Error fetching partnerships:", error);
      res.status(500).json({ message: "Failed to fetch partnerships" });
    }
  });

  app.post("/api/partnerships", requireAuth, async (req, res) => {
    try {
      const partnershipData = req.body;
      const partnership = await storage.createPartnership({
        ...partnershipData,
        ownerId: req.user!.id,
      });
      res.status(201).json(partnership);
    } catch (error) {
      console.error("Error creating partnership:", error);
      res.status(500).json({ message: "Failed to create partnership" });
    }
  });

  // Templates routes
  app.get("/api/templates", async (req, res) => {
    try {
      const { search, category, limit = "20", offset = "0" } = req.query;
      const templates = await storage.getServerTemplates({
        search: search as string,
        category: category as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", requireAuth, async (req, res) => {
    try {
      const templateData = req.body;
      const template = await storage.createServerTemplate({
        ...templateData,
        ownerId: req.user!.id,
        templateLink: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.post("/api/templates/analyze", requireAuth, async (req, res) => {
    try {
      const { serverLink } = req.body;
      const inviteCode = serverLink.split('/').pop().split('?')[0];

      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        return res.status(500).json({ message: "Bot token not configured" });
      }

      // Get invite info
      const inviteResponse = await fetch(`https://discord.com/api/v10/invites/${inviteCode}`);
      if (!inviteResponse.ok) {
        return res.status(400).json({ message: "Invalid server link" });
      }

      const inviteData = await inviteResponse.json();
      const guildId = inviteData.guild.id;

      // Get guild channels and roles
      const [channelsResponse, rolesResponse] = await Promise.all([
        fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
          headers: { 'Authorization': `Bot ${botToken}` }
        }),
        fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
          headers: { 'Authorization': `Bot ${botToken}` }
        })
      ]);

      if (!channelsResponse.ok || !rolesResponse.ok) {
        return res.status(400).json({ message: "Bot is not in this server or lacks permissions" });
      }

      const channels = await channelsResponse.json();
      const roles = await rolesResponse.json();

      // Filter out bot-specific roles and @everyone
      const filteredRoles = roles.filter((role: any) => 
        !role.managed && role.name !== '@everyone'
      );

      res.json({
        serverName: inviteData.guild.name,
        serverIcon: inviteData.guild.icon ? 
          `https://cdn.discordapp.com/icons/${guildId}/${inviteData.guild.icon}.png` : null,
        channels: channels.map((channel: any) => ({
          name: channel.name,
          type: channel.type === 4 ? 'category' : channel.type === 2 ? 'voice' : 'text',
          position: channel.position,
          category: channel.parent_id,
        })),
        roles: filteredRoles.map((role: any) => ({
          name: role.name,
          color: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : null,
          permissions: role.permissions,
          position: role.position,
          mentionable: role.mentionable,
        }))
      });
    } catch (error) {
      console.error("Error analyzing server:", error);
      res.status(500).json({ message: "Failed to analyze server" });
    }
  });

  app.post("/api/templates/validate", async (req, res) => {
    try {
      const { templateLink, guildId } = req.body;
      const template = await storage.getTemplateByLink(templateLink);

      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error validating template:", error);
      res.status(500).json({ message: "Failed to validate template" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}