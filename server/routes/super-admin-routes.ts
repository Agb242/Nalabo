import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth } from '../auth';
import KubernetesService from '../services/kubernetes-service';
import { 
  insertKubernetesInfrastructureSchema, 
  insertInfrastructureAuditLogSchema,
  PermissionsSchema 
} from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Middleware pour vérifier les permissions super admin
const requireSuperAdmin = (req: any, res: any, next: any) => {
  if (!req.session.userId || req.session.userRole !== 'super_admin') {
    return res.status(403).json({ error: 'Accès refusé - Super Admin requis' });
  }
  next();
};

// Middleware pour l'audit des actions
const auditAction = async (req: any, action: string, resource: string, resourceId?: string) => {
  try {
    await storage.createInfrastructureAuditLog({
      userId: req.session.userId,
      action,
      resource,
      resourceId,
      details: { 
        method: req.method, 
        url: req.originalUrl, 
        body: req.body 
      },
      ipAddress: req.ip,
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

// Infrastructure Kubernetes Routes

/**
 * GET /api/super-admin/infrastructure
 * Liste tous les clusters Kubernetes
 */
router.get('/infrastructure', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const clusters = await storage.getKubernetesClusters();
    await auditAction(req, 'view', 'infrastructure');
    res.json({ clusters });
  } catch (error) {
    console.error('Error fetching clusters:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des clusters' });
  }
});

/**
 * POST /api/super-admin/infrastructure
 * Ajoute un nouveau cluster Kubernetes
 */
router.post('/infrastructure', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const clusterData = insertKubernetesInfrastructureSchema.parse(req.body);
    
    // Valider le kubeconfig
    if (!KubernetesService.validateKubeconfig(clusterData.kubeconfig)) {
      return res.status(400).json({ error: 'Kubeconfig invalide' });
    }

    // Extraire les informations du cluster
    const clusterInfo = KubernetesService.extractClusterInfo(clusterData.kubeconfig);
    
    // Tester la connexion
    const kubernetesService = new KubernetesService();
    const connectionTest = await kubernetesService.testConnection(clusterData.kubeconfig);
    
    if (!connectionTest) {
      return res.status(400).json({ error: 'Impossible de se connecter au cluster' });
    }

    // Créer le cluster dans la base de données
    const cluster = await storage.createKubernetesCluster({
      ...clusterData,
      endpoint: clusterInfo.endpoint || clusterData.endpoint,
      managedById: req.session.userId,
    });

    await auditAction(req, 'create', 'cluster', cluster.id.toString());
    
    res.status(201).json({ cluster });
  } catch (error) {
    console.error('Error creating cluster:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    res.status(500).json({ error: 'Erreur lors de la création du cluster' });
  }
});

/**
 * PUT /api/super-admin/infrastructure/:id
 * Met à jour un cluster Kubernetes
 */
router.put('/infrastructure/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const clusterId = parseInt(req.params.id);
    const updates = req.body;

    if (updates.kubeconfig && !KubernetesService.validateKubeconfig(updates.kubeconfig)) {
      return res.status(400).json({ error: 'Kubeconfig invalide' });
    }

    const cluster = await storage.updateKubernetesCluster(clusterId, updates);
    
    if (!cluster) {
      return res.status(404).json({ error: 'Cluster non trouvé' });
    }

    await auditAction(req, 'update', 'cluster', clusterId.toString());
    res.json({ cluster });
  } catch (error) {
    console.error('Error updating cluster:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du cluster' });
  }
});

/**
 * DELETE /api/super-admin/infrastructure/:id
 * Supprime un cluster Kubernetes
 */
router.delete('/infrastructure/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const clusterId = parseInt(req.params.id);
    
    // Vérifier qu'il n'y a pas de vClusters actifs
    const activeVClusters = await storage.getActiveVClustersByCluster(clusterId);
    if (activeVClusters.length > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer le cluster: des vClusters sont encore actifs' 
      });
    }

    const success = await storage.deleteKubernetesCluster(clusterId);
    
    if (!success) {
      return res.status(404).json({ error: 'Cluster non trouvé' });
    }

    await auditAction(req, 'delete', 'cluster', clusterId.toString());
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting cluster:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du cluster' });
  }
});

// Gestion des utilisateurs et communautés

/**
 * GET /api/super-admin/users
 * Liste tous les utilisateurs avec filtres
 */
router.get('/users', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { role, subscription, search } = req.query;
    const users = await storage.getUsers({
      role: role as string,
      subscription: subscription as string,
      search: search as string,
    });

    await auditAction(req, 'view', 'users');
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

/**
 * PUT /api/super-admin/users/:id/role
 * Change le rôle d'un utilisateur
 */
router.put('/users/:id/role', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role, permissions } = req.body;

    if (!['user', 'community_admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    const user = await storage.updateUserRole(userId, role, permissions);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await auditAction(req, 'update', 'user', userId.toString());
    res.json({ user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle' });
  }
});

/**
 * GET /api/super-admin/communities
 * Liste toutes les communautés
 */
router.get('/communities', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const communities = await storage.getAllCommunities();
    await auditAction(req, 'view', 'communities');
    res.json({ communities });
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des communautés' });
  }
});

/**
 * PUT /api/super-admin/communities/:id/subscription
 * Met à jour l'abonnement d'une communauté
 */
router.put('/communities/:id/subscription', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const { subscription, resourceLimits } = req.body;

    if (!['free', 'premium', 'enterprise'].includes(subscription)) {
      return res.status(400).json({ error: 'Type d\'abonnement invalide' });
    }

    const community = await storage.updateCommunitySubscription(communityId, subscription, resourceLimits);
    
    if (!community) {
      return res.status(404).json({ error: 'Communauté non trouvée' });
    }

    await auditAction(req, 'update', 'community', communityId.toString());
    res.json({ community });
  } catch (error) {
    console.error('Error updating community subscription:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'abonnement' });
  }
});

// Monitoring et audit

/**
 * GET /api/super-admin/audit-logs
 * Récupère les logs d'audit
 */
router.get('/audit-logs', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      userId, 
      action, 
      resource, 
      limit = 100, 
      offset = 0 
    } = req.query;

    const logs = await storage.getInfrastructureAuditLogs({
      startDate: startDate as string,
      endDate: endDate as string,
      userId: userId ? parseInt(userId as string) : undefined,
      action: action as string,
      resource: resource as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    await auditAction(req, 'view', 'audit_logs');
    res.json({ logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des logs d\'audit' });
  }
});

/**
 * GET /api/super-admin/stats
 * Statistiques globales de la plateforme
 */
router.get('/stats', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const stats = await storage.getPlatformStats();
    await auditAction(req, 'view', 'platform_stats');
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// vCluster management

/**
 * GET /api/super-admin/vclusters
 * Liste tous les vClusters actifs
 */
router.get('/vclusters', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const vclusters = await storage.getAllVClusters();
    await auditAction(req, 'view', 'vclusters');
    res.json({ vclusters });
  } catch (error) {
    console.error('Error fetching vClusters:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des vClusters' });
  }
});

/**
 * DELETE /api/super-admin/vclusters/:id
 * Supprime un vCluster (emergency cleanup)
 */
router.delete('/vclusters/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const vclusterId = parseInt(req.params.id);
    const vcluster = await storage.getVCluster(vclusterId);
    
    if (!vcluster) {
      return res.status(404).json({ error: 'vCluster non trouvé' });
    }

    // Supprimer le vCluster sur Kubernetes
    const kubernetesService = new KubernetesService();
    await kubernetesService.deleteVCluster(vcluster.name, vcluster.namespace);
    
    // Mettre à jour le statut en base
    await storage.updateVClusterStatus(vclusterId, 'deleted');

    await auditAction(req, 'delete', 'vcluster', vclusterId.toString());
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting vCluster:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du vCluster' });
  }
});

export { router as superAdminRoutes };