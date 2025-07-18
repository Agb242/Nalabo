
import { Router } from 'express';
import { requireAuth } from '../auth';
import { storage } from '../storage';

const router = Router();

/**
 * @route GET /api/analytics/user-stats
 * @desc Obtenir les statistiques spécifiques à l'utilisateur connecté
 * @access Private
 */
router.get('/user-stats', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    // Récupérer les statistiques spécifiques à l'utilisateur
    const userWorkshops = await storage.getUserWorkshops(userId);
    const userSessions = await storage.getUserSessions(userId);
    const completedSessions = userSessions.filter(s => s.status === 'completed');
    
    const stats = {
      activeWorkshops: userWorkshops.length,
      completedSessions: completedSessions.length,
      totalSessions: userSessions.length,
      successRate: userSessions.length > 0 ? 
        Math.round((completedSessions.length / userSessions.length) * 100) : 0,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics',
    });
  }
});

export { router as userStatsRoutes };
