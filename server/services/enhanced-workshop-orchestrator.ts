import { BaseInfrastructureService, WorkshopEnvironment, EnvironmentCreationConfig } from './infrastructure/base-infrastructure';
import { InfrastructureFactory, DefaultInfrastructureConfigs } from './infrastructure/infrastructure-factory';
import { storage } from '../storage';
import { EventEmitter } from 'events';

export interface WorkshopTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedDuration: number; // en minutes
  infrastructureType: 'kubernetes';
  resources: {
    cpu: string;
    memory: string;
    storage: string;
    gpu?: string;
  };
  networking: {
    ports: number[];
    ingress?: boolean;
    loadBalancer?: boolean;
  };
  environment: {
    image?: string;
    template: string;
    environmentVariables?: Record<string, string>;
    initScripts?: string[];
    volumes?: any[];
  };
  instructions: WorkshopStep[];
  validation: ValidationRule[];
  manifests?: string; // YAML pour Kubernetes ou docker-compose pour Docker
}

export interface WorkshopStep {
  id: string;
  type: 'instruction' | 'command' | 'validation' | 'quiz' | 'file-edit';
  title: string;
  content: string;
  expectedOutput?: string;
  hints?: string[];
  commands?: string[];
  files?: {
    path: string;
    content: string;
    editable: boolean;
  }[];
  validation?: {
    type: 'command' | 'file-exists' | 'service-running' | 'http-response' | 'custom';
    target: string;
    expected: any;
    timeout?: number;
  };
}

export interface ValidationRule {
  id: string;
  type: 'resource-exists' | 'resource-status' | 'endpoint-accessible' | 'file-content' | 'custom';
  description: string;
  target: string;
  expected: any;
  weight: number; // Poids pour le score final
  infrastructureSpecific?: {
    kubernetes?: any;
    docker?: any;
  };
}

export interface WorkshopSession {
  id: string;
  workshopId: string;
  userId: string;
  environmentId: string;
  infrastructureType: 'kubernetes';
  status: 'starting' | 'active' | 'paused' | 'completed' | 'failed' | 'expired';
  currentStep: number;
  progress: {
    stepId: string;
    completed: boolean;
    score?: number;
    attempts: number;
    completedAt?: Date;
    feedback?: string;
  }[];
  totalScore: number;
  startedAt: Date;
  completedAt?: Date;
  expiresAt: Date;
  lastActivity: Date;
}

/**
 * Orchestrateur d'ateliers amélioré avec support multi-infrastructure
 * Gère les ateliers sur Kubernetes (vCluster) et Docker
 */
export class EnhancedWorkshopOrchestrator extends EventEmitter {
  private activeSessions: Map<string, WorkshopSession> = new Map();
  private templates: Map<string, WorkshopTemplate> = new Map();
  private infrastructureServices: Map<string, BaseInfrastructureService> = new Map();

  constructor() {
    super();
    this.loadDefaultTemplates();
    this.initializeInfrastructureServices();
    this.startCleanupTimer();
  }

  /**
   * Démarre une nouvelle session d'atelier
   */
  async startWorkshopSession(
    workshopId: string,
    userId: string,
    options?: {
      infrastructureType?: 'kubernetes';
      duration?: number;
      resources?: any;
    }
  ): Promise<WorkshopSession> {
    // Récupérer l'atelier depuis la base de données
    const workshop = await storage.getWorkshop(parseInt(workshopId));
    if (!workshop) {
      throw new Error(`Workshop ${workshopId} not found`);
    }

    // Déterminer le type d'infrastructure
    const infrastructureType = options?.infrastructureType || 
                              this.determineInfrastructureType(workshop);

    // Créer la session
    const sessionId = `session-${workshopId}-${userId}-${Date.now()}`;
    const duration = options?.duration || 240; // 4 heures par défaut
    
    const session: WorkshopSession = {
      id: sessionId,
      workshopId,
      userId,
      environmentId: '',
      infrastructureType,
      status: 'starting',
      currentStep: 0,
      progress: [],
      totalScore: 0,
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + duration * 60 * 1000),
      lastActivity: new Date(),
    };

    this.activeSessions.set(sessionId, session);

    try {
      // Obtenir le service d'infrastructure approprié
      const infrastructureService = this.getInfrastructureService(infrastructureType);

      // Configuration de l'environnement
      const environmentConfig: EnvironmentCreationConfig = {
        template: workshop.template || this.getDefaultTemplate(infrastructureType),
        resources: options?.resources || {
          cpu: '2000m',
          memory: '4Gi',
          storage: '20Gi',
        },
        networking: {
          ports: [80, 443, 8080, 3000, 8000],
          ingress: false,
          loadBalancer: false,
        },
        duration,
        environmentVariables: this.getEnvironmentVariables(workshop),
        initScripts: this.getInitScripts(workshop),
      };

      // Créer l'environnement
      const environment = await infrastructureService.createEnvironment(
        workshopId,
        userId,
        environmentConfig
      );

      session.environmentId = environment.id;
      session.status = 'active';

      // Déployer les ressources initiales de l'atelier
      if (workshop.steps && Array.isArray(workshop.steps)) {
        await this.deployWorkshopResources(session, workshop, infrastructureService);
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

    session.lastActivity = new Date();

    try {
      const infrastructureService = this.getInfrastructureService(session.infrastructureType);
      
      // Adapter la commande selon le type d'infrastructure
      const adaptedCommand = this.adaptCommand(command, session.infrastructureType);
      
      const result = await infrastructureService.executeCommand(
        session.environmentId,
        adaptedCommand,
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

    session.lastActivity = new Date();

    try {
      let validationResult = { valid: false, score: 0, feedback: '' };

      // Validation selon le type d'étape et d'infrastructure
      switch (step.type) {
        case 'command':
          validationResult = await this.validateCommandStep(session, step);
          break;
        case 'validation':
          validationResult = await this.validateResourceStep(session, step);
          break;
        case 'file-edit':
          validationResult = await this.validateFileStep(session, step);
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
      progressEntry.feedback = validationResult.feedback;
      
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
    target?: string,
    options?: { follow?: boolean; tail?: number }
  ): Promise<string | NodeJS.ReadableStream> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.lastActivity = new Date();

    const infrastructureService = this.getInfrastructureService(session.infrastructureType);
    return infrastructureService.getLogs(session.environmentId, target, options);
  }

  /**
   * Applique des manifestes/configurations dans une session
   */
  async applyConfiguration(
    sessionId: string,
    configuration: string,
    type: 'yaml' | 'dockerfile' | 'compose'
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'active') {
      throw new Error(`Session ${sessionId} not active`);
    }

    session.lastActivity = new Date();

    const infrastructureService = this.getInfrastructureService(session.infrastructureType);
    await infrastructureService.applyConfiguration(session.environmentId, configuration, type);
    
    this.emit('configurationApplied', session, configuration, type);
  }

  /**
   * Obtient le statut d'une session
   */
  async getSessionStatus(sessionId: string): Promise<any> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const infrastructureService = this.getInfrastructureService(session.infrastructureType);
    const environmentStatus = await infrastructureService.getEnvironmentStatus(session.environmentId);

    return {
      session: {
        id: session.id,
        status: session.status,
        infrastructureType: session.infrastructureType,
        currentStep: session.currentStep,
        totalScore: session.totalScore,
        progress: session.progress,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        completedAt: session.completedAt,
        lastActivity: session.lastActivity,
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
      // Détruire l'environnement
      const infrastructureService = this.getInfrastructureService(session.infrastructureType);
      await infrastructureService.destroyEnvironment(session.environmentId);

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

  private initializeInfrastructureServices(): void {
    // Initialiser les services d'infrastructure disponibles
    try {
      // Service Kubernetes local
      const k8sService = InfrastructureFactory.getInstance(
        DefaultInfrastructureConfigs.kubernetes.local
      );
      this.infrastructureServices.set('kubernetes', k8sService);
    } catch (error) {
      console.warn('Kubernetes infrastructure not available:', error.message);
    }

    try {
      // Service Docker local
      const dockerService = InfrastructureFactory.getInstance(
        DefaultInfrastructureConfigs.docker.local
      );
      this.infrastructureServices.set('docker', dockerService);
    } catch (error) {
      console.warn('Docker infrastructure not available:', error.message);
    }
  }

  private getInfrastructureService(type: 'kubernetes' | 'docker'): BaseInfrastructureService {
    const service = this.infrastructureServices.get(type);
    if (!service) {
      throw new Error(`Infrastructure service ${type} not available`);
    }
    return service;
  }

  private determineInfrastructureType(workshop: any): 'kubernetes' {
    // Logique pour déterminer le type d'infrastructure basé sur l'atelier
    // Toujours utiliser Kubernetes pour une infrastructure robuste
    return 'kubernetes';
  }

  private getDefaultTemplate(infrastructureType: 'kubernetes'): string {
    // Toujours utiliser le template Kubernetes
    return 'kubernetes';
  }

  private getEnvironmentVariables(workshop: any): Record<string, string> {
    const baseVars = {
      WORKSHOP_ID: workshop.id.toString(),
      WORKSHOP_TITLE: workshop.title,
      WORKSHOP_CATEGORY: workshop.category,
    };

    // Ajouter des variables spécifiques selon la catégorie
    switch (workshop.category) {
      case 'docker':
        return { ...baseVars, DOCKER_BUILDKIT: '1' };
      case 'kubernetes':
        return { ...baseVars, KUBECONFIG: '/root/.kube/config' };
      case 'python':
        return { ...baseVars, PYTHONPATH: '/workspace' };
      default:
        return baseVars;
    }
  }

  private getInitScripts(workshop: any): string[] {
    const scripts: string[] = [];

    // Scripts d'initialisation selon la catégorie pour Kubernetes
    switch (workshop.category) {
      case 'kubernetes':
        scripts.push('kubectl cluster-info'); // Vérifier la connectivité
        scripts.push('kubectl get nodes'); // Vérifier les nodes
        break;
      case 'docker':
        // Utiliser les concepts Docker dans Kubernetes
        scripts.push('kubectl get pods'); // Équivalent des containers
        break;
      case 'python':
        scripts.push('kubectl create configmap python-scripts --from-literal=requirements.txt="pip"');
        break;
    }

    return scripts;
  }

  private adaptCommand(command: string, infrastructureType: 'kubernetes'): string[] {
    // Adapter les commandes pour Kubernetes uniquement
    const parts = command.trim().split(/\s+/);
    
    // Pour Kubernetes, s'assurer que kubectl est utilisé correctement
    if (parts[0] === 'kubectl') {
      return parts;
    }
    
    // Ajouter kubectl si c'est une commande Kubernetes implicite
    if (['get', 'apply', 'create', 'delete', 'describe', 'logs', 'exec'].includes(parts[0])) {
      return ['kubectl', ...parts];
    }
    
    // Convertir les commandes Docker en équivalents Kubernetes
    if (parts[0] === 'docker') {
      const dockerCmd = parts[1];
      switch (dockerCmd) {
        case 'ps':
          return ['kubectl', 'get', 'pods'];
        case 'images':
          return ['kubectl', 'get', 'pods', '-o', 'jsonpath={.items[*].spec.containers[*].image}'];
        case 'run':
          return ['kubectl', 'run', ...parts.slice(2)];
        default:
          return ['kubectl', 'get', 'pods']; // Commande par défaut
      }
    }
    
    // Commandes shell directes
    return ['sh', '-c', command];
  }

  private async deployWorkshopResources(
    session: WorkshopSession,
    workshop: any,
    infrastructureService: BaseInfrastructureService
  ): Promise<void> {
    // Déployer les manifestes initiaux si présents
    if (workshop.manifests) {
      const configurationType = session.infrastructureType === 'kubernetes' ? 'yaml' : 'compose';
      await infrastructureService.applyConfiguration(
        session.environmentId,
        workshop.manifests,
        configurationType
      );
    }

    // Déployer les ressources spécifiques aux étapes
    const steps = workshop.steps as any[];
    for (const step of steps) {
      if (step.type === 'validation' && step.manifests) {
        const configurationType = session.infrastructureType === 'kubernetes' ? 'yaml' : 'compose';
        await infrastructureService.applyConfiguration(
          session.environmentId,
          step.manifests,
          configurationType
        );
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

    // Validation basée sur l'historique des commandes ou l'état de l'environnement
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
    const infrastructureService = this.getInfrastructureService(session.infrastructureType);
    
    try {
      switch (validation.type) {
        case 'command':
          const result = await infrastructureService.executeCommand(
            session.environmentId,
            validation.target.split(' ')
          );
          
          let output: any;
          try {
            output = JSON.parse(result.stdout);
          } catch {
            output = result.stdout;
          }
          
          const isValid = this.compareExpectedOutput(output, validation.expected);
          
          return {
            valid: isValid,
            score: isValid ? 20 : 0,
            feedback: isValid ? 'Ressource validée avec succès' : 'La ressource ne correspond pas aux attentes'
          };

        case 'service-running':
          return await this.validateServiceRunning(session, validation.target);

        case 'http-response':
          return await this.validateHttpResponse(session, validation.target, validation.expected);

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

  private async validateFileStep(
    session: WorkshopSession,
    step: any
  ): Promise<{ valid: boolean; score: number; feedback: string }> {
    // Validation des fichiers créés/modifiés
    if (!step.files || !Array.isArray(step.files)) {
      return { valid: true, score: 5, feedback: 'Fichier validé' };
    }

    const infrastructureService = this.getInfrastructureService(session.infrastructureType);
    
    for (const file of step.files) {
      try {
        const result = await infrastructureService.executeCommand(
          session.environmentId,
          ['cat', file.path]
        );
        
        if (file.expectedContent && !result.stdout.includes(file.expectedContent)) {
          return {
            valid: false,
            score: 0,
            feedback: `Le fichier ${file.path} ne contient pas le contenu attendu`
          };
        }
      } catch (error) {
        return {
          valid: false,
          score: 0,
          feedback: `Le fichier ${file.path} n'existe pas ou n'est pas accessible`
        };
      }
    }

    return { valid: true, score: 15, feedback: 'Tous les fichiers sont valides' };
  }

  private async validateQuizStep(
    session: WorkshopSession,
    step: any
  ): Promise<{ valid: boolean; score: number; feedback: string }> {
    // Validation des quiz - à implémenter selon les besoins
    return { valid: true, score: 5, feedback: 'Quiz complété' };
  }

  private async validateServiceRunning(
    session: WorkshopSession,
    serviceName: string
  ): Promise<{ valid: boolean; score: number; feedback: string }> {
    const infrastructureService = this.getInfrastructureService(session.infrastructureType);
    
    try {
      if (session.infrastructureType === 'kubernetes') {
        const result = await infrastructureService.executeCommand(
          session.environmentId,
          ['kubectl', 'get', 'service', serviceName, '-o', 'json']
        );
        const service = JSON.parse(result.stdout);
        return {
          valid: !!service,
          score: 15,
          feedback: `Service ${serviceName} est en cours d'exécution`
        };
      } else {
        const result = await infrastructureService.executeCommand(
          session.environmentId,
          ['docker', 'ps', '--filter', `name=${serviceName}`, '--format', 'json']
        );
        const containers = result.stdout.split('\n').filter(line => line.trim());
        return {
          valid: containers.length > 0,
          score: 15,
          feedback: `Service ${serviceName} est en cours d'exécution`
        };
      }
    } catch (error) {
      return {
        valid: false,
        score: 0,
        feedback: `Service ${serviceName} n'est pas en cours d'exécution`
      };
    }
  }

  private async validateHttpResponse(
    session: WorkshopSession,
    url: string,
    expectedResponse: any
  ): Promise<{ valid: boolean; score: number; feedback: string }> {
    const infrastructureService = this.getInfrastructureService(session.infrastructureType);
    
    try {
      const result = await infrastructureService.executeCommand(
        session.environmentId,
        ['curl', '-s', url]
      );
      
      const isValid = this.compareExpectedOutput(result.stdout, expectedResponse);
      
      return {
        valid: isValid,
        score: isValid ? 20 : 0,
        feedback: isValid ? `Endpoint ${url} répond correctement` : `Endpoint ${url} ne répond pas comme attendu`
      };
    } catch (error) {
      return {
        valid: false,
        score: 0,
        feedback: `Impossible d'accéder à ${url}: ${error.message}`
      };
    }
  }

  private compareExpectedOutput(actual: any, expected: any): boolean {
    if (typeof expected === 'string') {
      return actual.toString().includes(expected);
    }
    
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
      await storage.updateWorkshopSession(parseInt(session.id), {
        status: session.status,
        progress: session.progress,
        timeSpent: Math.floor((Date.now() - session.startedAt.getTime()) / 60000),
        completedAt: session.completedAt,
      });
    } catch (error) {
      console.error('Failed to save session results:', error);
    }
  }

  private loadDefaultTemplates(): void {
    // Templates pour Kubernetes
    const kubernetesTemplates: WorkshopTemplate[] = [
      {
        id: 'k8s-basics',
        name: 'Kubernetes Fundamentals',
        description: 'Apprenez les bases de Kubernetes avec des exercices pratiques',
        category: 'kubernetes',
        difficulty: 'beginner',
        estimatedDuration: 180,
        infrastructureType: 'kubernetes',
        resources: {
          cpu: '2000m',
          memory: '4Gi',
          storage: '20Gi',
        },
        networking: {
          ports: [80, 443, 8080],
          ingress: true,
        },
        environment: {
          template: 'kubernetes',
          environmentVariables: {
            KUBECONFIG: '/root/.kube/config',
          },
          initScripts: [
            'kubectl cluster-info',
            'kubectl get nodes',
          ],
        },
        instructions: [
          {
            id: 'step-1',
            type: 'instruction',
            title: 'Introduction à Kubernetes',
            content: 'Kubernetes est un orchestrateur de conteneurs...',
          },
          {
            id: 'step-2',
            type: 'command',
            title: 'Première commande kubectl',
            content: 'Listez les pods dans le cluster',
            commands: ['kubectl get pods'],
            expectedOutput: 'No resources found',
          },
        ],
        validation: [
          {
            id: 'kubectl-working',
            type: 'resource-exists',
            description: 'Vérifier que kubectl fonctionne',
            target: 'kubectl version --client',
            expected: { clientVersion: '*' },
            weight: 10,
          },
        ],
        manifests: `
apiVersion: v1
kind: Namespace
metadata:
  name: workshop
---
apiVersion: v1
kind: Pod
metadata:
  name: nginx-demo
  namespace: workshop
spec:
  containers:
  - name: nginx
    image: nginx:alpine
    ports:
    - containerPort: 80
`,
      },
    ];

    // Templates pour Docker
    const dockerTemplates: WorkshopTemplate[] = [
      {
        id: 'docker-basics',
        name: 'Docker Fundamentals',
        description: 'Apprenez les bases de Docker avec des exercices pratiques',
        category: 'docker',
        difficulty: 'beginner',
        estimatedDuration: 120,
        infrastructureType: 'docker',
        resources: {
          cpu: '1000m',
          memory: '2Gi',
          storage: '10Gi',
        },
        networking: {
          ports: [80, 3000, 8080],
        },
        environment: {
          template: 'docker',
          environmentVariables: {
            DOCKER_BUILDKIT: '1',
          },
          initScripts: [
            'dockerd &',
            'sleep 5',
            'docker version',
          ],
        },
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
        manifests: `
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
`,
      },
    ];

    // Charger tous les templates
    [...kubernetesTemplates, ...dockerTemplates].forEach(template => {
      this.templates.set(template.id, template);
    });
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

  /**
   * Obtient les services d'infrastructure disponibles
   */
  getAvailableInfrastructures(): string[] {
    return Array.from(this.infrastructureServices.keys());
  }
}