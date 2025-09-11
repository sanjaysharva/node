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
  discordAccessToken: text("discord_access_token"),
  coins: integer("coins").default(0),
  inviteCount: integer("invite_count").default(0),
  serversJoined: integer("servers_joined").default(0),
  dailyLoginStreak: integer("daily_login_streak").default(0),
  referralCount: integer("referral_count").default(0),
  questsClaimed: text("quests_claimed").array().default([]),
  lastLoginDate: timestamp("last_login_date"),
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


export const servers = pgTable("servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  inviteCode: text("invite_code").notNull(),
  icon: text("icon"),
  banner: text("banner"),
  memberCount: integer("member_count").default(0),
  onlineCount: integer("online_count").default(0),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  tags: text("tags").array().default([]),
  language: text("language").default("English"),
  timezone: text("timezone").default("UTC"),
  activityLevel: text("activity_level").default("Medium"), // Low, Medium, High
  verified: boolean("verified").default(false),
  featured: boolean("featured").default(false),
  isAdvertising: boolean("is_advertising").default(false),
  advertisingMembersNeeded: integer("advertising_members_needed").default(0),
  advertisingUserId: varchar("advertising_user_id").references(() => users.id),
  bumpEnabled: boolean("bump_enabled").default(false),
  lastBumpAt: timestamp("last_bump_at"),
  discordId: text("discord_id").unique(),
  averageRating: integer("average_rating").default(0),
  totalReviews: integer("total_reviews").default(0),
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


export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").references(() => servers.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userServerUnique: sql`UNIQUE (${table.userId}, ${table.serverId})`
}));


});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventType: text("event_type").notNull(), // Type of event (tournament, giveaway, community, etc.)
  imageUrl: text("image_url"), // Poster of event
  serverLink: text("server_link"), // Discord server link
  rewards: text("rewards"), // Event rewards description
  requirements: text("requirements"), // Event requirements/rules
  maxParticipants: integer("max_participants"), // Maximum number of participants
  registrationDeadline: timestamp("registration_deadline"), // Registration deadline
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: text("location"),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  featured: boolean("featured").default(false),
  isActive: boolean("is_active").default(true),
  registrationCount: integer("registration_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const slideshows = pgTable("slideshows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  position: integer("position").default(0),
  page: text("page").notNull(), // 'explore', 'events'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const serverJoins = pgTable("server_joins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  serverId: varchar("server_id").references(() => servers.id).notNull(),
  coinsEarned: integer("coins_earned").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Composite unique index prevents duplicate coin awards for same user+server
  userServerUnique: sql`UNIQUE (${table.userId}, ${table.serverId})`
}));

export const bumpChannels = pgTable("bump_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guildId: text("guild_id").notNull().unique(),
  channelId: text("channel_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  servers: many(servers),
  bots: many(bots),
  events: many(events),
  serverJoins: many(serverJoins),
}));

export const serversRelations = relations(servers, ({ one, many }) => ({
  owner: one(users, {
    fields: [servers.ownerId],
    references: [users.id],
  }),
  advertiser: one(users, {
    fields: [servers.advertisingUserId],
    references: [users.id],
  }),
  joins: many(serverJoins),
  reviews: many(reviews),
}));

export const botsRelations = relations(bots, ({ one }) => ({
  owner: one(users, {
    fields: [bots.ownerId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  owner: one(users, {
    fields: [events.ownerId],
    references: [users.id],
  }),
}));

export const serverJoinsRelations = relations(serverJoins, ({ one }) => ({
  user: one(users, {


export const reviewsRelations = relations(reviews, ({ one }) => ({
  server: one(servers, {
    fields: [reviews.serverId],
    references: [servers.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));


    fields: [serverJoins.userId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [serverJoins.serverId],
    references: [servers.id],
  }),
}));

export const bumpChannelsRelations = relations(bumpChannels, ({ one }) => ({
  // No direct relations needed for now
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
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

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSlideshowSchema = createInsertSchema(slideshows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServerJoinSchema = createInsertSchema(serverJoins).omit({
  id: true,
  createdAt: true,
});

export const insertBumpChannelSchema = createInsertSchema(bumpChannels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Server = typeof servers.$inferSelect;
export type InsertServer = z.infer<typeof insertServerSchema>;
export type Bot = typeof bots.$inferSelect;
export type InsertBot = z.infer<typeof insertBotSchema>;
export type Ad = typeof ads.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Slideshow = typeof slideshows.$inferSelect;
export type InsertSlideshow = z.infer<typeof insertSlideshowSchema>;
export type ServerJoin = typeof serverJoins.$inferSelect;
export type InsertServerJoin = z.infer<typeof insertServerJoinSchema>;
export type BumpChannel = typeof bumpChannels.$inferSelect;
export type InsertBumpChannel = z.infer<typeof insertBumpChannelSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;