import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordId: varchar("discord_id").notNull().unique(),
  username: text("username").notNull(),
  discriminator: varchar("discriminator", { length: 4 }),
  avatar: text("avatar"),
  email: text("email"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ads = pgTable("ads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  position: text("position").notNull(), // 'header', 'sidebar', 'footer', 'between-content'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const servers = pgTable("servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  inviteCode: text("invite_code").notNull(),
  icon: text("icon"),
  memberCount: integer("member_count").default(0),
  onlineCount: integer("online_count").default(0),
  categoryId: varchar("category_id").references(() => categories.id),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  tags: text("tags").array().default([]),
  verified: boolean("verified").default(false),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bots = pgTable("bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  botId: varchar("bot_id").notNull().unique(),
  inviteUrl: text("invite_url").notNull(),
  avatar: text("avatar"),
  serverCount: integer("server_count").default(0),
  categoryId: varchar("category_id").references(() => categories.id),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  tags: text("tags").array().default([]),
  verified: boolean("verified").default(false),
  featured: boolean("featured").default(false),
  prefix: text("prefix"),
  iconUrl: text("icon_url"),
  bannerUrl: text("banner_url"),
  uses: text("uses").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  servers: many(servers),
  bots: many(bots),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  servers: many(servers),
  bots: many(bots),
}));

export const serversRelations = relations(servers, ({ one }) => ({
  category: one(categories, {
    fields: [servers.categoryId],
    references: [categories.id],
  }),
  owner: one(users, {
    fields: [servers.ownerId],
    references: [users.id],
  }),
}));

export const botsRelations = relations(bots, ({ one }) => ({
  category: one(categories, {
    fields: [bots.categoryId],
    references: [categories.id],
  }),
  owner: one(users, {
    fields: [bots.ownerId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertServerSchema = createInsertSchema(servers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Server = typeof servers.$inferSelect;
export type InsertServer = z.infer<typeof insertServerSchema>;
export type Bot = typeof bots.$inferSelect;
export type InsertBot = z.infer<typeof insertBotSchema>;
export type Ad = typeof ads.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;