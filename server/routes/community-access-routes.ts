
import { Router } from 'express';
import { requireAuth } from '../auth';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Schémas de validation
const setWorkshopAccessSchema = z.object({
  workshopId: z.number(),
  communityId: z.number().optional(),
  accessLevel: z.enum(['public', 'community', 'private']),
  allowedRoles: z.array(z.string()).optional(),
  requireApproval: z.boolean().default(false)
});

const communityAccessRequestSchema = z.object({
  workshopId: z.number(),
  message: z.string().optional()
});

/**
 * @route POST /api/communities/:communityId/workshop-access
 * @desc Définit l'accès d'un atelier à une communauté
 * @access Private (Community Admin)
 */
router.post('/:communityId/workshop-access', requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const { workshopId, accessLevel, allowedRoles, requireApproval } = setWorkshopAccessSchema.parse(req.body);
    
    // Vérifier les permissions de la communauté
    const isCommunityAdmin = await storage.isUserCommunityAdmin(req.session.userId!, communityId);
    if (!isCommunityAdmin && req.session.userRole !== 'admin') {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    // Vérifier que l'utilisateur est propriétaire de l'atelier ou admin
    const workshop = await storage.getWorkshopById(workshopId);
    if (!workshop) {
      return res.status(404).json({ error: 'Atelier non trouvé' });
    }

    if (workshop.creatorId !== req.session.userId && req.session.userRole !== 'admin') {
      return res.status(403).json({ error: 'Vous n\'êtes pas le propriétaire de cet atelier' });
    }

    // Créer ou mettre à jour l'accès
    const accessConfig = {
      workshopId,
      communityId,
      accessLevel,
      allowedRoles: allowedRoles || ['member'],
      requireApproval,
      createdBy: req.session.userId,
      createdAt: new Date()
    };

    await storage.setWorkshopCommunityAccess(accessConfig);

    res.json({
      success: true,
      message: 'Accès configuré avec succès',
      accessConfig
    });
  } catch (error) {
    console.error('Set workshop access error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la configuration d\'accès'
    });
  }
});

/**
 * @route GET /api/communities/:communityId/workshops
 * @desc Obtient les ateliers accessibles dans une communauté
 * @access Private (Community Member)
 */
router.get('/:communityId/workshops', requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const userId = req.session.userId!;
    
    // Vérifier l'appartenance à la communauté
    const isMember = await storage.isUserCommunityMember(userId, communityId);
    if (!isMember && req.session.userRole !== 'admin') {
      return res.status(403).json({ error: 'Vous n\'êtes pas membre de cette communauté' });
    }

    // Obtenir le rôle de l'utilisateur dans la communauté
    const userRole = await storage.getUserCommunityRole(userId, communityId);
    
    // Obtenir les ateliers accessibles
    const workshops = await storage.getCommunityWorkshops(communityId, userRole);
    
    res.json({
      success: true,
      workshops,
      userRole
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
 * @route POST /api/workshops/:workshopId/request-access
 * @desc Demande l'accès à un atelier privé
 * @access Private
 */
router.post('/workshops/:workshopId/request-access', requireAuth, async (req, res) => {
  try {
    const workshopId = parseInt(req.params.workshopId);
    const userId = req.session.userId!;
    const { message } = communityAccessRequestSchema.parse(req.body);

    // Vérifier que l'atelier existe
    const workshop = await storage.getWorkshopById(workshopId);
    if (!workshop) {
      return res.status(404).json({ error: 'Atelier non trouvé' });
    }

    // Vérifier que l'atelier nécessite une approbation
    const accessConfig = await storage.getWorkshopAccessConfig(workshopId);
    if (!accessConfig || !accessConfig.requireApproval) {
      return res.status(400).json({ error: 'Cet atelier ne nécessite pas d\'approbation' });
    }

    // Vérifier qu'il n'y a pas déjà une demande en cours
    const existingRequest = await storage.getAccessRequest(workshopId, userId);
    if (existingRequest) {
      return res.status(400).json({ error: 'Vous avez déjà une demande en cours pour cet atelier' });
    }

    // Créer la demande d'accès
    const accessRequest = {
      workshopId,
      userId,
      message: message || '',
      status: 'pending',
      requestedAt: new Date()
    };

    await storage.createAccessRequest(accessRequest);

    // Notifier les administrateurs de la communauté
    await storage.notifyCommunityAdmins(accessConfig.communityId, {
      type: 'access_request',
      workshopId,
      userId,
      message: `${req.session.username} demande l'accès à l'atelier "${workshop.title}"`
    });

    res.json({
      success: true,
      message: 'Demande d\'accès envoyée avec succès',
      requestId: accessRequest.id
    });
  } catch (error) {
    console.error('Request access error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la demande d\'accès'
    });
  }
});

/**
 * @route GET /api/communities/:communityId/access-requests
 * @desc Obtient les demandes d'accès en attente
 * @access Private (Community Admin)
 */
router.get('/:communityId/access-requests', requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    // Vérifier les permissions
    const isCommunityAdmin = await storage.isUserCommunityAdmin(req.session.userId!, communityId);
    if (!isCommunityAdmin && req.session.userRole !== 'admin') {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    const accessRequests = await storage.getCommunityAccessRequests(communityId);
    
    res.json({
      success: true,
      accessRequests
    });
  } catch (error) {
    console.error('Get access requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des demandes'
    });
  }
});

/**
 * @route POST /api/access-requests/:requestId/approve
 * @desc Approuve ou refuse une demande d'accès
 * @access Private (Community Admin)
 */
router.post('/access-requests/:requestId/approve', requireAuth, async (req, res) => {
  try {
    const requestId = parseInt(req.params.requestId);
    const { approved, reason } = z.object({
      approved: z.boolean(),
      reason: z.string().optional()
    }).parse(req.body);

    // Obtenir la demande
    const accessRequest = await storage.getAccessRequestById(requestId);
    if (!accessRequest) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    // Vérifier les permissions
    const accessConfig = await storage.getWorkshopAccessConfig(accessRequest.workshopId);
    const isCommunityAdmin = await storage.isUserCommunityAdmin(req.session.userId!, accessConfig.communityId);
    
    if (!isCommunityAdmin && req.session.userRole !== 'admin') {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    // Mettre à jour la demande
    await storage.updateAccessRequest(requestId, {
      status: approved ? 'approved' : 'denied',
      reviewedBy: req.session.userId,
      reviewedAt: new Date(),
      reason
    });

    // Si approuvé, donner l'accès à l'utilisateur
    if (approved) {
      await storage.grantWorkshopAccess(accessRequest.workshopId, accessRequest.userId);
    }

    // Notifier l'utilisateur
    await storage.notifyUser(accessRequest.userId, {
      type: 'access_request_result',
      approved,
      workshopId: accessRequest.workshopId,
      reason
    });

    res.json({
      success: true,
      message: approved ? 'Demande approuvée' : 'Demande refusée'
    });
  } catch (error) {
    console.error('Approve access request error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du traitement de la demande'
    });
  }
});

/**
 * @route GET /api/workshops/:workshopId/access-info
 * @desc Obtient les informations d'accès d'un atelier
 * @access Private
 */
router.get('/workshops/:workshopId/access-info', requireAuth, async (req, res) => {
  try {
    const workshopId = parseInt(req.params.workshopId);
    const userId = req.session.userId!;

    const workshop = await storage.getWorkshopById(workshopId);
    if (!workshop) {
      return res.status(404).json({ error: 'Atelier non trouvé' });
    }

    // Vérifier l'accès de l'utilisateur
    const hasAccess = await storage.hasWorkshopAccess(workshopId, userId);
    const accessConfig = await storage.getWorkshopAccessConfig(workshopId);
    const pendingRequest = await storage.getAccessRequest(workshopId, userId);

    res.json({
      success: true,
      workshop: {
        id: workshop.id,
        title: workshop.title,
        description: workshop.description,
        category: workshop.category,
        difficulty: workshop.difficulty
      },
      access: {
        hasAccess,
        accessLevel: accessConfig?.accessLevel || 'public',
        requireApproval: accessConfig?.requireApproval || false,
        communityId: accessConfig?.communityId,
        pendingRequest: pendingRequest?.status === 'pending'
      }
    });
  } catch (error) {
    console.error('Get workshop access info error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des informations d\'accès'
    });
  }
});

export { router as communityAccessRoutes };
