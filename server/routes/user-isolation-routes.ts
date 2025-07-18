import { Router } from 'express';
import { requireAuth, requireAdmin } from '../auth';
import { storage } from '../storage';

const router = Router();

/**
 * @route GET /api/users/:userId/dashboard
 * @desc Dashboard personnalisé par utilisateur avec données isolées
 * @access Private (User or Admin)
 */
router.get('/users/:userId/dashboard', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Vérifier l'ownership - seulement ses propres données ou admin
    if (userId !== req.session.userId && req.session.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Récupérer les données isolées par utilisateur
    const [userWorkshops, userSessions, userChallenges] = await Promise.all([
      storage.getUserWorkshopsByUserId(userId),
      storage.getUserSessionsByUserId(userId),
      storage.getUserChallengesByUserId(userId)
    ]);
    
    const stats = {
      workshopsCreated: userWorkshops.length,
      workshopsCompleted: userSessions.filter(s => s.status === 'completed').length,
      workshopsInProgress: userSessions.filter(s => s.status === 'started').length,
      challengesCreated: userChallenges.length,
      totalTimeSpent: userSessions.reduce((total, session) => total + (session.timeSpent || 0), 0)
    };
    
    res.json({
      success: true,
      stats,
      workshops: userWorkshops,
      recentSessions: userSessions.slice(0, 5),
      challenges: userChallenges.slice(0, 5)
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user dashboard'
    });
  }
});

/**
 * @route GET /api/users/:userId/workshops
 * @desc Ateliers créés par un utilisateur spécifique
 * @access Private (User or Admin)
 */
router.get('/users/:userId/workshops', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Vérifier l'ownership
    if (userId !== req.session.userId && req.session.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const workshops = await storage.getUserWorkshopsByUserId(userId);
    
    res.json({
      success: true,
      workshops
    });
  } catch (error) {
    console.error('Get user workshops error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user workshops'
    });
  }
});

/**
 * @route GET /api/users/:userId/sessions
 * @desc Sessions d'ateliers par utilisateur
 * @access Private (User or Admin)
 */
router.get('/users/:userId/sessions', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Vérifier l'ownership
    if (userId !== req.session.userId && req.session.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const sessions = await storage.getUserSessionsByUserId(userId);
    
    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user sessions'
    });
  }
});

export { router as userIsolationRoutes };