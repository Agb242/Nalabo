import { 
  users, workshops, workshopSessions, challenges, challengeParticipations, certifications, communities, communityMemberships,
  type User, type InsertUser, type Workshop, type InsertWorkshop, type WorkshopSession, type InsertWorkshopSession,
  type Challenge, type InsertChallenge, type ChallengeParticipation, type InsertChallengeParticipation,
  type Certification, type InsertCertification, type Community, type InsertCommunity,
  type CommunityMembership, type InsertCommunityMembership
} from "@shared/schema";
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
}

export const storage = new DatabaseStorage();