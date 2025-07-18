import { Router } from 'express';
import { EnhancedWorkshopOrchestrator } from '../services/enhanced-workshop-orchestrator';
import { InfrastructureFactory, DefaultInfrastructureConfigs } from '../services/infrastructure/infrastructure-factory';
import { requireAuth } from '../auth';
import { z } from 'zod';

// Initialiser l'orchestrateur d'ateliers
const workshopOrchestrator = new EnhancedWorkshopOrchestrator();

const router = Router();

// Schémas de validation
const startSessionSchema = z.object({
  workshopId: z.string(),
  infrastructureType: z.enum(['kubernetes', 'docker']).optional(),
  duration: z.number().optional(),
  resources: z.object({
    cpu: z.string(),
    memory: z.string(),
    storage: z.string(),
    gpu: z.string().optional(),
  }).optional(),
});

const executeCommandSchema = z.object({
  command: z.string(),
  timeout: z.number().optional(),
});

const applyConfigurationSchema = z.object({
  configuration: z.string(),
  type: z.enum(['yaml', 'dockerfile', 'compose']),
});

/**
 * @route POST /api/workshops/sessions
 * @desc Démarre une nouvelle session d'atelier
 * @access Private
 */
router.post('/sessions', requireAuth, async (req, res) => {
  try {
    const { workshopId, infrastructureType, duration, resources } = startSessionSchema.parse(req.body);
    const userId = req.session.userId!.toString();

    const session = await workshopOrchestrator.startWorkshopSession(
      workshopId,
      userId,
      { infrastructureType, duration, resources }
    );

    res.status(201).json({
      success: true,
      session: {
        id: session.id,
        workshopId: session.workshopId,
        infrastructureType: session.infrastructureType,
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
 * @route GET /api/workshops/sessions/:sessionId
 * @desc Obtient le statut d'une session
 * @access Private
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
 * @route POST /api/workshops/sessions/:sessionId/execute
 * @desc Exécute une commande dans une session
 * @access Private
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
 * @route POST /api/workshops/sessions/:sessionId/validate/:stepId
 * @desc Valide une étape de l'atelier
 * @access Private
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
 * @route GET /api/workshops/sessions/:sessionId/logs
 * @desc Obtient les logs d'une session
 * @access Private
 */
router.get('/sessions/:sessionId/logs', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { target, follow, tail } = req.query;

    const options = {
      follow: follow === 'true',
      tail: tail ? parseInt(tail as string) : undefined,
    };

    const logs = await workshopOrchestrator.getSessionLogs(
      sessionId,
      target as string,
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
 * @route POST /api/workshops/sessions/:sessionId/apply
 * @desc Applique des configurations dans une session
 * @access Private
 */
router.post('/sessions/:sessionId/apply', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { configuration, type } = applyConfigurationSchema.parse(req.body);

    await workshopOrchestrator.applyConfiguration(sessionId, configuration, type);

    res.json({
      success: true,
      message: `${type} configuration applied successfully`,
    });
  } catch (error) {
    console.error('Apply configuration error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to apply configuration',
    });
  }
});

/**
 * @route DELETE /api/workshops/sessions/:sessionId
 * @desc Termine une session d'atelier
 * @access Private
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
 * @route GET /api/workshops/sessions
 * @desc Obtient toutes les sessions actives
 * @access Private
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
        infrastructureType: session.infrastructureType,
        status: session.status,
        currentStep: session.currentStep,
        totalScore: session.totalScore,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        lastActivity: session.lastActivity,
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
 * @route GET /api/workshops/templates
 * @desc Obtient les templates d'ateliers disponibles
 * @access Public
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
        infrastructureType: template.infrastructureType,
        resources: template.resources,
        networking: template.networking,
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
 * @route GET /api/workshops/infrastructure
 * @desc Obtient les types d'infrastructure disponibles
 * @access Private
 */
router.get('/infrastructure', requireAuth, async (req, res) => {
  try {
    const availableInfrastructures = workshopOrchestrator.getAvailableInfrastructures();

    res.json({
      success: true,
      infrastructures: availableInfrastructures.map(type => ({
        type,
        available: true,
        description: type === 'kubernetes' ? 
          'Environnements isolés avec vCluster' : 
          'Conteneurs Docker légers et rapides',
      })),
    });
  } catch (error) {
    console.error('Get infrastructure error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get infrastructure information',
    });
  }
});

/**
 * @route GET /api/workshops/health
 * @desc Vérifie la santé des services d'infrastructure
 * @access Private (Admin only)
 */
router.get('/health', requireAuth, async (req, res) => {
  try {
    if (req.session.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const infrastructures = workshopOrchestrator.getAvailableInfrastructures();
    const healthStatus: Record<string, any> = {};

    for (const infraType of infrastructures) {
      try {
        // Tester la connectivité de chaque infrastructure
        const services = InfrastructureFactory.getAllInstances();
        const service = services.find(s => s.constructor.name.toLowerCase().includes(infraType));
        
        if (service) {
          healthStatus[infraType] = {
            status: 'healthy',
            activeEnvironments: service.getActiveEnvironments().length,
            lastCheck: new Date(),
          };
        }
      } catch (error) {
        healthStatus[infraType] = {
          status: 'unhealthy',
          error: error.message,
          lastCheck: new Date(),
        };
      }
    }

    res.json({
      success: true,
      health: healthStatus,
      activeSessions: workshopOrchestrator.getActiveSessions().length,
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform health check',
    });
  }
});

// Gestion des événements de l'orchestrateur
workshopOrchestrator.on('sessionStarted', (session) => {
  console.log(`Workshop session started: ${session.id} (${session.infrastructureType})`);
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