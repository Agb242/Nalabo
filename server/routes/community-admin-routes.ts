
import { Router } from 'express';
import { requireAuth, requireCommunityAdmin } from '../auth';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

const createCommunityWorkshopSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  estimatedDuration: z.number().min(1),
  steps: z.array(z.any()),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  environmentConfig: z.any().optional(),
  kubernetesTools: z.array(z.string()).default([]),
});

/**
 * @route GET /api/community-admin/dashboard
 * @desc Tableau de bord pour les admins de communauté
 * @access Community Admin
 */
router.get('/dashboard', requireAuth, requireCommunityAdmin, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const userRole = req.session.userRole!;
    
    // Pour super admin, voir toutes les communautés
    // Pour community admin, voir seulement sa communauté
    let communityData;
    
    if (userRole === 'super_admin') {
      communityData = await storage.getAllCommunities();
    } else {
      const userCommunity = await storage.getUserCommunity(userId);
      communityData = userCommunity ? [userCommunity] : [];
    }

    // Métriques de la communauté
    const metrics = {
      totalWorkshops: 0,
      activeMembers: 0,
      monthlyUsage: 0,
      subscriptionStatus: 'premium'
    };

    // Si community admin, calculer les métriques pour sa communauté
    if (userRole === 'community_admin' && communityData.length > 0) {
      const communityId = communityData[0].id;
      metrics.totalWorkshops = await storage.getCommunityWorkshopCount(communityId);
      metrics.activeMembers = await storage.getCommunityMemberCount(communityId);
    }

    res.json({
      success: true,
      communities: communityData,
      metrics,
      userRole
    });
  } catch (error) {
    console.error('Community admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du chargement du tableau de bord'
    });
  }
});

/**
 * @route GET /api/community-admin/workshops
 * @desc Ateliers de la communauté avec privilèges étendus
 * @access Community Admin
 */
router.get('/workshops', requireAuth, requireCommunityAdmin, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const userRole = req.session.userRole!;
    
    let workshops;
    
    if (userRole === 'super_admin') {
      workshops = await storage.getWorkshops();
    } else {
      const userCommunity = await storage.getUserCommunity(userId);
      if (!userCommunity) {
        return res.status(404).json({ error: 'Communauté non trouvée' });
      }
      workshops = await storage.getWorkshopsByCommunity(userCommunity.id);
    }

    res.json({
      success: true,
      workshops
    });
  } catch (error) {
    console.error('Get community workshops error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des ateliers'
    });
  }
});

/**
 * @route POST /api/community-admin/workshops
 * @desc Créer un atelier premium avec privilèges étendus
 * @access Community Admin
 */
router.post('/workshops', requireAuth, requireCommunityAdmin, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const workshopData = createCommunityWorkshopSchema.parse(req.body);
    
    // Les community admins peuvent créer des ateliers avec plus de privilèges
    const premiumWorkshop = {
      ...workshopData,
      creatorId: userId,
      status: 'published', // Peut publier directement
      isolationLevel: 'high', // Isolation renforcée
      resourceLimits: {
        cpu: '2000m',
        memory: '4Gi',
        storage: '10Gi'
      },
      // Privilèges étendus pour community admin
      maxDuration: 240, // 4 heures au lieu de 1h
      allowCustomImages: true,
      allowNetworkPolicies: true,
      allowPersistentVolumes: true
    };

    const workshop = await storage.createWorkshop(premiumWorkshop);
    
    res.status(201).json({
      success: true,
      workshop
    });
  } catch (error) {
    console.error('Create premium workshop error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'atelier premium'
    });
  }
});

/**
 * @route GET /api/community-admin/members
 * @desc Gestion des membres de la communauté
 * @access Community Admin
 */
router.get('/members', requireAuth, requireCommunityAdmin, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const userRole = req.session.userRole!;
    
    let members;
    
    if (userRole === 'super_admin') {
      members = await storage.getAllUsers();
    } else {
      const userCommunity = await storage.getUserCommunity(userId);
      if (!userCommunity) {
        return res.status(404).json({ error: 'Communauté non trouvée' });
      }
      members = await storage.getCommunityMembers(userCommunity.id);
    }

    res.json({
      success: true,
      members
    });
  } catch (error) {
    console.error('Get community members error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des membres'
    });
  }
});

/**
 * @route GET /api/community-admin/analytics
 * @desc Analytiques avancées pour la communauté
 * @access Community Admin
 */
router.get('/analytics', requireAuth, requireCommunityAdmin, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const userRole = req.session.userRole!;
    
    // Analytiques premium pour community admins
    const analytics = {
      workshopCompletionRate: 85,
      averageSessionDuration: 45,
      mostPopularCategories: ['kubernetes', 'docker', 'ai-ml'],
      memberActivityTrend: 'increasing',
      resourceUsageOptimization: 78
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get community analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des analytiques'
    });
  }
});

export { router as communityAdminRoutes };
