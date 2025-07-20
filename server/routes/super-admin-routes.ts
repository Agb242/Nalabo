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

// Middleware pour permissions spécifiques avec audit
const requireSpecificPermission = (permission: string, riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
  return async (req: any, res: any, next: any) => {
    if (!req.session.userId || req.session.userRole !== 'super_admin') {
      return res.status(403).json({ error: 'Super Admin requis' });
    }

    try {
      // Audit de la tentative d'accès
      await auditAction(req, 'permission_check', permission, undefined, {
        riskLevel,
        permission,
        endpoint: req.originalUrl,
        method: req.method
      });

      // Pour les actions critiques, ajouter des vérifications supplémentaires
      if (riskLevel === 'critical') {
        const lastCriticalAction = await storage.getLastCriticalAction(req.session.userId);
        const timeSinceLastAction = lastCriticalAction ? 
          Date.now() - new Date(lastCriticalAction.timestamp).getTime() : Infinity;
        
        // Limite d'actions critiques : max 1 par minute
        if (timeSinceLastAction < 60000) {
          await auditAction(req, 'critical_action_blocked', permission, undefined, {
            reason: 'Too many critical actions',
            lastActionTime: lastCriticalAction.timestamp,
            rateLimited: true
          });
          return res.status(429).json({ 
            error: 'Trop d\'actions critiques. Attendez 1 minute.',
            riskLevel: 'critical',
            nextAllowedAt: new Date(new Date(lastCriticalAction.timestamp).getTime() + 60000)
          });
        }
      }

      next();
    } catch (error) {
      console.error('Permission verification error:', error);
      res.status(500).json({ error: 'Erreur de vérification des permissions' });
    }
  };
};

// Middleware pour l'audit des actions (conformité RGPD)
const auditAction = async (
  req: any, 
  action: string, 
  resource: string, 
  resourceId?: string, 
  additionalDetails?: any
) => {
  try {
    const auditEntry = {
      userId: req.session.userId,
      action,
      resource,
      resourceId,
      details: {
        // Informations techniques
        method: req.method,
        url: req.originalUrl,
        userAgent: req.headers['user-agent'],
        
        // Données de la requête (filtrées pour sécurité)
        bodyFingerprint: req.body ? Object.keys(req.body).sort().join(',') : null,
        
        // Informations de session
        sessionId: req.sessionID,
        sessionStart: req.session.createdAt,
        
        // Géolocalisation (si disponible)
        country: req.headers['cf-ipcountry'] || null,
        
        // Détails supplémentaires
        ...additionalDetails,
        
        // Conformité RGPD
        legalBasis: determineLegalBasis(action, resource),
        dataCategories: determineDataCategories(action, resource),
        retention: determineRetentionPeriod(action, resource)
      },
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
    };

    await storage.createInfrastructureAuditLog(auditEntry);

    // Alertes automatiques pour actions critiques
    if (additionalDetails?.riskLevel === 'critical') {
      await sendCriticalActionAlert(auditEntry);
    }

  } catch (error) {
    console.error('Audit logging failed:', error);
    // En cas d'échec audit, bloquer l'action pour sécurité
    throw new Error('Audit obligatoire - Action bloquée pour sécurité');
  }
};

// Déterminer la base légale RGPD
const determineLegalBasis = (action: string, resource: string): string => {
  const gdprBasis = {
    'user_management': 'legitimate_interest',
    'data_export': 'legal_obligation',
    'data_deletion': 'legal_obligation',
    'infrastructure': 'legitimate_interest',
    'billing': 'contract_performance',
    'security': 'legitimate_interest'
  };
  return gdprBasis[resource] || 'legitimate_interest';
};

// Déterminer les catégories de données
const determineDataCategories = (action: string, resource: string): string[] => {
  const categories = {
    'user': ['identity', 'contact'],
    'workshop': ['usage', 'behavioral'],
    'billing': ['financial', 'identity'],
    'infrastructure': ['technical', 'logs']
  };
  return categories[resource] || ['technical'];
};

// Déterminer la période de rétention
const determineRetentionPeriod = (action: string, resource: string): string => {
  const retention = {
    'user_management': '3_years',
    'financial': '10_years',
    'security': '1_year',
    'infrastructure': '6_months'
  };
  return retention[resource] || '1_year';
};

// Alerte pour actions critiques
const sendCriticalActionAlert = async (auditEntry: any) => {
  // Log spécial pour actions critiques
  console.error('🚨 CRITICAL ACTION PERFORMED:', {
    user: auditEntry.userId,
    action: auditEntry.action,
    resource: auditEntry.resource,
    timestamp: auditEntry.timestamp,
    ip: auditEntry.ipAddress
  });
  
  // TODO: Envoyer notification email/Slack aux autres super admins
  // TODO: Intégration système de monitoring (DataDog, NewRelic, etc.)
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
 * POST /api/super-admin/infrastructure/validate-kubeconfig
 * Valide un kubeconfig et retourne les informations du cluster
 */
router.post('/infrastructure/validate-kubeconfig', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { kubeconfig } = req.body;
    
    if (!kubeconfig) {
      return res.status(400).json({ error: 'Kubeconfig requis' });
    }

    // Valider le format du kubeconfig
    if (!KubernetesService.validateKubeconfig(kubeconfig)) {
      return res.status(400).json({ error: 'Format kubeconfig invalide' });
    }

    // Extraire les informations
    const clusterInfo = KubernetesService.extractClusterInfo(kubeconfig);
    
    // Tester la connexion
    const kubernetesService = new KubernetesService();
    const connectionTest = await kubernetesService.testConnection(kubeconfig);
    
    if (!connectionTest) {
      return res.status(400).json({ error: 'Impossible de se connecter au cluster avec ce kubeconfig' });
    }

    // Obtenir des infos détaillées du cluster
    try {
      const { stdout: versionOutput } = await kubernetesService.executeKubectl(['version', '--output=json'], kubeconfig);
      const versionInfo = JSON.parse(versionOutput);
      
      const { stdout: nodeOutput } = await kubernetesService.executeKubectl(['get', 'nodes', '--output=json'], kubeconfig);
      const nodesInfo = JSON.parse(nodeOutput);
      
      res.json({
        valid: true,
        clusterInfo: {
          ...clusterInfo,
          context: kubernetesService.getCurrentContext(kubeconfig),
          version: versionInfo.serverVersion?.gitVersion || 'Unknown',
          nodeCount: nodesInfo.items?.length || 0,
          nodes: nodesInfo.items?.map((node: any) => ({
            name: node.metadata.name,
            version: node.status.nodeInfo.kubeletVersion,
            ready: node.status.conditions?.find((c: any) => c.type === 'Ready')?.status === 'True'
          })) || []
        }
      });
    } catch (detailError) {
      // Si on ne peut pas obtenir les détails, retourner quand même les infos de base
      res.json({
        valid: true,
        clusterInfo
      });
    }

  } catch (error) {
    console.error('Error validating kubeconfig:', error);
    res.status(500).json({ error: 'Erreur lors de la validation du kubeconfig' });
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

    // Vérifier si le cluster n'existe pas déjà
    const existingCluster = await storage.findClusterByEndpoint(clusterInfo.endpoint);
    if (existingCluster) {
      return res.status(400).json({ 
        error: 'Un cluster avec cet endpoint existe déjà',
        existingCluster: existingCluster.name
      });
    }

    // Créer le cluster dans la base de données avec toutes les informations
    const cluster = await storage.createKubernetesCluster({
      ...clusterData,
      endpoint: clusterInfo.endpoint || `https://${clusterData.name}.local`,
      managedById: req.session.userId,
      status: 'active',
      metadata: {
        clusterInfo,
        addedAt: new Date().toISOString(),
        addedBy: req.session.username
      }
    });

    // Créer une entrée d'audit détaillée
    await auditAction(req, 'create', 'cluster', cluster.id.toString());
    
    res.status(201).json({ 
      cluster,
      message: 'Cluster ajouté avec succès et connexion validée'
    });
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