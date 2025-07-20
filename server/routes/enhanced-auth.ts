import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { storage } from '../storage';
import { requireAuth } from '../auth';
import { requireRole, requireSuperAdmin, auditLog, rateLimitSensitive } from '../middleware/role-auth';
import { validateRequest } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// Enhanced registration schema with role validation
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  communityId: z.number().optional(),
  inviteCode: z.string().optional()
});

const updateUserRoleSchema = z.object({
  userId: z.number(),
  role: z.enum(['user', 'admin', 'super_admin']),
  communityId: z.number().optional()
});

const createCommunitySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  subscription: z.enum(['free', 'enterprise']).default('free'),
  resourceLimits: z.object({
    maxUsers: z.number().optional(),
    maxWorkshops: z.number().optional(),
    maxStorage: z.number().optional()
  }).optional()
});

// Enhanced registration with community support
router.post('/register', 
  validateRequest(registerSchema),
  rateLimitSensitive(),
  async (req, res) => {
    try {
      const { username, email, password, communityId, inviteCode } = req.body;

      // Check if user already exists
      const existingUser = await storage.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Validate community invite if provided
      if (communityId && inviteCode) {
        const community = await storage.getCommunityById(communityId);
        if (!community) {
          return res.status(400).json({ error: 'Invalid community' });
        }

        // TODO: Validate invite code
        // const validInvite = await storage.validateInviteCode(communityId, inviteCode);
        // if (!validInvite) {
        //   return res.status(400).json({ error: 'Invalid or expired invite code' });
        // }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user with appropriate role
      const userData = {
        username,
        email,
        password: hashedPassword,
        role: 'user' as UserRole,
        communityId: communityId || null,
        subscription: 'free' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const user = await storage.createUser(userData);

      // Remove password from response
      const { password: _, ...userResponse } = user;

      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Get user profile with enhanced security
router.get('/profile', 
  requireAuth,
  async (req, res) => {
    try {
      const user = await storage.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
);

// Update user role (super admin only)
router.patch('/users/:userId/role',
  requireAuth,
  requireSuperAdmin,
  auditLog('UPDATE_USER_ROLE', 'USER'),
  validateRequest(updateUserRoleSchema),
  async (req, res) => {
    try {
      const { userId, role, communityId } = req.body;

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Validate community assignment for admin roles
      if (role === 'admin' && !communityId) {
        return res.status(400).json({ error: 'Community ID required for admin role' });
      }

      if (role === 'admin' && communityId) {
        const community = await storage.getCommunityById(communityId);
        if (!community) {
          return res.status(400).json({ error: 'Invalid community' });
        }
      }

      await storage.updateUserRole(userId, role, communityId);

      res.json({ 
        message: 'User role updated successfully',
        userId,
        role,
        communityId 
      });
    } catch (error) {
      console.error('Role update error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }
);

// Create community (admin+ only)
router.post('/communities',
  requireAuth,
  requireRole(['admin', 'super_admin']),
  auditLog('CREATE_COMMUNITY', 'COMMUNITY'),
  validateRequest(createCommunitySchema),
  async (req, res) => {
    try {
      const { name, description, subscription, resourceLimits } = req.body;
      
      const communityData = {
        name,
        description,
        subscription,
        resourceLimits,
        ownerId: req.user!.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const community = await storage.createCommunity(communityData);

      res.status(201).json({
        message: 'Community created successfully',
        community
      });
    } catch (error) {
      console.error('Community creation error:', error);
      res.status(500).json({ error: 'Failed to create community' });
    }
  }
);

// Get communities (filtered by user role)
router.get('/communities', 
  requireAuth,
  async (req, res) => {
    try {
      let communities;

      if (req.user!.role === 'super_admin') {
        // Super admin sees all communities
        communities = await storage.getAllCommunities();
      } else if (req.user!.role === 'admin') {
        // Admin sees communities they manage
        communities = await storage.getCommunitiesByOwner(req.user!.id);
      } else {
        // Users see only their community
        if (req.user!.communityId) {
          const community = await storage.getCommunityById(req.user!.communityId);
          communities = community ? [community] : [];
        } else {
          communities = [];
        }
      }

      res.json(communities);
    } catch (error) {
      console.error('Communities fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch communities' });
    }
  }
);

// Get community members (admin+ only)
router.get('/communities/:communityId/members',
  requireAuth,
  requireRole(['admin', 'super_admin']),
  async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      // Check if user has access to this community
      if (req.user!.role === 'admin' && req.user!.communityId !== communityId) {
        return res.status(403).json({ error: 'Access denied to this community' });
      }

      const members = await storage.getCommunityMembers(communityId);
      res.json(members);
    } catch (error) {
      console.error('Members fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch community members' });
    }
  }
);

// Security dashboard (super admin only)
router.get('/security/dashboard',
  requireAuth,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const stats = {
        totalUsers: await storage.getTotalUsers(),
        totalCommunities: await storage.getTotalCommunities(),
        activeUsers24h: await storage.getActiveUsers24h(),
        failedLogins24h: await storage.getFailedLogins24h(),
        securityAlerts: await storage.getSecurityAlerts(),
        auditLogs: await storage.getRecentAuditLogs(50)
      };

      res.json(stats);
    } catch (error) {
      console.error('Security dashboard error:', error);
      res.status(500).json({ error: 'Failed to fetch security dashboard' });
    }
  }
);

// Lock/unlock user account (super admin only)
router.patch('/users/:userId/lock',
  requireAuth,
  requireSuperAdmin,
  auditLog('LOCK_USER', 'USER'),
  async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { locked, reason } = req.body;

      await storage.updateUserLockStatus(userId, locked, reason);

      res.json({ 
        message: `User ${locked ? 'locked' : 'unlocked'} successfully`,
        userId,
        locked,
        reason 
      });
    } catch (error) {
      console.error('User lock error:', error);
      res.status(500).json({ error: 'Failed to update user lock status' });
    }
  }
);

export { router as enhancedAuthRouter };