import { BaseInfrastructureService, WorkshopEnvironment, CommandResult, LogOptions, EnvironmentCreationConfig, EnvironmentStatus, InfrastructureConfig } from './base-infrastructure';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface DockerContainerConfig {
  image: string;
  name: string;
  ports: Record<string, string>; // containerPort: hostPort
  volumes: Record<string, string>; // hostPath: containerPath
  environment: Record<string, string>;
  networks: string[];
  privileged?: boolean;
  capabilities?: string[];
  workingDir?: string;
  command?: string[];
  entrypoint?: string[];
}

/**
 * Service d'infrastructure Docker
 * Gère la création d'environnements d'ateliers avec Docker et Docker Compose
 */
export class DockerInfrastructureService extends BaseInfrastructureService {
  private networkPrefix: string;

  constructor(config: InfrastructureConfig) {
    super(config);
    this.networkPrefix = 'nalabo';
  }

  /**
   * Crée un environnement d'atelier avec Docker
   */
  async createEnvironment(
    workshopId: string,
    userId: string,
    config: EnvironmentCreationConfig
  ): Promise<WorkshopEnvironment> {
    const environmentId = `workshop-${workshopId}-${userId}-${uuidv4().slice(0, 8)}`;
    const containerName = `nalabo-${environmentId}`;
    const networkName = `${this.networkPrefix}-${environmentId}`;

    const environment: WorkshopEnvironment = {
      id: environmentId,
      type: 'docker',
      name: containerName,
      status: 'creating',
      endpoints: {},
      resources: config.resources || {
        cpu: '2000m',
        memory: '4Gi',
        storage: '20Gi',
      },
      networking: config.networking || {
        ports: [80, 443, 8080],
        ingress: false,
        loadBalancer: false,
      },
      metadata: {
        workshopId,
        userId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + (config.duration || 240) * 60 * 1000),
        lastActivity: new Date(),
      },
      dockerData: {
        containerId: '',
        networkId: '',
        volumeIds: [],
      },
    };

    this.environments.set(environmentId, environment);

    try {
      // 1. Créer le réseau Docker
      const networkId = await this.createNetwork(networkName);
      environment.dockerData!.networkId = networkId;

      // 2. Créer les volumes si nécessaire
      const volumeIds = await this.createVolumes(environmentId, config.volumes || []);
      environment.dockerData!.volumeIds = volumeIds;

      // 3. Déterminer l'image et la configuration du conteneur
      const containerConfig = this.generateContainerConfig(
        containerName,
        networkName,
        config
      );

      // 4. Créer et démarrer le conteneur
      const containerId = await this.createContainer(containerConfig);
      environment.dockerData!.containerId = containerId;

      await this.startContainer(containerId);

      // 5. Configurer les endpoints
      environment.endpoints = await this.setupEndpoints(containerId, environment.networking.ports);

      // 6. Exécuter les scripts d'initialisation
      if (config.initScripts) {
        await this.executeInitScripts(containerId, config.initScripts);
      }

      environment.status = 'ready';
      return environment;

    } catch (error) {
      environment.status = 'error';
      // Nettoyer en cas d'erreur
      await this.cleanupFailedEnvironment(environment);
      throw error;
    }
  }

  /**
   * Détruit un environnement Docker
   */
  async destroyEnvironment(environmentId: string): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment || !environment.dockerData) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    environment.status = 'destroying';

    try {
      // Arrêter et supprimer le conteneur
      if (environment.dockerData.containerId) {
        await this.stopContainer(environment.dockerData.containerId);
        await this.removeContainer(environment.dockerData.containerId);
      }

      // Supprimer les volumes
      for (const volumeId of environment.dockerData.volumeIds) {
        await this.removeVolume(volumeId);
      }

      // Supprimer le réseau
      if (environment.dockerData.networkId) {
        await this.removeNetwork(environment.dockerData.networkId);
      }

      this.environments.delete(environmentId);

    } catch (error) {
      console.error(`Failed to destroy environment ${environmentId}:`, error);
      throw error;
    }
  }

  /**
   * Exécute une commande dans un conteneur Docker
   */
  async executeCommand(
    environmentId: string,
    command: string[],
    options?: { timeout?: number; workingDir?: string }
  ): Promise<CommandResult> {
    const environment = this.environments.get(environmentId);
    if (!environment || environment.status !== 'ready' || !environment.dockerData) {
      throw new Error(`Environment ${environmentId} not ready`);
    }

    this.updateLastActivity(environmentId);

    const startTime = Date.now();
    const args = ['exec'];

    if (options?.workingDir) {
      args.push('-w', options.workingDir);
    }

    args.push(environment.dockerData.containerId, ...command);

    const result = await this.executeDocker(args, {
      timeout: options?.timeout || 30000,
    });

    return {
      ...result,
      timestamp: new Date(),
      duration: Date.now() - startTime,
    };
  }

  /**
   * Obtient les logs d'un conteneur
   */
  async getLogs(
    environmentId: string,
    target?: string,
    options?: LogOptions
  ): Promise<string | NodeJS.ReadableStream> {
    const environment = this.environments.get(environmentId);
    if (!environment || environment.status !== 'ready' || !environment.dockerData) {
      throw new Error(`Environment ${environmentId} not ready`);
    }

    this.updateLastActivity(environmentId);

    const containerId = target || environment.dockerData.containerId;
    const args = ['logs'];

    if (options?.tail) {
      args.push('--tail', options.tail.toString());
    }

    if (options?.since) {
      args.push('--since', options.since.toISOString());
    }

    if (options?.timestamps) {
      args.push('--timestamps');
    }

    if (options?.follow) {
      args.push('-f');
      return this.executeDockerStream(['logs', '-f', containerId]);
    }

    args.push(containerId);

    const result = await this.executeDocker(args);
    return result.stdout;
  }

  /**
   * Applique une configuration Docker (Dockerfile ou docker-compose)
   */
  async applyConfiguration(
    environmentId: string,
    configuration: string,
    type: 'yaml' | 'dockerfile' | 'compose'
  ): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment || environment.status !== 'ready' || !environment.dockerData) {
      throw new Error(`Environment ${environmentId} not ready`);
    }

    this.updateLastActivity(environmentId);

    switch (type) {
      case 'dockerfile':
        await this.buildAndRunDockerfile(environmentId, configuration);
        break;
      case 'compose':
        await this.runDockerCompose(environmentId, configuration);
        break;
      default:
        throw new Error(`Configuration type ${type} not supported for Docker`);
    }
  }

  /**
   * Obtient le statut détaillé d'un environnement Docker
   */
  async getEnvironmentStatus(environmentId: string): Promise<EnvironmentStatus> {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    if (environment.status !== 'ready' || !environment.dockerData) {
      return {
        environment,
        health: {
          status: 'unknown',
          checks: [],
        },
      };
    }

    try {
      // Obtenir les informations du conteneur
      const containerInfo = await this.inspectContainer(environment.dockerData.containerId);
      
      // Obtenir les informations du réseau
      const networkInfo = await this.inspectNetwork(environment.dockerData.networkId);

      // Obtenir les métriques du conteneur
      const stats = await this.getContainerStats(environment.dockerData.containerId);

      const healthChecks = this.performDockerHealthChecks(containerInfo, networkInfo);

      return {
        environment,
        resources: {
          containers: [containerInfo],
          networks: [networkInfo],
          volumes: environment.dockerData.volumeIds,
        },
        metrics: stats,
        health: {
          status: healthChecks.every(check => check.status === 'pass') ? 'healthy' : 
                  healthChecks.some(check => check.status === 'fail') ? 'unhealthy' : 'unknown',
          checks: healthChecks,
        },
      };

    } catch (error) {
      return {
        environment,
        health: {
          status: 'unhealthy',
          checks: [{
            name: 'docker-connectivity',
            status: 'fail',
            message: `Failed to connect to Docker: ${error.message}`,
            timestamp: new Date(),
          }],
        },
      };
    }
  }

  // Méthodes privées pour Docker

  private async createNetwork(networkName: string): Promise<string> {
    const result = await this.executeDocker([
      'network', 'create',
      '--driver', 'bridge',
      '--label', 'nalabo.managed=true',
      networkName
    ]);

    return result.stdout.trim();
  }

  private async removeNetwork(networkId: string): Promise<void> {
    await this.executeDocker(['network', 'rm', networkId]);
  }

  private async createVolumes(environmentId: string, volumeConfigs: any[]): Promise<string[]> {
    const volumeIds: string[] = [];

    for (const volumeConfig of volumeConfigs) {
      if (volumeConfig.type === 'persistentVolume') {
        const volumeName = `nalabo-${environmentId}-${volumeConfig.name}`;
        await this.executeDocker([
          'volume', 'create',
          '--label', 'nalabo.managed=true',
          '--label', `nalabo.environment=${environmentId}`,
          volumeName
        ]);
        volumeIds.push(volumeName);
      }
    }

    return volumeIds;
  }

  private async removeVolume(volumeId: string): Promise<void> {
    await this.executeDocker(['volume', 'rm', volumeId]);
  }

  private generateContainerConfig(
    containerName: string,
    networkName: string,
    config: EnvironmentCreationConfig
  ): DockerContainerConfig {
    // Déterminer l'image basée sur le template
    let image = 'ubuntu:22.04'; // Image par défaut

    switch (config.template) {
      case 'docker':
        image = 'docker:dind';
        break;
      case 'kubernetes':
        image = 'bitnami/kubectl:latest';
        break;
      case 'python':
        image = 'python:3.11-slim';
        break;
      case 'node':
        image = 'node:18-alpine';
        break;
      case 'golang':
        image = 'golang:1.21-alpine';
        break;
      case 'cybersecurity':
        image = 'kalilinux/kali-rolling';
        break;
    }

    // Mapper les ports
    const ports: Record<string, string> = {};
    config.networking?.ports?.forEach((port, index) => {
      ports[port.toString()] = (3000 + index).toString();
    });

    return {
      image,
      name: containerName,
      ports,
      volumes: {},
      environment: config.environmentVariables || {},
      networks: [networkName],
      privileged: config.template === 'docker', // Privilégié pour Docker-in-Docker
      capabilities: config.template === 'cybersecurity' ? ['NET_ADMIN', 'SYS_ADMIN'] : undefined,
      workingDir: '/workspace',
    };
  }

  private async createContainer(config: DockerContainerConfig): Promise<string> {
    const args = ['create'];

    // Nom du conteneur
    args.push('--name', config.name);

    // Réseau
    config.networks.forEach(network => {
      args.push('--network', network);
    });

    // Ports
    Object.entries(config.ports).forEach(([containerPort, hostPort]) => {
      args.push('-p', `${hostPort}:${containerPort}`);
    });

    // Variables d'environnement
    Object.entries(config.environment).forEach(([key, value]) => {
      args.push('-e', `${key}=${value}`);
    });

    // Volumes
    Object.entries(config.volumes).forEach(([hostPath, containerPath]) => {
      args.push('-v', `${hostPath}:${containerPath}`);
    });

    // Options spéciales
    if (config.privileged) {
      args.push('--privileged');
    }

    if (config.capabilities) {
      config.capabilities.forEach(cap => {
        args.push('--cap-add', cap);
      });
    }

    if (config.workingDir) {
      args.push('-w', config.workingDir);
    }

    // Labels
    args.push('--label', 'nalabo.managed=true');

    // Image
    args.push(config.image);

    // Commande
    if (config.command) {
      args.push(...config.command);
    }

    const result = await this.executeDocker(args);
    return result.stdout.trim();
  }

  private async startContainer(containerId: string): Promise<void> {
    await this.executeDocker(['start', containerId]);
  }

  private async stopContainer(containerId: string): Promise<void> {
    await this.executeDocker(['stop', containerId]);
  }

  private async removeContainer(containerId: string): Promise<void> {
    await this.executeDocker(['rm', '-f', containerId]);
  }

  private async setupEndpoints(containerId: string, ports: number[]): Promise<Record<string, string>> {
    const endpoints: Record<string, string> = {};

    // Obtenir les informations du conteneur pour les ports mappés
    const inspectResult = await this.executeDocker(['inspect', containerId]);
    const containerInfo = JSON.parse(inspectResult.stdout)[0];

    const portBindings = containerInfo.NetworkSettings.Ports;

    ports.forEach((port, index) => {
      const portKey = `${port}/tcp`;
      if (portBindings[portKey] && portBindings[portKey][0]) {
        const hostPort = portBindings[portKey][0].HostPort;
        endpoints[`port-${port}`] = `http://localhost:${hostPort}`;
      }
    });

    return endpoints;
  }

  private async executeInitScripts(containerId: string, scripts: string[]): Promise<void> {
    for (const script of scripts) {
      try {
        await this.executeDocker(['exec', containerId, 'sh', '-c', script]);
      } catch (error) {
        console.warn(`Failed to execute init script: ${error.message}`);
      }
    }
  }

  private async buildAndRunDockerfile(environmentId: string, dockerfile: string): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment) return;

    // Créer un répertoire temporaire pour le build
    const buildDir = `/tmp/docker-build-${environmentId}`;
    await fs.mkdir(buildDir, { recursive: true });

    try {
      // Écrire le Dockerfile
      await fs.writeFile(path.join(buildDir, 'Dockerfile'), dockerfile);

      // Construire l'image
      const imageName = `nalabo-custom-${environmentId}`;
      await this.executeDocker(['build', '-t', imageName, buildDir]);

      // Créer et démarrer un nouveau conteneur avec cette image
      const containerName = `nalabo-custom-container-${environmentId}`;
      const containerId = await this.executeDocker([
        'run', '-d',
        '--name', containerName,
        '--network', environment.dockerData!.networkId,
        imageName
      ]);

    } finally {
      // Nettoyer le répertoire de build
      await fs.rm(buildDir, { recursive: true, force: true });
    }
  }

  private async runDockerCompose(environmentId: string, composeContent: string): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment) return;

    // Créer un répertoire temporaire pour docker-compose
    const composeDir = `/tmp/docker-compose-${environmentId}`;
    await fs.mkdir(composeDir, { recursive: true });

    try {
      // Écrire le fichier docker-compose.yml
      await fs.writeFile(path.join(composeDir, 'docker-compose.yml'), composeContent);

      // Démarrer les services
      await this.executeDocker(['compose', '-f', path.join(composeDir, 'docker-compose.yml'), 'up', '-d']);

    } finally {
      // Le répertoire sera nettoyé lors de la destruction de l'environnement
    }
  }

  private async inspectContainer(containerId: string): Promise<any> {
    const result = await this.executeDocker(['inspect', containerId]);
    return JSON.parse(result.stdout)[0];
  }

  private async inspectNetwork(networkId: string): Promise<any> {
    const result = await this.executeDocker(['network', 'inspect', networkId]);
    return JSON.parse(result.stdout)[0];
  }

  private async getContainerStats(containerId: string): Promise<any> {
    try {
      const result = await this.executeDocker(['stats', '--no-stream', '--format', 'json', containerId]);
      const stats = JSON.parse(result.stdout);
      
      return {
        cpuUsage: parseFloat(stats.CPUPerc?.replace('%', '') || '0'),
        memoryUsage: parseFloat(stats.MemPerc?.replace('%', '') || '0'),
        networkIO: {
          bytesIn: this.parseBytes(stats.NetIO?.split('/')[0] || '0B'),
          bytesOut: this.parseBytes(stats.NetIO?.split('/')[1] || '0B'),
        },
      };
    } catch (error) {
      return {
        cpuUsage: 0,
        memoryUsage: 0,
        networkIO: { bytesIn: 0, bytesOut: 0 },
      };
    }
  }

  private parseBytes(bytesStr: string): number {
    const units = { 'B': 1, 'kB': 1000, 'MB': 1000000, 'GB': 1000000000 };
    const match = bytesStr.match(/^([\d.]+)(\w+)$/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2] as keyof typeof units;
    return value * (units[unit] || 1);
  }

  private performDockerHealthChecks(containerInfo: any, networkInfo: any): any[] {
    const checks = [];

    // Vérifier l'état du conteneur
    const isRunning = containerInfo.State.Running;
    checks.push({
      name: 'container-running',
      status: isRunning ? 'pass' : 'fail',
      message: `Container is ${isRunning ? 'running' : 'stopped'}`,
      timestamp: new Date(),
    });

    // Vérifier la santé du conteneur (si health check défini)
    if (containerInfo.State.Health) {
      const healthStatus = containerInfo.State.Health.Status;
      checks.push({
        name: 'container-health',
        status: healthStatus === 'healthy' ? 'pass' : healthStatus === 'starting' ? 'warn' : 'fail',
        message: `Container health: ${healthStatus}`,
        timestamp: new Date(),
      });
    }

    // Vérifier le réseau
    const networkConnected = Object.keys(containerInfo.NetworkSettings.Networks).length > 0;
    checks.push({
      name: 'network-connectivity',
      status: networkConnected ? 'pass' : 'fail',
      message: `Network connectivity: ${networkConnected ? 'connected' : 'disconnected'}`,
      timestamp: new Date(),
    });

    return checks;
  }

  private async cleanupFailedEnvironment(environment: WorkshopEnvironment): Promise<void> {
    try {
      if (environment.dockerData?.containerId) {
        await this.removeContainer(environment.dockerData.containerId);
      }
      if (environment.dockerData?.networkId) {
        await this.removeNetwork(environment.dockerData.networkId);
      }
      for (const volumeId of environment.dockerData?.volumeIds || []) {
        await this.removeVolume(volumeId);
      }
    } catch (error) {
      console.error('Failed to cleanup failed environment:', error);
    }
  }

  private async executeDocker(
    args: string[],
    options?: { timeout?: number }
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const dockerCommand = spawn('docker', args, {
        env: {
          ...process.env,
          DOCKER_HOST: this.config.dockerHost || process.env.DOCKER_HOST,
        },
      });
      
      let stdout = '';
      let stderr = '';

      dockerCommand.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      dockerCommand.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timeout = options?.timeout || 30000;
      const timer = setTimeout(() => {
        dockerCommand.kill();
        reject(new Error(`Docker command timed out after ${timeout}ms`));
      }, timeout);

      dockerCommand.on('close', (code) => {
        clearTimeout(timer);
        
        if (code === 0) {
          resolve({ stdout, stderr, exitCode: code });
        } else {
          reject(new Error(`Docker command failed with code ${code}: ${stderr}`));
        }
      });

      dockerCommand.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  private executeDockerStream(args: string[]): NodeJS.ReadableStream {
    const dockerCommand = spawn('docker', args, {
      env: {
        ...process.env,
        DOCKER_HOST: this.config.dockerHost || process.env.DOCKER_HOST,
      },
    });
    
    return dockerCommand.stdout;
  }
}