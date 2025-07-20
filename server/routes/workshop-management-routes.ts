import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth } from '../auth';
import KubernetesService from '../services/kubernetes-service';
import DocumentService from '../services/document-service';
import multer from 'multer';
import { 
  insertWorkshopSchema, 
  insertVclusterInstanceSchema,
  insertWorkshopDocumentSchema,
  WorkshopStepSchema 
} from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Configuration multer pour l'upload de documents
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/markdown',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

const documentService = new DocumentService();

// Middleware pour vérifier les permissions d'atelier
const checkWorkshopPermissions = async (req: any, res: any, next: any) => {
  try {
    const workshopId = parseInt(req.params.workshopId || req.params.id);
    const workshop = await storage.getWorkshop(workshopId);
    
    if (!workshop) {
      return res.status(404).json({ error: 'Atelier non trouvé' });
    }

    // Le créateur ou les community_admin/super_admin peuvent modifier
    const canEdit = workshop.creatorId === req.session.userId || 
                   ['community_admin', 'super_admin'].includes(req.session.userRole);
    
    if (!canEdit) {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    req.workshop = workshop;
    next();
  } catch (error) {
    console.error('Error checking workshop permissions:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification des permissions' });
  }
};

// Workshop CRUD avec outils Kubernetes

/**
 * POST /api/workshops
 * Crée un nouvel atelier avec outils et infrastructure
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const workshopData = insertWorkshopSchema.parse(req.body);
    
    // Valider les étapes et outils
    if (workshopData.steps) {
      const stepsValidation = z.array(WorkshopStepSchema).safeParse(workshopData.steps);
      if (!stepsValidation.success) {
        return res.status(400).json({ 
          error: 'Structure des étapes invalide', 
          details: stepsValidation.error.errors 
        });
      }
    }

    const workshop = await storage.createWorkshop({
      ...workshopData,
      creatorId: req.session.userId,
    });

    res.status(201).json({ workshop });
  } catch (error) {
    console.error('Error creating workshop:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    res.status(500).json({ error: 'Erreur lors de la création de l\'atelier' });
  }
});

/**
 * PUT /api/workshops/:id
 * Met à jour un atelier
 */
router.put('/:id', requireAuth, checkWorkshopPermissions, async (req, res) => {
  try {
    const workshopId = parseInt(req.params.id);
    const updates = req.body;

    // Valider les étapes si elles sont mises à jour
    if (updates.steps) {
      const stepsValidation = z.array(WorkshopStepSchema).safeParse(updates.steps);
      if (!stepsValidation.success) {
        return res.status(400).json({ 
          error: 'Structure des étapes invalide', 
          details: stepsValidation.error.errors 
        });
      }
    }

    const workshop = await storage.updateWorkshop(workshopId, updates);
    res.json({ workshop });
  } catch (error) {
    console.error('Error updating workshop:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'atelier' });
  }
});

// Gestion des documents d'atelier

/**
 * POST /api/workshops/:workshopId/documents
 * Upload un document pour un atelier
 */
router.post('/:workshopId/documents', requireAuth, checkWorkshopPermissions, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const workshopId = parseInt(req.params.workshopId);
    const { stepIndex, description } = req.body;

    // Upload le document
    const uploadResult = await documentService.uploadDocument({
      originalName: req.file.originalname,
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    if (!uploadResult.success) {
      return res.status(400).json({ error: uploadResult.error });
    }

    // Sauvegarder en base
    const document = await storage.createWorkshopDocument({
      workshopId,
      fileName: uploadResult.document!.fileName,
      originalName: uploadResult.document!.originalName,
      fileType: uploadResult.document!.fileType,
      fileSize: uploadResult.document!.fileSize,
      filePath: uploadResult.document!.filePath,
      stepIndex: stepIndex ? parseInt(stepIndex) : undefined,
      description: description || '',
      uploadedById: req.session.userId,
    });

    res.status(201).json({ document });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement du document' });
  }
});

/**
 * GET /api/workshops/:workshopId/documents
 * Récupère tous les documents d'un atelier
 */
router.get('/:workshopId/documents', requireAuth, async (req, res) => {
  try {
    const workshopId = parseInt(req.params.workshopId);
    const documents = await storage.getWorkshopDocuments(workshopId);
    res.json({ documents });
  } catch (error) {
    console.error('Error fetching workshop documents:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
  }
});

/**
 * GET /api/workshops/:workshopId/documents/:documentId
 * Télécharge un document
 */
router.get('/:workshopId/documents/:documentId', requireAuth, async (req, res) => {
  try {
    const documentId = parseInt(req.params.documentId);
    const document = await storage.getWorkshopDocument(documentId);
    
    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    const readResult = await documentService.readDocument(document.filePath);
    
    if (!readResult.success) {
      return res.status(404).json({ error: readResult.error });
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.send(readResult.content);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement du document' });
  }
});

/**
 * DELETE /api/workshops/:workshopId/documents/:documentId
 * Supprime un document
 */
router.delete('/:workshopId/documents/:documentId', requireAuth, checkWorkshopPermissions, async (req, res) => {
  try {
    const documentId = parseInt(req.params.documentId);
    const document = await storage.getWorkshopDocument(documentId);
    
    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    // Supprimer le fichier physique
    await documentService.deleteDocument(document.filePath);
    
    // Supprimer de la base
    await storage.deleteWorkshopDocument(documentId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du document' });
  }
});

// Gestion des vClusters pour ateliers

/**
 * POST /api/workshops/:workshopId/start
 * Démarre un atelier en créant un vCluster dédié
 */
router.post('/:workshopId/start', requireAuth, async (req, res) => {
  try {
    const workshopId = parseInt(req.params.workshopId);
    const workshop = await storage.getWorkshop(workshopId);
    
    if (!workshop) {
      return res.status(404).json({ error: 'Atelier non trouvé' });
    }

    // Vérifier les quotas de l'utilisateur
    const userQuota = await storage.getUserResourceQuota(req.session.userId);
    const activeVClusters = await storage.getActiveVClustersByUser(req.session.userId);
    
    if (activeVClusters.length >= userQuota.maxVClusters) {
      return res.status(429).json({ 
        error: 'Quota de vClusters atteint. Arrêtez un atelier existant d\'abord.' 
      });
    }

    // Sélectionner le cluster K8s disponible
    const availableCluster = await storage.getAvailableKubernetesCluster(workshop.communityId);
    
    if (!availableCluster) {
      return res.status(503).json({ 
        error: 'Aucun cluster Kubernetes disponible. Contactez votre administrateur.' 
      });
    }

    // Créer le vCluster
    const kubernetesService = new KubernetesService();
    const vclusterName = `workshop-${workshopId}-user-${req.session.userId}-${Date.now()}`;
    const namespace = `nalabo-workshop-${workshopId}`;

    const vclusterConfig = {
      name: vclusterName,
      namespace,
      resources: workshop.requiredResources || {
        cpu: '500m',
        memory: '1Gi',
        storage: '2Gi'
      },
      tools: workshop.kubernetesTools?.map((tool: any) => tool.name) || ['kubectl'],
      expiresIn: 24, // 24 heures par défaut
    };

    const createResult = await kubernetesService.createVCluster(vclusterConfig);
    
    if (!createResult.success) {
      return res.status(500).json({ 
        error: 'Erreur lors de la création du vCluster', 
        details: createResult.error 
      });
    }

    // Enregistrer le vCluster en base
    const vclusterInstance = await storage.createVClusterInstance({
      name: vclusterName,
      workshopId,
      userId: req.session.userId,
      clusterId: availableCluster.id,
      namespace,
      vclusterConfig,
      accessConfig: { kubeconfig: createResult.kubeconfig },
      status: 'ready',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    // Créer la session d'atelier
    const session = await storage.createWorkshopSession({
      workshopId,
      userId: req.session.userId,
      status: 'started',
      progress: { vclusterId: vclusterInstance.id },
    });

    res.status(201).json({ 
      session,
      vcluster: vclusterInstance,
      kubeconfig: createResult.kubeconfig 
    });
  } catch (error) {
    console.error('Error starting workshop:', error);
    res.status(500).json({ error: 'Erreur lors du démarrage de l\'atelier' });
  }
});

/**
 * POST /api/workshops/:workshopId/stop
 * Arrête un atelier et nettoie le vCluster
 */
router.post('/:workshopId/stop', requireAuth, async (req, res) => {
  try {
    const workshopId = parseInt(req.params.workshopId);
    
    // Récupérer la session active
    const session = await storage.getActiveWorkshopSession(workshopId, req.session.userId);
    
    if (!session) {
      return res.status(404).json({ error: 'Aucune session active trouvée' });
    }

    const vclusterId = session.progress?.vclusterId;
    if (vclusterId) {
      const vcluster = await storage.getVCluster(vclusterId);
      
      if (vcluster) {
        // Supprimer le vCluster
        const kubernetesService = new KubernetesService();
        await kubernetesService.deleteVCluster(vcluster.name, vcluster.namespace);
        
        // Mettre à jour le statut
        await storage.updateVClusterStatus(vclusterId, 'stopped');
      }
    }

    // Terminer la session
    await storage.completeWorkshopSession(session.id, {
      status: 'completed',
      timeSpent: Math.floor((Date.now() - session.startedAt.getTime()) / 60000), // minutes
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error stopping workshop:', error);
    res.status(500).json({ error: 'Erreur lors de l\'arrêt de l\'atelier' });
  }
});

/**
 * GET /api/workshops/:workshopId/status
 * Récupère le statut d'un atelier en cours
 */
router.get('/:workshopId/status', requireAuth, async (req, res) => {
  try {
    const workshopId = parseInt(req.params.workshopId);
    
    const session = await storage.getActiveWorkshopSession(workshopId, req.session.userId);
    
    if (!session) {
      return res.json({ status: 'not_started' });
    }

    const vclusterId = session.progress?.vclusterId;
    let vclusterStatus = null;
    
    if (vclusterId) {
      const vcluster = await storage.getVCluster(vclusterId);
      if (vcluster) {
        const kubernetesService = new KubernetesService();
        vclusterStatus = await kubernetesService.getVClusterStatus(
          vcluster.name, 
          vcluster.namespace
        );
      }
    }

    res.json({ 
      session,
      vclusterStatus,
      timeElapsed: Math.floor((Date.now() - session.startedAt.getTime()) / 60000)
    });
  } catch (error) {
    console.error('Error getting workshop status:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du statut' });
  }
});

export { router as workshopManagementRoutes };