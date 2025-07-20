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
  role: text("role").notNull().default("user"), // user, community_admin, super_admin
  avatar: text("avatar"),
  points: integer("points").default(0),
  subscription: text("subscription").default("free"), // free, premium, enterprise
  communityId: integer("community_id").references(() => communities.id),
  permissions: json("permissions"), // Custom permissions for different roles
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workshops table
export const workshops = pgTable("workshops", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  creatorId: integer("creator_id").references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  category: text("category").notNull(), // docker, kubernetes, ai-ml, etc.
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced, expert
  estimatedDuration: integer("estimated_duration"), // in minutes
  status: text("status").notNull().default("draft"), // draft, published, archived
  template: text("template"), // template type used
  steps: json("steps"), // workshop steps as JSON with tools and documents
  environmentConfig: json("environment_config"), // vCluster and K8s config
  kubernetesTools: json("kubernetes_tools"), // kubectl, helm, kustomize, etc.
  requiredResources: json("required_resources"), // CPU, memory, storage
  documents: json("documents"), // PDF/MD documents attached to workshop
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(true),
  vclusterTemplate: text("vcluster_template"), // vCluster configuration template
  isolationLevel: text("isolation_level").default("standard"), // standard, high, enterprise
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
  subscription: text("subscription").default("free"), // free, premium, enterprise
  k8sClusterId: integer("k8s_cluster_id").references(() => kubernetesInfrastructure.id),
  settings: json("settings"),
  permissions: json("permissions"), // What the community can do
  resourceLimits: json("resource_limits"), // CPU, memory, storage limits
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

// Kubernetes Infrastructure table
export const kubernetesInfrastructure = pgTable("kubernetes_infrastructure", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  kubeconfig: text("kubeconfig").notNull(), // Base64 encoded kubeconfig
  endpoint: text("endpoint").notNull(),
  region: text("region"),
  provider: text("provider").notNull(), // aws, gcp, azure, on-premise
  status: text("status").notNull().default("active"), // active, inactive, maintenance
  resourceLimits: json("resource_limits"), // Overall cluster limits
  vclusterEnabled: boolean("vcluster_enabled").default(true),
  managedById: integer("managed_by_id").references(() => users.id), // Super admin who manages this cluster
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// vCluster instances for workshop isolation
export const vclusterInstances = pgTable("vcluster_instances", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  workshopId: integer("workshop_id").references(() => workshops.id),
  userId: integer("user_id").references(() => users.id),
  clusterId: integer("cluster_id").references(() => kubernetesInfrastructure.id),
  namespace: text("namespace").notNull(),
  status: text("status").notNull().default("creating"), // creating, ready, running, stopped, failed
  vclusterConfig: json("vcluster_config"), // vCluster specific configuration
  accessConfig: json("access_config"), // Kubeconfig for user access
  resourceUsage: json("resource_usage"), // Current resource consumption
  expiresAt: timestamp("expires_at"), // When this vCluster will be cleaned up
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workshop Documents table
export const workshopDocuments = pgTable("workshop_documents", {
  id: serial("id").primaryKey(),
  workshopId: integer("workshop_id").references(() => workshops.id),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(), // pdf, md, txt, etc.
  fileSize: integer("file_size").notNull(), // in bytes
  filePath: text("file_path").notNull(), // Storage path
  stepIndex: integer("step_index"), // Which step this document belongs to (optional)
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  uploadedById: integer("uploaded_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Infrastructure Audit Log
export const infrastructureAuditLog = pgTable("infrastructure_audit_log", {
  id: serial("id").primaryKey(),
  clusterId: integer("cluster_id").references(() => kubernetesInfrastructure.id),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // create, update, delete, deploy, access
  resource: text("resource").notNull(), // cluster, vcluster, workshop, user
  resourceId: text("resource_id"),
  details: json("details"), // Action details
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  workshops: many(workshops),
  workshopSessions: many(workshopSessions),
  challenges: many(challenges),
  challengeParticipations: many(challengeParticipations),
  certifications: many(certifications),
  communities: many(communities),
  communityMemberships: many(communityMemberships),
  managedClusters: many(kubernetesInfrastructure),
  vclusterInstances: many(vclusterInstances),
  uploadedDocuments: many(workshopDocuments),
  community: one(communities, {
    fields: [users.communityId],
    references: [communities.id],
  }),
}));

export const workshopsRelations = relations(workshops, ({ one, many }) => ({
  creator: one(users, {
    fields: [workshops.creatorId],
    references: [users.id],
  }),
  community: one(communities, {
    fields: [workshops.communityId],
    references: [communities.id],
  }),
  sessions: many(workshopSessions),
  vclusterInstances: many(vclusterInstances),
  documents: many(workshopDocuments),
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

// New relations for infrastructure tables
export const kubernetesInfrastructureRelations = relations(kubernetesInfrastructure, ({ one, many }) => ({
  managedBy: one(users, {
    fields: [kubernetesInfrastructure.managedById],
    references: [users.id],
  }),
  vclusterInstances: many(vclusterInstances),
  communities: many(communities),
}));

export const vclusterInstancesRelations = relations(vclusterInstances, ({ one }) => ({
  workshop: one(workshops, {
    fields: [vclusterInstances.workshopId],
    references: [workshops.id],
  }),
  user: one(users, {
    fields: [vclusterInstances.userId],
    references: [users.id],
  }),
  cluster: one(kubernetesInfrastructure, {
    fields: [vclusterInstances.clusterId],
    references: [kubernetesInfrastructure.id],
  }),
}));

export const workshopDocumentsRelations = relations(workshopDocuments, ({ one }) => ({
  workshop: one(workshops, {
    fields: [workshopDocuments.workshopId],
    references: [workshops.id],
  }),
  uploadedBy: one(users, {
    fields: [workshopDocuments.uploadedById],
    references: [users.id],
  }),
}));

export const infrastructureAuditLogRelations = relations(infrastructureAuditLog, ({ one }) => ({
  cluster: one(kubernetesInfrastructure, {
    fields: [infrastructureAuditLog.clusterId],
    references: [kubernetesInfrastructure.id],
  }),
  user: one(users, {
    fields: [infrastructureAuditLog.userId],
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

// New insert schemas for infrastructure tables
export const insertKubernetesInfrastructureSchema = createInsertSchema(kubernetesInfrastructure).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVclusterInstanceSchema = createInsertSchema(vclusterInstances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkshopDocumentSchema = createInsertSchema(workshopDocuments).omit({
  id: true,
  createdAt: true,
});

export const insertInfrastructureAuditLogSchema = createInsertSchema(infrastructureAuditLog).omit({
  id: true,
  timestamp: true,
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

// New types for infrastructure tables
export type KubernetesInfrastructure = typeof kubernetesInfrastructure.$inferSelect;
export type InsertKubernetesInfrastructure = z.infer<typeof insertKubernetesInfrastructureSchema>;
export type VclusterInstance = typeof vclusterInstances.$inferSelect;
export type InsertVclusterInstance = z.infer<typeof insertVclusterInstanceSchema>;
export type WorkshopDocument = typeof workshopDocuments.$inferSelect;
export type InsertWorkshopDocument = z.infer<typeof insertWorkshopDocumentSchema>;
export type InfrastructureAuditLog = typeof infrastructureAuditLog.$inferSelect;
export type InsertInfrastructureAuditLog = z.infer<typeof insertInfrastructureAuditLogSchema>;

// Enhanced workshop step schema for tools and documents
export const WorkshopStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string(), // Markdown content
  tools: z.array(z.object({
    name: z.string(), // kubectl, helm, kustomize, etc.
    version: z.string().optional(),
    config: z.record(z.any()).optional(),
  })).default([]),
  documents: z.array(z.object({
    id: z.number(),
    fileName: z.string(),
    description: z.string(),
    type: z.enum(['pdf', 'md', 'txt']),
  })).default([]),
  validation: z.object({
    commands: z.array(z.string()).optional(), // Commands to validate step completion
    expectedOutput: z.string().optional(),
  }).optional(),
  estimatedDuration: z.number().optional(), // minutes
});

export type WorkshopStep = z.infer<typeof WorkshopStepSchema>;

// Permissions schema for role-based access conformément RGPD et réglementations
export const PermissionsSchema = z.object({
  // Gestion Infrastructure (Cluster K8s, vCluster, monitoring)
  infrastructure: z.object({
    view: z.boolean().default(false),           // Voir clusters et métriques
    create: z.boolean().default(false),         // Ajouter nouveaux clusters
    update: z.boolean().default(false),         // Modifier configuration clusters
    delete: z.boolean().default(false),         // Supprimer clusters (avec safeguards)
    monitor: z.boolean().default(false),        // Accès monitoring avancé
    deploy: z.boolean().default(false),         // Déployer sur infrastructure
  }).default({}),
  
  // Gestion Ateliers (contenu, modération, publication)
  workshops: z.object({
    create: z.boolean().default(true),          // Créer ateliers (tous utilisateurs)
    publish: z.boolean().default(false),        // Publier publiquement
    moderate: z.boolean().default(false),       // Modérer contenu communauté
    delete: z.boolean().default(false),         // Supprimer ateliers autres users
    featured: z.boolean().default(false),       // Marquer comme "featured"
    analytics: z.boolean().default(false),      // Voir analytics détaillées
  }).default({}),
  
  // Gestion Utilisateurs (conformité RGPD)
  users: z.object({
    view: z.boolean().default(false),           // Voir liste utilisateurs
    viewPersonalData: z.boolean().default(false), // Accès données personnelles (RGPD)
    manage: z.boolean().default(false),         // Modifier profils utilisateurs
    suspend: z.boolean().default(false),        // Suspendre/bannir utilisateurs
    delete: z.boolean().default(false),         // Supprimer comptes (avec logs)
    exportData: z.boolean().default(false),     // Export données (droit RGPD)
    anonymize: z.boolean().default(false),      // Anonymiser données (RGPD)
  }).default({}),
  
  // Gestion Communautés (organisations, abonnements)
  communities: z.object({
    view: z.boolean().default(false),           // Voir toutes communautés
    create: z.boolean().default(false),         // Créer communautés
    manage: z.boolean().default(false),         // Gérer communautés existantes
    billing: z.boolean().default(false),        // Gérer facturation communautés
    suspend: z.boolean().default(false),        // Suspendre communautés
  }).default({}),
  
  // Gestion Facturation et Abonnements
  billing: z.object({
    view: z.boolean().default(false),           // Voir données financières
    manage: z.boolean().default(false),         // Modifier plans/prix
    refund: z.boolean().default(false),         // Effectuer remboursements
    analytics: z.boolean().default(false),      // Analytics financières
  }).default({}),
  
  // Administration Système (logs, audit, sécurité)
  system: z.object({
    auditLogs: z.boolean().default(false),      // Accès logs d'audit
    backups: z.boolean().default(false),        // Gestion sauvegardes
    maintenance: z.boolean().default(false),    // Mode maintenance
    settings: z.boolean().default(false),       // Paramètres globaux
    security: z.boolean().default(false),       // Paramètres sécurité
    compliance: z.boolean().default(false),     // Outils conformité RGPD
  }).default({}),
  
  // Droits légaux et conformité
  legal: z.object({
    dataProcessing: z.boolean().default(false), // Traitement données personnelles
    gdprRequests: z.boolean().default(false),   // Traiter demandes RGPD
    legalNotices: z.boolean().default(false),   // Modifier mentions légales
    termsOfService: z.boolean().default(false), // Modifier CGU/CGV
  }).default({}),
});

export type Permissions = z.infer<typeof PermissionsSchema>;