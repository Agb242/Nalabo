import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWorkshopSchema, insertChallengeSchema, insertWorkshopSessionSchema, insertChallengeParticipationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
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
  app.post("/api/workshops", async (req, res) => {
    try {
      const workshopData = insertWorkshopSchema.parse(req.body);
      const workshop = await storage.createWorkshop(workshopData);
      res.json(workshop);
    } catch (error) {
      res.status(400).json({ error: "Invalid workshop data" });
    }
  });

  app.get("/api/workshops", async (req, res) => {
    try {
      const workshops = await storage.getWorkshops();
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

  // Workshop session routes
  app.post("/api/workshop-sessions", async (req, res) => {
    try {
      const sessionData = insertWorkshopSessionSchema.parse(req.body);
      const session = await storage.createWorkshopSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.get("/api/workshop-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getWorkshopSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
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

  // Challenge routes
  app.post("/api/challenges", async (req, res) => {
    try {
      const challengeData = insertChallengeSchema.parse(req.body);
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
