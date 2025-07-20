import { Router } from 'express';
import { WorkshopOrchestrator } from '../services/workshop-orchestrator';
import { KubernetesService } from '../services/kubernetes-service';
import { requireAuth } from '../auth';
import { z } from 'zod';

// Initialiser les services (à configurer selon votre infrastructure)
const kubernetesConfig = {
  kubeconfig: process.env.KUBECONFIG,
  namespace: process.env.K8S_NAMESPACE || 'nalabo',
  context: process.env.K8S_CONTEXT,
};

const kubernetesService = new KubernetesService(kubernetesConfig);
const workshopOrchestrator = new WorkshopOrchestrator(kubernetesService);

const router = Router();

// Schémas de validation
const startSessionSchema = z.object({
  workshopId: z.string(),
  duration: z.number().optional(),
  resources: z.object({
    cpu: z.string(),
    memory: z.string(),
    storage: z.string(),
  }).optional(),
});

const executeCommandSchema = z.object({
  command: z.string(),
  timeout: z.number().optional(),
});

const applyManifestsSchema = z.object({
  manifests: z.string(),
});

/**
 * Démarre une nouvelle session d'atelier
 */
router.post('/sessions', requireAuth, async (req, res) => {
  try {
    const { workshopId, duration, resources } = startSessionSchema.parse(req.body);
    const userId = req.session.userId!.toString();

    const session = await workshopOrchestrator.startWorkshopSession(
      workshopId,
      userId,
      { duration, resources }
    );

    res.status(201).json({
      success: true,
      session: {
        id: session.id,
        workshopId: session.workshopId,
        status: session.status,
        currentStep: session.currentStep,
        expiresAt: session.expiresAt,
        environmentId: session.environmentId,
      },
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start session',
    });
  }
});

/**
 * Obtient le statut d'une session
 */
router.get('/sessions/:sessionId', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const status = await workshopOrchestrator.getSessionStatus(sessionId);

    res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error('Get session status error:', error);
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Session not found',
    });
  }
});

/**
 * Exécute une commande dans une session
 */
router.post('/sessions/:sessionId/execute', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { command, timeout } = executeCommandSchema.parse(req.body);

    const result = await workshopOrchestrator.executeCommand(sessionId, command, { timeout });

    res.json({
      success: true,
      result: {
        output: result.output,
        exitCode: result.exitCode,
        timestamp: result.timestamp,
      },
    });
  } catch (error) {
    console.error('Execute command error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Command execution failed',
    });
  }
});

/**
 * Valide une étape de l'atelier
 */
router.post('/sessions/:sessionId/validate/:stepId', requireAuth, async (req, res) => {
  try {
    const { sessionId, stepId } = req.params;

    const validation = await workshopOrchestrator.validateStep(sessionId, stepId);

    res.json({
      success: true,
      validation: {
        valid: validation.valid,
        score: validation.score,
        feedback: validation.feedback,
      },
    });
  } catch (error) {
    console.error('Validate step error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Step validation failed',
    });
  }
});

/**
 * Obtient les logs d'une session
 */
router.get('/sessions/:sessionId/logs', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { podName, follow, tail } = req.query;

    const options = {
      follow: follow === 'true',
      tail: tail ? parseInt(tail as string) : undefined,
    };

    const logs = await workshopOrchestrator.getSessionLogs(
      sessionId,
      podName as string,
      options
    );

    if (options.follow && typeof logs !== 'string') {
      // Stream les logs en temps réel
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');

      logs.on('data', (chunk) => {
        res.write(chunk);
      });

      logs.on('end', () => {
        res.end();
      });

      logs.on('error', (error) => {
        res.status(500).end(`Error: ${error.message}`);
      });
    } else {
      res.json({
        success: true,
        logs: logs as string,
      });
    }
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get logs',
    });
  }
});

/**
 * Applique des manifestes YAML dans une session
 */
router.post('/sessions/:sessionId/apply', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { manifests } = applyManifestsSchema.parse(req.body);

    await workshopOrchestrator.applyManifests(sessionId, manifests);

    res.json({
      success: true,
      message: 'Manifests applied successfully',
    });
  } catch (error) {
    console.error('Apply manifests error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to apply manifests',
    });
  }
});

/**
 * Termine une session d'atelier
 */
router.delete('/sessions/:sessionId', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    await workshopOrchestrator.endSession(sessionId);

    res.json({
      success: true,
      message: 'Session ended successfully',
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to end session',
    });
  }
});

/**
 * Obtient toutes les sessions actives (admin seulement)
 */
router.get('/sessions', requireAuth, async (req, res) => {
  try {
    const sessions = workshopOrchestrator.getActiveSessions();

    // Filtrer par utilisateur si pas admin
    const filteredSessions = req.session.userRole === 'admin' 
      ? sessions 
      : sessions.filter(s => s.userId === req.session.userId!.toString());

    res.json({
      success: true,
      sessions: filteredSessions.map(session => ({
        id: session.id,
        workshopId: session.workshopId,
        userId: session.userId,
        status: session.status,
        currentStep: session.currentStep,
        totalScore: session.totalScore,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
      })),
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sessions',
    });
  }
});

/**
 * Obtient les templates d'ateliers disponibles
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = workshopOrchestrator.getTemplates();

    res.json({
      success: true,
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        difficulty: template.difficulty,
        estimatedDuration: template.estimatedDuration,
        resources: template.resources,
      })),
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get templates',
    });
  }
});

/**
 * Obtient les environnements Kubernetes actifs (admin seulement)
 */
router.get('/environments', requireAuth, async (req, res) => {
  try {
    if (req.session.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const environments = kubernetesService.getActiveEnvironments();

    res.json({
      success: true,
      environments: environments.map(env => ({
        id: env.id,
        vclusterName: env.vclusterName,
        namespace: env.namespace,
        status: env.status,
        resources: env.resources,
        createdAt: env.createdAt,
        expiresAt: env.expiresAt,
      })),
    });
  } catch (error) {
    console.error('Get environments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get environments',
    });
  }
});

// Gestion des événements du WorkshopOrchestrator
workshopOrchestrator.on('sessionStarted', (session) => {
  console.log(`Workshop session started: ${session.id}`);
});

workshopOrchestrator.on('sessionCompleted', (session) => {
  console.log(`Workshop session completed: ${session.id} with score ${session.totalScore}`);
});

workshopOrchestrator.on('sessionError', (session, error) => {
  console.error(`Workshop session error: ${session.id}`, error);
});

workshopOrchestrator.on('commandExecuted', (session, command, result) => {
  console.log(`Command executed in session ${session.id}: ${command} (exit code: ${result.exitCode})`);
});

export default router;