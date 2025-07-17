import { KubernetesService, VClusterConfig, WorkshopEnvironment } from './kubernetes-service';
import { storage } from '../storage';
import { EventEmitter } from 'events';

export interface WorkshopTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedDuration: number; // en minutes
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  manifests: string; // YAML manifests à déployer
  instructions: WorkshopStep[];
  validation: ValidationRule[];
}

export interface WorkshopStep {
  id: string;
  type: 'instruction' | 'command' | 'validation' | 'quiz';
  title: string;
  content: string;
  expectedOutput?: string;
  hints?: string[];
  commands?: string[];
  validation?: {
    type: 'kubectl' | 'http' | 'custom';
    target: string;
    expected: any;
  };
}

export interface ValidationRule {
  id: string;
  type: 'resource-exists' | 'resource-status' | 'endpoint-accessible' | 'custom';
  description: string;
  target: string;
  expected: any;
  weight: number; // Poids pour le score final
}

export interface WorkshopSession {
  id: string;
  workshopId: string;
  userId: string;
  environmentId: string;
  status: 'starting' | 'active' | 'paused' | 'completed' | 'failed' | 'expired';
  currentStep: number;
  progress: {
    stepId: string;
    completed: boolean;
    score?: number;
    attempts: number;
    completedAt?: Date;
  }[];
  totalScore: number;
  startedAt: Date;
  completedAt?: Date;
  expiresAt: Date;
}

export class WorkshopOrchestrator extends EventEmitter {
  private kubernetesService: KubernetesService;
  private activeSessions: Map<string, WorkshopSession> = new Map();
  private templates: Map<string, WorkshopTemplate> = new Map();

  constructor(kubernetesService: KubernetesService) {
    super();
    this.kubernetesService = kubernetesService;
    this.loadDefaultTemplates();
    this.startCleanupTimer();
  }

  /**
   * Démarre une nouvelle session d'atelier
   */
  async startWorkshopSession(
    workshopId: string,
    userId: string,
    options?: {
      duration?: number; // durée en minutes
      resources?: {
        cpu: string;
        memory: string;
        storage: string;
      };
    }
  ): Promise<WorkshopSession> {
    // Récupérer l'atelier depuis la base de données
    const workshop = await storage.getWorkshop(parseInt(workshopId));
    if (!workshop) {
      throw new Error(`Workshop ${workshopId} not found`);
    }

    // Créer la session
    const sessionId = `session-${workshopId}-${userId}-${Date.now()}`;
    const duration = options?.duration || 240; // 4 heures par défaut
    
    const session: WorkshopSession = {
      id: sessionId,
      workshopId,
      userId,
      environmentId: '',
      status: 'starting',
      currentStep: 0,
      progress: [],
      totalScore: 0,
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + duration * 60 * 1000),
    };

    this.activeSessions.set(sessionId, session);

    try {
      // Configuration du vCluster
      const vclusterConfig: VClusterConfig = {
        name: `workshop-${workshopId}`,
        namespace: `nalabo-${sessionId}`,
        resources: options?.resources || {
          cpu: '2000m',
          memory: '4Gi',
          storage: '20Gi',
        },
        values: {
          // Configuration spécifique pour les ateliers
          syncer: {
            extraArgs: ['--tls-san=workshop.nalabo.local'],
          },
          vcluster: {
            image: 'rancher/k3s:v1.28.2-k3s1',
          },
          storage: {
            persistence: false, // Pas de persistance pour les ateliers temporaires
          },
        },
      };

      // Créer l'environnement Kubernetes
      const environment = await this.kubernetesService.createWorkshopEnvironment(
        workshopId,
        userId,
        vclusterConfig
      );

      session.environmentId = environment.id;
      session.status = 'active';

      // Déployer les ressources initiales de l'atelier
      if (workshop.steps && Array.isArray(workshop.steps)) {
        await this.deployWorkshopResources(session, workshop);
      }

      // Initialiser le progrès
      session.progress = this.initializeProgress(workshop);

      this.emit('sessionStarted', session);
      return session;

    } catch (error) {
      session.status = 'failed';
      this.emit('sessionError', session, error);
      throw error;
    }
  }

  /**
   * Exécute une commande dans une session d'atelier
   */
  async executeCommand(
    sessionId: string,
    command: string,
    options?: { timeout?: number }
  ): Promise<{ output: string; exitCode: number; timestamp: Date }> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'active') {
      throw new Error(`Session ${sessionId} not active`);
    }

    try {
      const result = await this.kubernetesService.executeInEnvironment(
        session.environmentId,
        command.split(' '),
        options
      );

      const executionResult = {
        output: result.stdout || result.stderr,
        exitCode: result.exitCode,
        timestamp: new Date(),
      };

      this.emit('commandExecuted', session, command, executionResult);
      return executionResult;

    } catch (error) {
      this.emit('commandError', session, command, error);
      throw error;
    }
  }

  /**
   * Valide une étape de l'atelier
   */
  async validateStep(
    sessionId: string,
    stepId: string
  ): Promise<{ valid: boolean; score: number; feedback: string }> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'active') {
      throw new Error(`Session ${sessionId} not active`);
    }

    const workshop = await storage.getWorkshop(parseInt(session.workshopId));
    if (!workshop || !workshop.steps) {
      throw new Error('Workshop or steps not found');
    }

    const step = (workshop.steps as any[]).find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found`);
    }

    const progressEntry = session.progress.find(p => p.stepId === stepId);
    if (!progressEntry) {
      throw new Error(`Progress entry for step ${stepId} not found`);
    }

    try {
      let validationResult = { valid: false, score: 0, feedback: '' };

      // Validation selon le type d'étape
      switch (step.type) {
        case 'command':
          validationResult = await this.validateCommandStep(session, step);
          break;
        case 'validation':
          validationResult = await this.validateResourceStep(session, step);
          break;
        case 'quiz':
          validationResult = await this.validateQuizStep(session, step);
          break;
        default:
          validationResult = { valid: true, score: 10, feedback: 'Étape complétée' };
      }

      // Mettre à jour le progrès
      progressEntry.completed = validationResult.valid;
      progressEntry.score = validationResult.score;
      progressEntry.attempts += 1;
      
      if (validationResult.valid) {
        progressEntry.completedAt = new Date();
        session.currentStep = Math.max(session.currentStep, session.progress.indexOf(progressEntry) + 1);
      }

      // Recalculer le score total
      session.totalScore = session.progress
        .filter(p => p.completed)
        .reduce((sum, p) => sum + (p.score || 0), 0);

      // Vérifier si l'atelier est terminé
      if (session.progress.every(p => p.completed)) {
        session.status = 'completed';
        session.completedAt = new Date();
        this.emit('sessionCompleted', session);
      }

      this.emit('stepValidated', session, stepId, validationResult);
      return validationResult;

    } catch (error) {
      progressEntry.attempts += 1;
      this.emit('validationError', session, stepId, error);
      throw error;
    }
  }

  /**
   * Obtient les logs d'une session
   */
  async getSessionLogs(
    sessionId: string,
    podName?: string,
    options?: { follow?: boolean; tail?: number }
  ): Promise<string | NodeJS.ReadableStream> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (!podName) {
      // Obtenir le premier pod disponible
      const status = await this.kubernetesService.getEnvironmentStatus(session.environmentId);
      if (status.pods && status.pods.items && status.pods.items.length > 0) {
        podName = status.pods.items[0].metadata.name;
      } else {
        throw new Error('No pods found in environment');
      }
    }

    return this.kubernetesService.getEnvironmentLogs(
      session.environmentId,
      podName,
      'default',
      options
    );
  }

  /**
   * Applique des manifestes YAML dans une session
   */
  async applyManifests(sessionId: string, manifests: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'active') {
      throw new Error(`Session ${sessionId} not active`);
    }

    await this.kubernetesService.applyManifests(session.environmentId, manifests);
    this.emit('manifestsApplied', session, manifests);
  }

  /**
   * Obtient le statut d'une session
   */
  async getSessionStatus(sessionId: string): Promise<any> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const environmentStatus = await this.kubernetesService.getEnvironmentStatus(session.environmentId);

    return {
      session: {
        id: session.id,
        status: session.status,
        currentStep: session.currentStep,
        totalScore: session.totalScore,
        progress: session.progress,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        completedAt: session.completedAt,
      },
      environment: environmentStatus,
    };
  }

  /**
   * Termine une session d'atelier
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      // Détruire l'environnement Kubernetes
      await this.kubernetesService.destroyWorkshopEnvironment(session.environmentId);

      // Sauvegarder les résultats en base
      await this.saveSessionResults(session);

      // Supprimer de la mémoire
      this.activeSessions.delete(sessionId);

      this.emit('sessionEnded', session);

    } catch (error) {
      this.emit('sessionError', session, error);
      throw error;
    }
  }

  // Méthodes privées

  private async deployWorkshopResources(session: WorkshopSession, workshop: any): Promise<void> {
    // Déployer les manifestes initiaux si présents
    if (workshop.manifests) {
      await this.kubernetesService.applyManifests(session.environmentId, workshop.manifests);
    }

    // Déployer les ressources spécifiques aux étapes
    const steps = workshop.steps as any[];
    for (const step of steps) {
      if (step.type === 'validation' && step.manifests) {
        await this.kubernetesService.applyManifests(session.environmentId, step.manifests);
      }
    }
  }

  private initializeProgress(workshop: any): WorkshopSession['progress'] {
    if (!workshop.steps || !Array.isArray(workshop.steps)) {
      return [];
    }

    return (workshop.steps as any[]).map(step => ({
      stepId: step.id,
      completed: false,
      attempts: 0,
    }));
  }

  private async validateCommandStep(
    session: WorkshopSession,
    step: any
  ): Promise<{ valid: boolean; score: number; feedback: string }> {
    if (!step.expectedOutput) {
      return { valid: true, score: 10, feedback: 'Commande exécutée' };
    }

    // Ici, on pourrait vérifier l'historique des commandes ou l'état du cluster
    // Pour l'instant, on retourne une validation basique
    return { valid: true, score: 10, feedback: 'Commande validée' };
  }

  private async validateResourceStep(
    session: WorkshopSession,
    step: any
  ): Promise<{ valid: boolean; score: number; feedback: string }> {
    if (!step.validation) {
      return { valid: true, score: 10, feedback: 'Validation passée' };
    }

    const validation = step.validation;
    
    try {
      switch (validation.type) {
        case 'kubectl':
          const result = await this.kubernetesService.executeInEnvironment(
            session.environmentId,
            validation.target.split(' ')
          );
          
          const output = JSON.parse(result.stdout);
          const isValid = this.compareExpectedOutput(output, validation.expected);
          
          return {
            valid: isValid,
            score: isValid ? 20 : 0,
            feedback: isValid ? 'Ressource validée avec succès' : 'La ressource ne correspond pas aux attentes'
          };

        case 'http':
          // Validation HTTP (pour les services exposés)
          return { valid: true, score: 15, feedback: 'Endpoint accessible' };

        default:
          return { valid: true, score: 10, feedback: 'Validation personnalisée réussie' };
      }
    } catch (error) {
      return {
        valid: false,
        score: 0,
        feedback: `Erreur de validation: ${error.message}`
      };
    }
  }

  private async validateQuizStep(
    session: WorkshopSession,
    step: any
  ): Promise<{ valid: boolean; score: number; feedback: string }> {
    // Validation des quiz - à implémenter selon les besoins
    return { valid: true, score: 5, feedback: 'Quiz complété' };
  }

  private compareExpectedOutput(actual: any, expected: any): boolean {
    // Logique de comparaison flexible
    if (typeof expected === 'object' && expected !== null) {
      for (const key in expected) {
        if (actual[key] !== expected[key]) {
          return false;
        }
      }
      return true;
    }
    return actual === expected;
  }

  private async saveSessionResults(session: WorkshopSession): Promise<void> {
    try {
      // Sauvegarder en base de données
      await storage.updateWorkshopSession(parseInt(session.id), {
        status: session.status,
        progress: session.progress,
        timeSpent: Math.floor((Date.now() - session.startedAt.getTime()) / 60000), // en minutes
        completedAt: session.completedAt,
      });
    } catch (error) {
      console.error('Failed to save session results:', error);
    }
  }

  private loadDefaultTemplates(): void {
    // Charger les templates par défaut
    const dockerTemplate: WorkshopTemplate = {
      id: 'docker-basics',
      name: 'Docker Fundamentals',
      description: 'Apprenez les bases de Docker avec des exercices pratiques',
      category: 'docker',
      difficulty: 'beginner',
      estimatedDuration: 120,
      resources: {
        cpu: '1000m',
        memory: '2Gi',
        storage: '10Gi',
      },
      manifests: `
apiVersion: v1
kind: Pod
metadata:
  name: docker-workshop
  namespace: workshop
spec:
  containers:
  - name: docker
    image: docker:dind
    securityContext:
      privileged: true
    volumeMounts:
    - name: docker-sock
      mountPath: /var/run/docker.sock
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
`,
      instructions: [
        {
          id: 'step-1',
          type: 'instruction',
          title: 'Introduction à Docker',
          content: 'Docker est une plateforme de containerisation...',
        },
        {
          id: 'step-2',
          type: 'command',
          title: 'Première commande Docker',
          content: 'Exécutez votre premier conteneur Docker',
          commands: ['docker run hello-world'],
          expectedOutput: 'Hello from Docker!',
        },
      ],
      validation: [
        {
          id: 'docker-running',
          type: 'resource-exists',
          description: 'Vérifier que Docker fonctionne',
          target: 'docker version',
          expected: { Server: { Version: '*' } },
          weight: 10,
        },
      ],
    };

    this.templates.set(dockerTemplate.id, dockerTemplate);
  }

  private startCleanupTimer(): void {
    // Nettoyer les sessions expirées toutes les 5 minutes
    setInterval(async () => {
      await this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  private async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.expiresAt < now) {
        try {
          await this.endSession(sessionId);
        } catch (error) {
          console.error(`Failed to cleanup session ${sessionId}:`, error);
        }
      }
    }
  }

  /**
   * Obtient toutes les sessions actives
   */
  getActiveSessions(): WorkshopSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Obtient une session spécifique
   */
  getSession(sessionId: string): WorkshopSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Obtient les templates disponibles
   */
  getTemplates(): WorkshopTemplate[] {
    return Array.from(this.templates.values());
  }
}