/**
 * Interface de base pour tous les services d'infrastructure
 * Permet de supporter différents types d'orchestrateurs (Kubernetes, Docker, etc.)
 */

export interface InfrastructureConfig {
  type: 'kubernetes' | 'docker';
  name: string;
  endpoint?: string;
  credentials?: {
    token?: string;
    username?: string;
    password?: string;
    certificatePath?: string;
  };
  namespace?: string;
  context?: string;
  dockerHost?: string;
  dockerNetwork?: string;
}

export interface WorkshopEnvironment {
  id: string;
  type: 'kubernetes' | 'docker';
  name: string;
  status: 'creating' | 'ready' | 'error' | 'destroying';
  endpoints: {
    api?: string;
    web?: string;
    ssh?: string;
    custom?: Record<string, string>;
  };
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
  metadata: {
    workshopId: string;
    userId: string;
    createdAt: Date;
    expiresAt: Date;
    lastActivity: Date;
  };
  // Spécifique à chaque infrastructure
  kubernetesData?: {
    vclusterName: string;
    namespace: string;
    kubeconfig: string;
  };
  dockerData?: {
    containerId: string;
    networkId: string;
    volumeIds: string[];
  };
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timestamp: Date;
  duration: number;
}

export interface LogOptions {
  follow?: boolean;
  tail?: number;
  since?: Date;
  timestamps?: boolean;
}

/**
 * Interface commune pour tous les services d'infrastructure
 */
export abstract class BaseInfrastructureService {
  protected config: InfrastructureConfig;
  protected environments: Map<string, WorkshopEnvironment> = new Map();

  constructor(config: InfrastructureConfig) {
    this.config = config;
  }

  /**
   * Crée un nouvel environnement d'atelier
   */
  abstract createEnvironment(
    workshopId: string,
    userId: string,
    config: EnvironmentCreationConfig
  ): Promise<WorkshopEnvironment>;

  /**
   * Détruit un environnement d'atelier
   */
  abstract destroyEnvironment(environmentId: string): Promise<void>;

  /**
   * Exécute une commande dans un environnement
   */
  abstract executeCommand(
    environmentId: string,
    command: string[],
    options?: { timeout?: number; workingDir?: string }
  ): Promise<CommandResult>;

  /**
   * Obtient les logs d'un environnement
   */
  abstract getLogs(
    environmentId: string,
    target?: string,
    options?: LogOptions
  ): Promise<string | NodeJS.ReadableStream>;

  /**
   * Applique des manifestes/configurations dans un environnement
   */
  abstract applyConfiguration(
    environmentId: string,
    configuration: string,
    type: 'yaml' | 'dockerfile' | 'compose'
  ): Promise<void>;

  /**
   * Obtient le statut d'un environnement
   */
  abstract getEnvironmentStatus(environmentId: string): Promise<EnvironmentStatus>;

  /**
   * Nettoie les environnements expirés
   */
  async cleanupExpiredEnvironments(): Promise<void> {
    const now = new Date();
    
    for (const [id, environment] of this.environments.entries()) {
      if (environment.metadata.expiresAt < now) {
        try {
          await this.destroyEnvironment(id);
        } catch (error) {
          console.error(`Failed to cleanup environment ${id}:`, error);
        }
      }
    }
  }

  /**
   * Obtient tous les environnements actifs
   */
  getActiveEnvironments(): WorkshopEnvironment[] {
    return Array.from(this.environments.values());
  }

  /**
   * Obtient un environnement spécifique
   */
  getEnvironment(environmentId: string): WorkshopEnvironment | undefined {
    return this.environments.get(environmentId);
  }

  /**
   * Met à jour la dernière activité d'un environnement
   */
  protected updateLastActivity(environmentId: string): void {
    const environment = this.environments.get(environmentId);
    if (environment) {
      environment.metadata.lastActivity = new Date();
    }
  }
}

export interface EnvironmentCreationConfig {
  template?: string;
  resources?: {
    cpu: string;
    memory: string;
    storage: string;
    gpu?: string;
  };
  networking?: {
    ports: number[];
    ingress?: boolean;
    loadBalancer?: boolean;
  };
  duration?: number; // en minutes
  environmentVariables?: Record<string, string>;
  volumes?: VolumeConfig[];
  initScripts?: string[];
}

export interface VolumeConfig {
  name: string;
  type: 'emptyDir' | 'hostPath' | 'persistentVolume';
  mountPath: string;
  size?: string;
  hostPath?: string;
}

export interface EnvironmentStatus {
  environment: WorkshopEnvironment;
  resources?: {
    pods?: any[];
    services?: any[];
    containers?: any[];
    networks?: any[];
    volumes?: any[];
  };
  metrics?: {
    cpuUsage: number;
    memoryUsage: number;
    networkIO: {
      bytesIn: number;
      bytesOut: number;
    };
  };
  health?: {
    status: 'healthy' | 'unhealthy' | 'unknown';
    checks: HealthCheck[];
  };
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  timestamp: Date;
}