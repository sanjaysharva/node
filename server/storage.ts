import { users, servers, bots, categories, ads, type User, type InsertUser, type Server, type InsertServer, type Bot, type InsertBot, type Category, type InsertCategory, type Ad, type InsertAd } from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, and, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Server operations
  getServers(options?: { categoryId?: string; tags?: string[]; search?: string; limit?: number; offset?: number }): Promise<Server[]>;
  getPopularServers(limit?: number): Promise<Server[]>;
  getServer(id: string): Promise<Server | undefined>;
  getServersByOwner(ownerId: string): Promise<Server[]>;
  createServer(server: InsertServer): Promise<Server>;
  updateServer(id: string, server: Partial<InsertServer>): Promise<Server | undefined>;
  deleteServer(id: string): Promise<boolean>;

  // Bot operations
  getBots(options?: { categoryId?: string; tags?: string[]; search?: string; limit?: number; offset?: number }): Promise<Bot[]>;
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

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  // Server operations
  async getServers(options?: { categoryId?: string; tags?: string[]; search?: string; limit?: number; offset?: number }): Promise<Server[]> {
    const conditions = [];

    if (options?.categoryId) {
      conditions.push(eq(servers.categoryId, options.categoryId));
    }

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
  async getBots(options?: { categoryId?: string; tags?: string[]; search?: string; limit?: number; offset?: number }): Promise<Bot[]> {
    const conditions = [];

    if (options?.categoryId) {
      conditions.push(eq(bots.categoryId, options.categoryId));
    }

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
}

export const storage = new DatabaseStorage();