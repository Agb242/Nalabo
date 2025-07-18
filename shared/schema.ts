import { pgTable, text, serial, integer, boolean, timestamp, json, pgSchema } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Sessions table (for connect-pg-simple)
export const userSessions = pgTable("user_sessions", {
  sid: text("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { withTimezone: true, precision: 6 }).notNull()
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("user"), // user, admin, moderator
  avatar: text("avatar"),
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_updatedAt").defaultNow(),
});

// Workshops table
export const workshops = pgTable("workshops", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  creatorId: integer("creator_id").references(() => users.id),
  category: text("category").notNull(), // docker, kubernetes, ai-ml, etc.
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced, expert
  estimatedDuration: integer("estimated_duration"), // in minutes
  status: text("status").notNull().default("draft"), // draft, published, archived
  template: text("template"), // template type used
  steps: json("steps"), // workshop steps as JSON
  environmentConfig: json("environment_config"), // container config
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workshop sessions table
export const workshopSessions = pgTable("workshop_sessions", {
  id: serial("id").primaryKey(),
  workshopId: integer("workshop_id").references(() => workshops.id),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull().default("started"), // started, completed, failed
  progress: json("progress"), // step progress as JSON
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent").default(0), // in minutes
});

// Challenges table
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  creatorId: integer("creator_id").references(() => users.id),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  points: integer("points").notNull(),
  deadline: timestamp("deadline"),
  isActive: boolean("is_active").default(true),
  rules: json("rules"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Challenge participations table
export const challengeParticipations = pgTable("challenge_participations", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => challenges.id),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull().default("in_progress"), // in_progress, completed, failed
  score: integer("score").default(0),
  submittedAt: timestamp("submitted_at"),
  completedAt: timestamp("completed_at"),
});

// Certifications table
export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  issuer: text("issuer").notNull().default("Nalabo"),
  issuedAt: timestamp("issued_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  badgeUrl: text("badge_url"),
  verificationCode: text("verification_code").unique(),
});

// Communities table
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").references(() => users.id),
  isPrivate: boolean("is_private").default(false),
  settings: json("settings"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community memberships table
export const communityMemberships = pgTable("community_memberships", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  userId: integer("user_id").references(() => users.id),
  role: text("role").notNull().default("member"), // member, moderator, admin
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workshops: many(workshops),
  workshopSessions: many(workshopSessions),
  challenges: many(challenges),
  challengeParticipations: many(challengeParticipations),
  certifications: many(certifications),
  communities: many(communities),
  communityMemberships: many(communityMemberships),
}));

export const workshopsRelations = relations(workshops, ({ one, many }) => ({
  creator: one(users, {
    fields: [workshops.creatorId],
    references: [users.id],
  }),
  sessions: many(workshopSessions),
}));

export const workshopSessionsRelations = relations(workshopSessions, ({ one }) => ({
  workshop: one(workshops, {
    fields: [workshopSessions.workshopId],
    references: [workshops.id],
  }),
  user: one(users, {
    fields: [workshopSessions.userId],
    references: [users.id],
  }),
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  creator: one(users, {
    fields: [challenges.creatorId],
    references: [users.id],
  }),
  participations: many(challengeParticipations),
}));

export const challengeParticipationsRelations = relations(challengeParticipations, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeParticipations.challengeId],
    references: [challenges.id],
  }),
  user: one(users, {
    fields: [challengeParticipations.userId],
    references: [users.id],
  }),
}));

export const certificationsRelations = relations(certifications, ({ one }) => ({
  user: one(users, {
    fields: [certifications.userId],
    references: [users.id],
  }),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  owner: one(users, {
    fields: [communities.ownerId],
    references: [users.id],
  }),
  memberships: many(communityMemberships),
}));

export const communityMembershipsRelations = relations(communityMemberships, ({ one }) => ({
  community: one(communities, {
    fields: [communityMemberships.communityId],
    references: [communities.id],
  }),
  user: one(users, {
    fields: [communityMemberships.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkshopSchema = createInsertSchema(workshops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkshopSessionSchema = createInsertSchema(workshopSessions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeParticipationSchema = createInsertSchema(challengeParticipations).omit({
  id: true,
  submittedAt: true,
  completedAt: true,
});

export const insertCertificationSchema = createInsertSchema(certifications).omit({
  id: true,
  issuedAt: true,
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityMembershipSchema = createInsertSchema(communityMemberships).omit({
  id: true,
  joinedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Workshop = typeof workshops.$inferSelect;
export type InsertWorkshop = z.infer<typeof insertWorkshopSchema>;
export type WorkshopSession = typeof workshopSessions.$inferSelect;
export type InsertWorkshopSession = z.infer<typeof insertWorkshopSessionSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type ChallengeParticipation = typeof challengeParticipations.$inferSelect;
export type InsertChallengeParticipation = z.infer<typeof insertChallengeParticipationSchema>;
export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type CommunityMembership = typeof communityMemberships.$inferSelect;
export type InsertCommunityMembership = z.infer<typeof insertCommunityMembershipSchema>;