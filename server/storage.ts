import { users, servers, bots, ads, serverJoins, slideshows, events, type User, type InsertUser, type Server, type InsertServer, type Bot, type InsertBot, type Ad, type InsertAd, type ServerJoin, type InsertServerJoin, type Slideshow, type InsertSlideshow, type Event, type InsertEvent } from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, and, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Server operations
  getServers(options?: { tags?: string[]; search?: string; limit?: number; offset?: number }): Promise<Server[]>;
  getPopularServers(limit?: number): Promise<Server[]>;
  getServer(id: string): Promise<Server | undefined>;
  getServersByOwner(ownerId: string): Promise<Server[]>;
  createServer(server: InsertServer): Promise<Server>;
  updateServer(id: string, server: Partial<InsertServer>): Promise<Server | undefined>;
  deleteServer(id: string): Promise<boolean>;

  // Bot operations
  getBots(options?: { tags?: string[]; search?: string; limit?: number; offset?: number }): Promise<Bot[]>;
  getPopularBots(limit?: number): Promise<Bot[]>;
  getBot(id: string): Promise<Bot | undefined>;
  getBotsByOwner(ownerId: string): Promise<Bot[]>;
  createBot(bot: InsertBot): Promise<Bot>;
  updateBot(id: string, bot: Partial<InsertBot>): Promise<Bot | undefined>;
  deleteBot(id: string): Promise<boolean>;

  // Ad operations
  getAds(position?: string): Promise<Ad[]>;
  getAd(id: string): Promise<Ad | undefined>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: string, ad: Partial<InsertAd>): Promise<Ad | undefined>;
  deleteAd(id: string): Promise<boolean>;

  // Wallet operations
  getAdvertisingServers(): Promise<Server[]>;
  createServerJoin(join: InsertServerJoin): Promise<ServerJoin>;
  hasUserJoinedServer(userId: string, serverId: string): Promise<boolean>;
  updateUserCoins(userId: string, coins: number): Promise<User | undefined>;
  atomicServerJoin(params: { userId: string; serverId: string; coinsToAward: number; currentCoins: number; advertisingMembersNeeded: number }): Promise<{ newBalance: number; advertisingComplete: boolean }>;

  // Slideshow operations
  getSlideshows(page?: string): Promise<Slideshow[]>;

  // Event operations
  getEvents(options?: { search?: string; limit?: number; offset?: number }): Promise<Event[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updatedUser || undefined;
  }

  // Server operations
  async getServers(options?: { tags?: string[]; search?: string; limit?: number; offset?: number }): Promise<Server[]> {
    const conditions = [];

    if (options?.search) {
      conditions.push(
        or(
          ilike(servers.name, `%${options.search}%`),
          ilike(servers.description, `%${options.search}%`)
        )
      );
    }

    // Build complete query with all conditions
    const baseQuery = db.select().from(servers);
    const withWhere = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    const withOrder = withWhere.orderBy(desc(servers.memberCount));
    const withLimit = options?.limit ? withOrder.limit(options.limit) : withOrder;
    const finalQuery = options?.offset ? withLimit.offset(options.offset) : withLimit;

    return await finalQuery;
  }

  async getPopularServers(limit = 6): Promise<Server[]> {
    return await db.select().from(servers)
      .orderBy(desc(servers.memberCount))
      .limit(limit);
  }

  async getServer(id: string): Promise<Server | undefined> {
    const [server] = await db.select().from(servers).where(eq(servers.id, id));
    return server || undefined;
  }

  async getServersByOwner(ownerId: string): Promise<Server[]> {
    return await db.select().from(servers).where(eq(servers.ownerId, ownerId));
  }

  async createServer(insertServer: InsertServer): Promise<Server> {
    const [server] = await db.insert(servers).values(insertServer).returning();
    return server;
  }

  async updateServer(id: string, server: Partial<InsertServer>): Promise<Server | undefined> {
    const [updatedServer] = await db.update(servers).set({ ...server, updatedAt: new Date() }).where(eq(servers.id, id)).returning();
    return updatedServer || undefined;
  }

  async deleteServer(id: string): Promise<boolean> {
    const result = await db.delete(servers).where(eq(servers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Bot operations
  async getBots(options?: { tags?: string[]; search?: string; limit?: number; offset?: number }): Promise<Bot[]> {
    const conditions = [];

    if (options?.search) {
      conditions.push(
        or(
          ilike(bots.name, `%${options.search}%`),
          ilike(bots.description, `%${options.search}%`)
        )
      );
    }

    // Build complete query with all conditions
    const baseQuery = db.select().from(bots);
    const withWhere = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    const withOrder = withWhere.orderBy(desc(bots.serverCount));
    const withLimit = options?.limit ? withOrder.limit(options.limit) : withOrder;
    const finalQuery = options?.offset ? withLimit.offset(options.offset) : withLimit;

    return await finalQuery;
  }

  async getPopularBots(limit = 6): Promise<Bot[]> {
    return await db.select().from(bots)
      .orderBy(desc(bots.serverCount))
      .limit(limit);
  }

  async getBot(id: string): Promise<Bot | undefined> {
    const [bot] = await db.select().from(bots).where(eq(bots.id, id));
    return bot || undefined;
  }

  async getBotsByOwner(ownerId: string): Promise<Bot[]> {
    return await db.select().from(bots).where(eq(bots.ownerId, ownerId));
  }

  async createBot(insertBot: InsertBot): Promise<Bot> {
    const [bot] = await db.insert(bots).values(insertBot).returning();
    return bot;
  }

  async updateBot(id: string, bot: Partial<InsertBot>): Promise<Bot | undefined> {
    const [updatedBot] = await db.update(bots).set({ ...bot, updatedAt: new Date() }).where(eq(bots.id, id)).returning();
    return updatedBot || undefined;
  }

  async deleteBot(id: string): Promise<boolean> {
    const result = await db.delete(bots).where(eq(bots.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Ad operations
  async getAds(position?: string): Promise<Ad[]> {
    const conditions = [eq(ads.isActive, true)];
    
    if (position) {
      conditions.push(eq(ads.position, position));
    }

    return await db.select().from(ads)
      .where(and(...conditions))
      .orderBy(desc(ads.createdAt));
  }

  async getAd(id: string): Promise<Ad | undefined> {
    const [ad] = await db.select().from(ads).where(eq(ads.id, id));
    return ad || undefined;
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const [ad] = await db.insert(ads).values(insertAd).returning();
    return ad;
  }

  async updateAd(id: string, ad: Partial<InsertAd>): Promise<Ad | undefined> {
    const [updatedAd] = await db.update(ads).set({ ...ad, updatedAt: new Date() }).where(eq(ads.id, id)).returning();
    return updatedAd || undefined;
  }

  async deleteAd(id: string): Promise<boolean> {
    const result = await db.delete(ads).where(eq(ads.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Wallet operations
  async getAdvertisingServers(): Promise<Server[]> {
    return await db.select().from(servers)
      .where(eq(servers.isAdvertising, true))
      .orderBy(desc(servers.memberCount));
  }

  async createServerJoin(join: InsertServerJoin): Promise<ServerJoin> {
    const [serverJoin] = await db.insert(serverJoins).values(join).returning();
    return serverJoin;
  }

  async hasUserJoinedServer(userId: string, serverId: string): Promise<boolean> {
    const [join] = await db.select().from(serverJoins)
      .where(and(eq(serverJoins.userId, userId), eq(serverJoins.serverId, serverId)));
    return !!join;
  }

  async updateUserCoins(userId: string, coins: number): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ coins })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // Slideshow operations
  async getSlideshows(page?: string): Promise<Slideshow[]> {
    const conditions = [eq(slideshows.isActive, true)];
    
    if (page) {
      conditions.push(eq(slideshows.page, page));
    }

    return await db.select().from(slideshows)
      .where(and(...conditions))
      .orderBy(slideshows.position, desc(slideshows.createdAt));
  }

  // Event operations
  async getEvents(options?: { search?: string; limit?: number; offset?: number }): Promise<Event[]> {
    const conditions = [];

    if (options?.search) {
      conditions.push(
        or(
          ilike(events.title, `%${options.search}%`),
          ilike(events.description, `%${options.search}%`)
        )
      );
    }

    const baseQuery = db.select().from(events);
    const withWhere = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    const withOrder = withWhere.orderBy(desc(events.startDate));
    const withLimit = options?.limit ? withOrder.limit(options.limit) : withOrder;
    const finalQuery = options?.offset ? withLimit.offset(options.offset) : withLimit;

    return await finalQuery;
  }

  // ATOMIC SERVER JOIN: Prevents race conditions and double-awarding of coins
  async atomicServerJoin(params: { 
    userId: string; 
    serverId: string; 
    coinsToAward: number;
  }): Promise<{ newBalance: number; advertisingComplete: boolean }> {
    const { userId, serverId, coinsToAward } = params;
    
    return await db.transaction(async (tx) => {
      // Fetch current user and server state inside transaction for consistency
      const [currentUser] = await tx.select({ coins: users.coins }).from(users)
        .where(eq(users.id, userId));
      
      const [currentServer] = await tx.select({ 
        advertisingMembersNeeded: servers.advertisingMembersNeeded,
        isAdvertising: servers.isAdvertising 
      }).from(servers)
        .where(eq(servers.id, serverId));
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      if (!currentServer) {
        throw new Error("Server not found");
      }
      if (!currentServer.isAdvertising || (currentServer.advertisingMembersNeeded || 0) <= 0) {
        throw new Error("Server is not currently advertising or quota exhausted");
      }

      try {
        // Insert server join record - unique constraint will prevent duplicates
        await tx.insert(serverJoins).values({
          userId,
          serverId,
          coinsEarned: coinsToAward,
        });
      } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          throw new Error("You have already earned coins from this server");
        }
        throw error;
      }

      // Atomically increment user coins using SQL operation (prevents lost updates)
      const [updatedUser] = await tx.update(users)
        .set({ coins: sql`${users.coins} + ${coinsToAward}` })
        .where(eq(users.id, userId))
        .returning({ coins: users.coins });

      if (!updatedUser) {
        throw new Error("Failed to update user coins");
      }

      // Conditionally update advertising accounting with WHERE guards
      const newMembersNeeded = Math.max(0, (currentServer.advertisingMembersNeeded || 0) - 1);
      const advertisingComplete = newMembersNeeded <= 0;
      
      const serverUpdateResult = await tx.update(servers)
        .set({ 
          advertisingMembersNeeded: newMembersNeeded,
          isAdvertising: !advertisingComplete,
        })
        .where(and(
          eq(servers.id, serverId),
          eq(servers.isAdvertising, true),
          sql`${servers.advertisingMembersNeeded} > 0`
        ))
        .returning({ id: servers.id });

      if (serverUpdateResult.length === 0) {
        throw new Error("Server advertising quota was exhausted during transaction");
      }

      return { 
        newBalance: updatedUser.coins || 0, 
        advertisingComplete 
      };
    });
  }
}

export const storage = new DatabaseStorage();