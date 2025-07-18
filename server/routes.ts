import type { Express } from "express";
import { createServer, type Server } from "http";
import enhancedWorkshopRoutes from "./routes/enhanced-workshop-routes";
import { adminRoutes } from "./routes/admin-routes";
import { storage } from "./storage";
import { insertUserSchema, insertWorkshopSchema, insertChallengeSchema, insertWorkshopSessionSchema, insertChallengeParticipationSchema } from "@shared/schema";
import { registerUser, loginUser, logoutUser, getCurrentUser, requireAuth, requireAdmin } from "./auth";
import { z } from "zod";
import { userStatsRoutes } from './routes/user-stats-routes';
import { workshopCreationRoutes } from './routes/workshop-creation-routes';
import { userIsolationRoutes } from './routes/user-isolation-routes';

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", registerUser);
  app.post("/api/auth/login", loginUser);
  app.post("/api/auth/logout", logoutUser);
  app.get("/api/auth/me", getCurrentUser);

  // Enhanced Workshop routes with multi-infrastructure support
  app.use("/api/workshops", enhancedWorkshopRoutes);

  // Admin routes
  app.use('/api/admin', adminRoutes);
  app.use('/api/workshops', enhancedWorkshopRoutes);
  app.use('/api/analytics', userStatsRoutes);
  app.use('/api/workshops', workshopCreationRoutes);
  app.use('/api', userIsolationRoutes);

  // User routes
  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Only allow users to view their own profile or admins to view any profile
      if (user.id !== req.session.userId && req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;

      // Only allow users to update their own profile or admins to update any profile
      if (userId !== req.session.userId && req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }

      // Don't allow updating sensitive fields through this endpoint
      const allowedFields = ["firstName", "lastName", "email"];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key];
          return obj;
        }, {} as any);

      const user = await storage.updateUser(userId, filteredUpdates);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Workshop routes
  app.post("/api/workshops", requireAuth, async (req, res) => {
    try {
      const workshopData = {
        ...req.body,
        authorId: req.session.userId,
        isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
      };

      const validatedData = insertWorkshopSchema.parse(workshopData);
      const workshop = await storage.createWorkshop(validatedData);
      res.status(201).json(workshop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Create workshop error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/workshops", requireAuth, async (req, res) => {
    try {
      let workshops;
      // If admin, get all workshops; otherwise, get only user's workshops
      if (req.session.userRole === "admin") {
        workshops = await storage.getWorkshops();
      } else {
        workshops = await storage.getUserWorkshopsByUserId(req.session.userId!);
      }
      res.json(workshops);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/workshops/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workshop = await storage.getWorkshop(id);
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }
      res.json(workshop);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/workshops/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workshopData = insertWorkshopSchema.partial().parse(req.body);
      const workshop = await storage.updateWorkshop(id, workshopData);
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }
      res.json(workshop);
    } catch (error) {
      res.status(400).json({ error: "Invalid workshop data" });
    }
  });

  // Workshop session routes - SECURED
  app.post("/api/workshop-sessions", requireAuth, async (req, res) => {
    try {
      const sessionData = insertWorkshopSessionSchema.parse(req.body);
      // Auto-assign user to session
      sessionData.userId = req.session.userId;
      const session = await storage.createWorkshopSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.get("/api/workshop-sessions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getWorkshopSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      // Only allow users to view their own sessions or admins to view any session
      if (session.userId !== req.session.userId && req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/workshop-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sessionData = insertWorkshopSessionSchema.partial().parse(req.body);
      const session = await storage.updateWorkshopSession(id, sessionData);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  // Challenge routes - SECURED
  app.post("/api/challenges", requireAuth, async (req, res) => {
    try {
      const challengeData = insertChallengeSchema.parse(req.body);
      // Auto-assign creator to authenticated user
      challengeData.creatorId = req.session.userId;
      const challenge = await storage.createChallenge(challengeData);
      res.json(challenge);
    } catch (error) {
      res.status(400).json({ error: "Invalid challenge data" });
    }
  });

  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/challenges/active", async (req, res) => {
    try {
      const challenges = await storage.getActiveChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/challenges/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const challenge = await storage.getChallenge(id);
      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Challenge participation routes
  app.post("/api/challenge-participations", async (req, res) => {
    try {
      const participationData = insertChallengeParticipationSchema.parse(req.body);
      const participation = await storage.createChallengeParticipation(participationData);
      res.json(participation);
    } catch (error) {
      res.status(400).json({ error: "Invalid participation data" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const stats = await storage.getAnalyticsStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}