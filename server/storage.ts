import { 
  users, workshops, workshopSessions, challenges, challengeParticipations, certifications, communities, communityMemberships,
  kubernetesInfrastructure, vclusterInstances, workshopDocuments, infrastructureAuditLog,
  type User, type InsertUser, type Workshop, type InsertWorkshop, type WorkshopSession, type InsertWorkshopSession,
  type Challenge, type InsertChallenge, type ChallengeParticipation, type InsertChallengeParticipation,
  type Certification, type InsertCertification, type Community, type InsertCommunity,
  type CommunityMembership, type InsertCommunityMembership, type KubernetesInfrastructure, type InsertKubernetesInfrastructure,
  type VclusterInstance, type InsertVclusterInstance, type WorkshopDocument, type InsertWorkshopDocument,
  type InfrastructureAuditLog, type InsertInfrastructureAuditLog
} from "@shared/schema";
import type { KubernetesCluster } from "./services/infrastructure-manager";
import { db } from "./db";
import { eq, desc, and, count } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;

  // Workshops
  getWorkshops(): Promise<Workshop[]>;
  getWorkshop(id: number): Promise<Workshop | undefined>;
  createWorkshop(insertWorkshop: InsertWorkshop): Promise<Workshop>;
  updateWorkshop(id: number, updateData: Partial<InsertWorkshop>): Promise<Workshop | undefined>;

  // Workshop Sessions
  getWorkshopSession(id: number): Promise<WorkshopSession | undefined>;
  createWorkshopSession(insertSession: InsertWorkshopSession): Promise<WorkshopSession>;
  updateWorkshopSession(id: number, updateData: Partial<InsertWorkshopSession>): Promise<WorkshopSession | undefined>;

  // Challenges
  getChallenges(): Promise<Challenge[]>;
  getActiveChallenges(): Promise<Challenge[]>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  createChallenge(insertChallenge: InsertChallenge): Promise<Challenge>;
  createChallengeParticipation(insertParticipation: InsertChallengeParticipation): Promise<ChallengeParticipation>;

  // Analytics
  getLeaderboard(): Promise<any[]>;
  getAnalyticsStats(): Promise<any>;
  getUserWorkshops(userId: number): Promise<Workshop[]>;
  getUserSessions(userId: number): Promise<WorkshopSession[]>;

  // Kubernetes Clusters
  getKubernetesClusters(): Promise<KubernetesCluster[]>;
  getKubernetesCluster(id: string): Promise<KubernetesCluster | undefined>;
  createKubernetesCluster(cluster: KubernetesCluster): Promise<KubernetesCluster>;
  updateKubernetesCluster(id: string, updates: Partial<KubernetesCluster>): Promise<KubernetesCluster | undefined>;
  deleteKubernetesCluster(id: string): Promise<void>;
  getActiveEnvironmentsByCluster(clusterId: string): Promise<any[]>;
  getActiveEnvironmentsCount(): Promise<number>;
  getTotalWorkshopsCount(): Promise<number>;
  
  // User-specific data isolation
  getUserWorkshopsByUserId(userId: number): Promise<Workshop[]>;
  getUserSessionsByUserId(userId: number): Promise<WorkshopSession[]>;
  getUserChallengesByUserId(userId: number): Promise<Challenge[]>;

  // Kubernetes Infrastructure Management
  createKubernetesCluster(insertCluster: InsertKubernetesInfrastructure): Promise<KubernetesInfrastructure>;
  updateKubernetesCluster(id: number, updates: Partial<InsertKubernetesInfrastructure>): Promise<KubernetesInfrastructure | undefined>;
  deleteKubernetesCluster(id: number): Promise<boolean>;
  getAvailableKubernetesCluster(communityId?: number): Promise<KubernetesInfrastructure | undefined>;

  // vCluster Management
  createVClusterInstance(insertVCluster: InsertVclusterInstance): Promise<VclusterInstance>;
  getVCluster(id: number): Promise<VclusterInstance | undefined>;
  updateVClusterStatus(id: number, status: string): Promise<VclusterInstance | undefined>;
  getActiveVClustersByUser(userId: number): Promise<VclusterInstance[]>;
  getActiveVClustersByCluster(clusterId: number): Promise<VclusterInstance[]>;
  getAllVClusters(): Promise<VclusterInstance[]>;

  // Workshop Documents
  createWorkshopDocument(insertDocument: InsertWorkshopDocument): Promise<WorkshopDocument>;
  getWorkshopDocument(id: number): Promise<WorkshopDocument | undefined>;
  getWorkshopDocuments(workshopId: number): Promise<WorkshopDocument[]>;
  deleteWorkshopDocument(id: number): Promise<boolean>;

  // Workshop Sessions Enhanced
  getActiveWorkshopSession(workshopId: number, userId: number): Promise<WorkshopSession | undefined>;
  completeWorkshopSession(id: number, updates: Partial<InsertWorkshopSession>): Promise<WorkshopSession | undefined>;

  // Audit & Monitoring
  createInfrastructureAuditLog(insertLog: InsertInfrastructureAuditLog): Promise<InfrastructureAuditLog>;
  getInfrastructureAuditLogs(filters: any): Promise<InfrastructureAuditLog[]>;

  // User & Community Management
  getUsers(filters?: any): Promise<User[]>;
  updateUserRole(userId: number, role: string, permissions?: any): Promise<User | undefined>;
  getAllCommunities(): Promise<Community[]>;
  updateCommunitySubscription(communityId: number, subscription: string, resourceLimits?: any): Promise<Community | undefined>;
  getUserResourceQuota(userId: number): Promise<any>;
  getPlatformStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Workshops
  async getWorkshops(): Promise<Workshop[]> {
    return await db.select().from(workshops);
  }

  async getWorkshop(id: number): Promise<Workshop | undefined> {
    const [workshop] = await db.select().from(workshops).where(eq(workshops.id, id));
    return workshop || undefined;
  }

  async createWorkshop(insertWorkshop: InsertWorkshop): Promise<Workshop> {
    const [workshop] = await db
      .insert(workshops)
      .values(insertWorkshop)
      .returning();
    return workshop;
  }

  async updateWorkshop(id: number, updateData: Partial<InsertWorkshop>): Promise<Workshop | undefined> {
    const [workshop] = await db
      .update(workshops)
      .set(updateData)
      .where(eq(workshops.id, id))
      .returning();
    return workshop || undefined;
  }

  // Workshop Sessions
  async getWorkshopSession(id: number): Promise<WorkshopSession | undefined> {
    const [session] = await db.select().from(workshopSessions).where(eq(workshopSessions.id, id));
    return session || undefined;
  }

  async createWorkshopSession(insertSession: InsertWorkshopSession): Promise<WorkshopSession> {
    const [session] = await db
      .insert(workshopSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateWorkshopSession(id: number, updateData: Partial<InsertWorkshopSession>): Promise<WorkshopSession | undefined> {
    const [session] = await db
      .update(workshopSessions)
      .set(updateData)
      .where(eq(workshopSessions.id, id))
      .returning();
    return session || undefined;
  }

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges);
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges).where(eq(challenges.isActive, true));
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge || undefined;
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const [challenge] = await db
      .insert(challenges)
      .values(insertChallenge)
      .returning();
    return challenge;
  }

  async createChallengeParticipation(insertParticipation: InsertChallengeParticipation): Promise<ChallengeParticipation> {
    const [participation] = await db
      .insert(challengeParticipations)
      .values(insertParticipation)
      .returning();
    return participation;
  }

  // Analytics
  async getLeaderboard(): Promise<any[]> {
    const leaderboard = await db
      .select({
        username: users.username,
        points: users.points,
        title: users.role,
      })
      .from(users)
      .orderBy(desc(users.points))
      .limit(10);
    
    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      username: entry.username,
      points: entry.points || 0,
      title: entry.title === 'admin' ? 'Admin' : entry.title === 'moderator' ? 'Modérateur' : 'Membre',
    }));
  }

  async getAnalyticsStats(): Promise<any> {
    const [workshopCount] = await db.select({ count: count() }).from(workshops);
    const [userCount] = await db.select({ count: count() }).from(users);
    const [certificationCount] = await db.select({ count: count() }).from(certifications);
    
    return {
      activeWorkshops: workshopCount.count,
      totalUsers: userCount.count,
      certificationsIssued: certificationCount.count,
      successRate: 87, // Mock value for now
    };
  }

  // Kubernetes Clusters - Implémentation temporaire en mémoire
  private kubernetesClusters: Map<string, KubernetesCluster> = new Map();

  async getKubernetesClusters(): Promise<KubernetesCluster[]> {
    return Array.from(this.kubernetesClusters.values());
  }

  async getKubernetesCluster(id: string): Promise<KubernetesCluster | undefined> {
    return this.kubernetesClusters.get(id);
  }

  async createKubernetesCluster(cluster: KubernetesCluster): Promise<KubernetesCluster> {
    this.kubernetesClusters.set(cluster.id, cluster);
    return cluster;
  }

  async updateKubernetesCluster(id: string, updates: Partial<KubernetesCluster>): Promise<KubernetesCluster | undefined> {
    const existing = this.kubernetesClusters.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.kubernetesClusters.set(id, updated);
    return updated;
  }

  async deleteKubernetesCluster(id: string): Promise<void> {
    this.kubernetesClusters.delete(id);
  }

  async getActiveEnvironmentsByCluster(clusterId: string): Promise<any[]> {
    // Implémentation temporaire - retourner un tableau vide
    return [];
  }

  async getActiveEnvironmentsCount(): Promise<number> {
    // Implémentation temporaire
    return 0;
  }

  async getTotalWorkshopsCount(): Promise<number> {
    const workshops = await this.getWorkshops();
    return workshops.length;
  }

  // User-specific data isolation methods
  async getUserWorkshopsByUserId(userId: number): Promise<Workshop[]> {
    return await db.select().from(workshops).where(eq(workshops.creatorId, userId));
  }

  async getUserSessionsByUserId(userId: number): Promise<WorkshopSession[]> {
    return await db.select().from(workshopSessions).where(eq(workshopSessions.userId, userId));
  }

  async getUserChallengesByUserId(userId: number): Promise<Challenge[]> {
    return await db.select().from(challenges).where(eq(challenges.creatorId, userId));
  }

  // Kubernetes Infrastructure Management
  async createKubernetesCluster(insertCluster: InsertKubernetesInfrastructure): Promise<KubernetesInfrastructure> {
    const [cluster] = await db
      .insert(kubernetesInfrastructure)
      .values(insertCluster)
      .returning();
    return cluster;
  }

  async updateKubernetesCluster(id: number, updates: Partial<InsertKubernetesInfrastructure>): Promise<KubernetesInfrastructure | undefined> {
    const [cluster] = await db
      .update(kubernetesInfrastructure)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(kubernetesInfrastructure.id, id))
      .returning();
    return cluster || undefined;
  }

  async deleteKubernetesCluster(id: number): Promise<boolean> {
    const result = await db
      .delete(kubernetesInfrastructure)
      .where(eq(kubernetesInfrastructure.id, id));
    return result.rowCount > 0;
  }

  async getAvailableKubernetesCluster(communityId?: number): Promise<KubernetesInfrastructure | undefined> {
    // Sélectionner un cluster disponible basé sur la communauté ou un cluster par défaut
    const [cluster] = await db
      .select()
      .from(kubernetesInfrastructure)
      .where(eq(kubernetesInfrastructure.status, 'active'))
      .limit(1);
    return cluster || undefined;
  }

  // vCluster Management
  async createVClusterInstance(insertVCluster: InsertVclusterInstance): Promise<VclusterInstance> {
    const [vcluster] = await db
      .insert(vclusterInstances)
      .values(insertVCluster)
      .returning();
    return vcluster;
  }

  async getVCluster(id: number): Promise<VclusterInstance | undefined> {
    const [vcluster] = await db
      .select()
      .from(vclusterInstances)
      .where(eq(vclusterInstances.id, id));
    return vcluster || undefined;
  }

  async updateVClusterStatus(id: number, status: string): Promise<VclusterInstance | undefined> {
    const [vcluster] = await db
      .update(vclusterInstances)
      .set({ status, updatedAt: new Date() })
      .where(eq(vclusterInstances.id, id))
      .returning();
    return vcluster || undefined;
  }

  async getActiveVClustersByUser(userId: number): Promise<VclusterInstance[]> {
    return await db
      .select()
      .from(vclusterInstances)
      .where(and(
        eq(vclusterInstances.userId, userId),
        eq(vclusterInstances.status, 'ready')
      ));
  }

  async getActiveVClustersByCluster(clusterId: number): Promise<VclusterInstance[]> {
    return await db
      .select()
      .from(vclusterInstances)
      .where(and(
        eq(vclusterInstances.clusterId, clusterId),
        eq(vclusterInstances.status, 'ready')
      ));
  }

  async getAllVClusters(): Promise<VclusterInstance[]> {
    return await db.select().from(vclusterInstances);
  }

  // Workshop Documents
  async createWorkshopDocument(insertDocument: InsertWorkshopDocument): Promise<WorkshopDocument> {
    const [document] = await db
      .insert(workshopDocuments)
      .values(insertDocument)
      .returning();
    return document;
  }

  async getWorkshopDocument(id: number): Promise<WorkshopDocument | undefined> {
    const [document] = await db
      .select()
      .from(workshopDocuments)
      .where(eq(workshopDocuments.id, id));
    return document || undefined;
  }

  async getWorkshopDocuments(workshopId: number): Promise<WorkshopDocument[]> {
    return await db
      .select()
      .from(workshopDocuments)
      .where(eq(workshopDocuments.workshopId, workshopId));
  }

  async deleteWorkshopDocument(id: number): Promise<boolean> {
    const result = await db
      .delete(workshopDocuments)
      .where(eq(workshopDocuments.id, id));
    return result.rowCount > 0;
  }

  // Workshop Sessions Enhanced
  async getActiveWorkshopSession(workshopId: number, userId: number): Promise<WorkshopSession | undefined> {
    const [session] = await db
      .select()
      .from(workshopSessions)
      .where(and(
        eq(workshopSessions.workshopId, workshopId),
        eq(workshopSessions.userId, userId),
        eq(workshopSessions.status, 'started')
      ));
    return session || undefined;
  }

  async completeWorkshopSession(id: number, updates: Partial<InsertWorkshopSession>): Promise<WorkshopSession | undefined> {
    const [session] = await db
      .update(workshopSessions)
      .set({ ...updates, completedAt: new Date() })
      .where(eq(workshopSessions.id, id))
      .returning();
    return session || undefined;
  }

  // Audit & Monitoring
  async createInfrastructureAuditLog(insertLog: InsertInfrastructureAuditLog): Promise<InfrastructureAuditLog> {
    const [log] = await db
      .insert(infrastructureAuditLog)
      .values(insertLog)
      .returning();
    return log;
  }

  async getInfrastructureAuditLogs(filters: any): Promise<InfrastructureAuditLog[]> {
    let query = db.select().from(infrastructureAuditLog);
    
    if (filters.userId) {
      query = query.where(eq(infrastructureAuditLog.userId, filters.userId));
    }
    
    return await query
      .orderBy(desc(infrastructureAuditLog.timestamp))
      .limit(filters.limit || 100)
      .offset(filters.offset || 0);
  }

  // User & Community Management
  async getUsers(filters?: any): Promise<User[]> {
    let query = db.select().from(users);
    
    if (filters?.role) {
      query = query.where(eq(users.role, filters.role));
    }
    
    return await query;
  }

  async updateUserRole(userId: number, role: string, permissions?: any): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        role, 
        permissions,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getAllCommunities(): Promise<Community[]> {
    return await db.select().from(communities);
  }

  async updateCommunitySubscription(communityId: number, subscription: string, resourceLimits?: any): Promise<Community | undefined> {
    const [community] = await db
      .update(communities)
      .set({ 
        subscription, 
        resourceLimits 
      })
      .where(eq(communities.id, communityId))
      .returning();
    return community || undefined;
  }

  async getUserResourceQuota(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    
    // Quotas par défaut basés sur le rôle et l'abonnement
    const defaultQuotas = {
      free: { maxVClusters: 1, maxCPU: '500m', maxMemory: '1Gi', maxStorage: '2Gi' },
      premium: { maxVClusters: 5, maxCPU: '2000m', maxMemory: '4Gi', maxStorage: '10Gi' },
      enterprise: { maxVClusters: 20, maxCPU: '8000m', maxMemory: '16Gi', maxStorage: '50Gi' },
    };
    
    return defaultQuotas[user?.subscription as keyof typeof defaultQuotas] || defaultQuotas.free;
  }

  async getPlatformStats(): Promise<any> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [workshopCount] = await db.select({ count: count() }).from(workshops);
    const [vclusterCount] = await db.select({ count: count() }).from(vclusterInstances);
    const [clusterCount] = await db.select({ count: count() }).from(kubernetesInfrastructure);
    
    return {
      totalUsers: userCount.count,
      totalWorkshops: workshopCount.count,
      activeVClusters: vclusterCount.count,
      kubernetesClusters: clusterCount.count,
    };
  }
}

export const storage = new DatabaseStorage();