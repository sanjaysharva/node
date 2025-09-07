import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServerSchema, insertBotSchema } from "@shared/schema";
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
  // Auth routes
  app.get("/api/auth/me", (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  app.get("/api/auth/discord", (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/discord/callback`;
    const scope = 'identify email';
    
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    
    res.redirect(discordAuthUrl);
  });

  app.get("/api/auth/discord/callback", async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ message: "Authorization code not provided" });
    }

    try {
      const clientId = process.env.DISCORD_CLIENT_ID;
      const clientSecret = process.env.DISCORD_CLIENT_SECRET;
      const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/discord/callback`;

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
      
      if (!tokenResponse.ok) {
        throw new Error(tokenData.error_description || 'Failed to get access token');
      }

      // Get user info from Discord
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const discordUser = await userResponse.json();
      
      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      // Check if user exists in database
      let user = await storage.getUserByDiscordId(discordUser.id);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          discordId: discordUser.id,
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar,
          email: discordUser.email,
        });
      } else {
        // Update existing user
        user = await storage.updateUser(user.id, {
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar,
          email: discordUser.email,
        });
      }

      // Set user in session (you'll need to implement session management)
      // For now, we'll just redirect to home with user data
      res.redirect(`/?auth=success&user=${encodeURIComponent(JSON.stringify(user))}`);
      
    } catch (error) {
      console.error('Discord OAuth error:', error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.get("/api/auth/logout", (req, res) => {
    // Clear session/cookies here
    res.redirect('/');
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Servers
  app.get("/api/servers", async (req, res) => {
    try {
      const { categoryId, search, limit = "20", offset = "0" } = req.query;
      const servers = await storage.getServers({
        categoryId: categoryId as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(servers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch servers" });
    }
  });

  app.get("/api/servers/popular", async (req, res) => {
    try {
      const { limit = "6" } = req.query;
      const servers = await storage.getPopularServers(parseInt(limit as string));
      res.json(servers);
    } catch (error) {
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

  app.post("/api/servers", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const serverData = insertServerSchema.parse({
        ...req.body,
        ownerId: req.user.id,
      });
      const server = await storage.createServer(serverData);
      res.status(201).json(server);
    } catch (error) {
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
      const { categoryId, search, limit = "20", offset = "0" } = req.query;
      const bots = await storage.getBots({
        categoryId: categoryId as string,
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
      const code = inviteCode.split('/').pop();
      
      // This would normally make a Discord API call
      // For now, return mock data structure
      const mockServerData = {
        name: "Server Name",
        icon: null,
        memberCount: 0,
        onlineCount: 0,
        valid: true
      };

      res.json(mockServerData);
    } catch (error) {
      res.status(500).json({ message: "Failed to validate invite" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
