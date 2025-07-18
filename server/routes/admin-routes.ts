import { Router } from 'express';
import { z } from 'zod';
import { infrastructureManager, KubernetesCluster } from '../services/infrastructure-manager';
import { requireAuth, requireAdmin } from '../auth';

const router = Router();

// Schémas de validation
const createClusterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  endpoint: z.string().url('Valid endpoint URL is required'),
  kubeconfig: z.string().optional(),
  token: z.string().optional(),
  namespace: z.string().default('nalabo'),
  context: z.string().optional(),
  isDefault: z.boolean().default(false),
}).refine(data => data.kubeconfig || data.token, {
  message: 'Either kubeconfig or token is required',
});

const updateClusterSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  endpoint: z.string().url().optional(),
  kubeconfig: z.string().optional(),
  token: z.string().optional(),
  namespace: z.string().optional(),
  context: z.string().optional(),
  isDefault: z.boolean().optional(),
});

/**
 * @route GET /api/admin/infrastructures
 * @desc Obtenir toutes les infrastructures Kubernetes
 * @access Admin
 */
router.get('/infrastructures', requireAuth, requireAdmin, async (req, res) => {
  try {
    const clusters = infrastructureManager.getAllClusters();
    
    // Masquer les informations sensibles
    const sanitizedClusters = clusters.map(cluster => ({
      ...cluster,
      kubeconfig: cluster.kubeconfig ? '[PROTECTED]' : undefined,
      token: cluster.token ? '[PROTECTED]' : undefined,
    }));

    res.json({
      success: true,
      infrastructures: sanitizedClusters,
    });
  } catch (error) {
    console.error('Get infrastructures error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get infrastructures',
    });
  }
});

/**
 * @route POST /api/admin/infrastructures
 * @desc Ajouter une nouvelle infrastructure Kubernetes
 * @access Admin
 */
router.post('/infrastructures', requireAuth, requireAdmin, async (req, res) => {
  try {
    const clusterData = createClusterSchema.parse(req.body);
    
    const cluster = await infrastructureManager.addCluster(clusterData);
    
    // Masquer les informations sensibles dans la réponse
    const sanitizedCluster = {
      ...cluster,
      kubeconfig: cluster.kubeconfig ? '[PROTECTED]' : undefined,
      token: cluster.token ? '[PROTECTED]' : undefined,
    };

    res.status(201).json({
      success: true,
      infrastructure: sanitizedCluster,
    });
  } catch (error) {
    console.error('Add infrastructure error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add infrastructure',
    });
  }
});

/**
 * @route PUT /api/admin/infrastructures/:id
 * @desc Modifier une infrastructure existante
 * @access Admin
 */
router.put('/infrastructures/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = updateClusterSchema.parse(req.body);
    
    const cluster = await infrastructureManager.updateCluster(id, updates);
    
    // Masquer les informations sensibles dans la réponse
    const sanitizedCluster = {
      ...cluster,
      kubeconfig: cluster.kubeconfig ? '[PROTECTED]' : undefined,
      token: cluster.token ? '[PROTECTED]' : undefined,
    };

    res.json({
      success: true,
      infrastructure: sanitizedCluster,
    });
  } catch (error) {
    console.error('Update infrastructure error:', error);
    const status = error instanceof Error && error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update infrastructure',
    });
  }
});

/**
 * @route DELETE /api/admin/infrastructures/:id
 * @desc Supprimer une infrastructure
 * @access Admin
 */
router.delete('/infrastructures/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await infrastructureManager.removeCluster(id);

    res.json({
      success: true,
      message: 'Infrastructure removed successfully',
    });
  } catch (error) {
    console.error('Remove infrastructure error:', error);
    const status = error instanceof Error && error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove infrastructure',
    });
  }
});

/**
 * @route POST /api/admin/infrastructures/:id/test
 * @desc Tester la connexion à une infrastructure
 * @access Admin
 */
router.post('/infrastructures/:id/test', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await infrastructureManager.testClusterConnection(id);
    const cluster = infrastructureManager.getCluster(id);

    res.json({
      success: true,
      connectionTest: {
        success,
        status: cluster?.status,
        lastHealthCheck: cluster?.lastHealthCheck,
        version: cluster?.version,
        nodes: cluster?.nodes,
      },
    });
  } catch (error) {
    console.error('Test infrastructure error:', error);
    const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    });
  }
});

/**
 * @route GET /api/admin/resources/usage
 * @desc Obtenir les métriques d'utilisation des ressources
 * @access Admin
 */
router.get('/resources/usage', requireAuth, requireAdmin, async (req, res) => {
  try {
    const metrics = await infrastructureManager.getInfrastructureMetrics();

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error('Get resource usage error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get resource usage',
    });
  }
});

/**
 * @route GET /api/admin/infrastructures/:id/environments
 * @desc Obtenir les environnements actifs sur une infrastructure
 * @access Admin
 */
router.get('/infrastructures/:id/environments', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const cluster = infrastructureManager.getCluster(id);
    if (!cluster) {
      return res.status(404).json({
        success: false,
        error: 'Infrastructure not found',
      });
    }

    const service = infrastructureManager.getClusterService(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Infrastructure service not available',
      });
    }

    // Obtenir les environnements actifs
    const environments = await service.listEnvironments();

    res.json({
      success: true,
      environments,
    });
  } catch (error) {
    console.error('Get infrastructure environments error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get environments',
    });
  }
});

/**
 * @route GET /api/admin/infrastructures/:id/resources
 * @desc Obtenir les ressources détaillées d'une infrastructure
 * @access Admin
 */
router.get('/infrastructures/:id/resources', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = infrastructureManager.getClusterService(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Infrastructure service not found',
      });
    }

    // Obtenir les ressources détaillées
    const resources = await service.getResourceUsage();

    res.json({
      success: true,
      resources,
    });
  } catch (error) {
    console.error('Get infrastructure resources error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get infrastructure resources',
    });
  }
});

/**
 * @route POST /api/admin/infrastructures/:id/set-default
 * @desc Définir une infrastructure comme défaut
 * @access Admin
 */
router.post('/infrastructures/:id/set-default', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const cluster = await infrastructureManager.updateCluster(id, { isDefault: true });
    
    // Masquer les informations sensibles dans la réponse
    const sanitizedCluster = {
      ...cluster,
      kubeconfig: cluster.kubeconfig ? '[PROTECTED]' : undefined,
      token: cluster.token ? '[PROTECTED]' : undefined,
    };

    res.json({
      success: true,
      infrastructure: sanitizedCluster,
    });
  } catch (error) {
    console.error('Set default infrastructure error:', error);
    const status = error instanceof Error && error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set default infrastructure',
    });
  }
});

export { router as adminRoutes };