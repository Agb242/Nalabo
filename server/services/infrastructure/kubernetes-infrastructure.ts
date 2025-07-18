import { BaseInfrastructureService, WorkshopEnvironment, CommandResult, LogOptions, EnvironmentCreationConfig, EnvironmentStatus, InfrastructureConfig } from './base-infrastructure';
import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';

export interface VClusterConfig {
  name: string;
  namespace: string;
  values?: Record<string, any>;
  chart?: string;
  version?: string;
  resources?: {
    cpu: string;
    memory: string;
    storage: string;
  };
  networking?: {
    ingress?: boolean;
    loadBalancer?: boolean;
    nodePort?: boolean;
  };
}

/**
 * Service d'infrastructure Kubernetes avec support vCluster
 * Gère la création d'environnements isolés via vCluster
 */
export class KubernetesInfrastructureService extends BaseInfrastructureService {
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(config: InfrastructureConfig) {
    super(config);
    this.startHeartbeat();
  }

  /**
   * Crée un environnement d'atelier avec vCluster
   */
  async createEnvironment(
    workshopId: string,
    userId: string,
    config: EnvironmentCreationConfig
  ): Promise<WorkshopEnvironment> {
    const environmentId = `workshop-${workshopId}-${userId}-${uuidv4().slice(0, 8)}`;
    const vclusterName = `vcluster-${environmentId}`;
    const namespace = `nalabo-${environmentId}`;

    const environment: WorkshopEnvironment = {
      id: environmentId,
      type: 'kubernetes',
      name: vclusterName,
      status: 'creating',
      endpoints: {
        api: '',
      },
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
      kubernetesData: {
        vclusterName,
        namespace,
        kubeconfig: '',
      },
    };

    this.environments.set(environmentId, environment);

    try {
      // 1. Créer le namespace
      await this.createNamespace(namespace);

      // 2. Installer le vCluster
      const vclusterConfig: VClusterConfig = {
        name: vclusterName,
        namespace,
        resources: environment.resources,
        networking: environment.networking,
        values: this.generateVClusterValues(config),
      };

      await this.installVCluster(vclusterConfig);

      // 3. Attendre que le vCluster soit prêt
      await this.waitForVClusterReady(vclusterName, namespace);

      // 4. Récupérer la kubeconfig du vCluster
      const kubeconfig = await this.getVClusterKubeconfig(vclusterName, namespace);
      environment.kubernetesData!.kubeconfig = kubeconfig;

      // 5. Configurer les ressources par défaut
      await this.setupDefaultResources(kubeconfig, config);

      // 6. Configurer les endpoints
      environment.endpoints.api = await this.getVClusterApiEndpoint(vclusterName, namespace);

      environment.status = 'ready';
      return environment;

    } catch (error) {
      environment.status = 'error';
      throw error;
    }
  }

  /**
   * Détruit un environnement vCluster
   */
  async destroyEnvironment(environmentId: string): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment || !environment.kubernetesData) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    environment.status = 'destroying';

    try {
      // Supprimer le vCluster
      await this.uninstallVCluster(
        environment.kubernetesData.vclusterName,
        environment.kubernetesData.namespace
      );

      // Supprimer le namespace
      await this.deleteNamespace(environment.kubernetesData.namespace);

      this.environments.delete(environmentId);

    } catch (error) {
      console.error(`Failed to destroy environment ${environmentId}:`, error);
      throw error;
    }
  }

  /**
   * Exécute une commande kubectl dans un environnement
   */
  async executeCommand(
    environmentId: string,
    command: string[],
    options?: { timeout?: number; workingDir?: string }
  ): Promise<CommandResult> {
    const environment = this.environments.get(environmentId);
    if (!environment || environment.status !== 'ready' || !environment.kubernetesData) {
      throw new Error(`Environment ${environmentId} not ready`);
    }

    this.updateLastActivity(environmentId);

    const startTime = Date.now();
    const result = await this.executeKubectl(command, {
      kubeconfig: environment.kubernetesData.kubeconfig,
      timeout: options?.timeout || 30000,
    });

    return {
      ...result,
      timestamp: new Date(),
      duration: Date.now() - startTime,
    };
  }

  /**
   * Obtient les logs d'un pod dans un environnement
   */
  async getLogs(
    environmentId: string,
    podName?: string,
    options?: LogOptions
  ): Promise<string | NodeJS.ReadableStream> {
    const environment = this.environments.get(environmentId);
    if (!environment || environment.status !== 'ready' || !environment.kubernetesData) {
      throw new Error(`Environment ${environmentId} not ready`);
    }

    this.updateLastActivity(environmentId);

    if (!podName) {
      // Obtenir le premier pod disponible
      const podsResult = await this.executeKubectl(['get', 'pods', '-o', 'json'], {
        kubeconfig: environment.kubernetesData.kubeconfig,
      });
      const pods = JSON.parse(podsResult.stdout);
      if (pods.items && pods.items.length > 0) {
        podName = pods.items[0].metadata.name;
      } else {
        throw new Error('No pods found in environment');
      }
    }

    const args = ['logs', podName];
    
    if (options?.tail) {
      args.push('--tail', options.tail.toString());
    }

    if (options?.since) {
      args.push('--since-time', options.since.toISOString());
    }

    if (options?.timestamps) {
      args.push('--timestamps');
    }

    if (options?.follow) {
      args.push('-f');
      return this.executeKubectlStream(args, {
        kubeconfig: environment.kubernetesData.kubeconfig,
      });
    }

    const result = await this.executeKubectl(args, {
      kubeconfig: environment.kubernetesData.kubeconfig,
    });

    return result.stdout;
  }

  /**
   * Applique des manifestes YAML dans un environnement
   */
  async applyConfiguration(
    environmentId: string,
    configuration: string,
    type: 'yaml' | 'dockerfile' | 'compose'
  ): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment || environment.status !== 'ready' || !environment.kubernetesData) {
      throw new Error(`Environment ${environmentId} not ready`);
    }

    if (type !== 'yaml') {
      throw new Error(`Configuration type ${type} not supported for Kubernetes`);
    }

    this.updateLastActivity(environmentId);

    // Écrire les manifestes dans un fichier temporaire
    const tempFile = `/tmp/manifests-${environmentId}-${Date.now()}.yaml`;
    await fs.writeFile(tempFile, configuration);

    try {
      await this.executeKubectl(['apply', '-f', tempFile], {
        kubeconfig: environment.kubernetesData.kubeconfig,
      });
    } finally {
      // Nettoyer le fichier temporaire
      await fs.unlink(tempFile).catch(() => {});
    }
  }

  /**
   * Obtient le statut détaillé d'un environnement
   */
  async getEnvironmentStatus(environmentId: string): Promise<EnvironmentStatus> {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    if (environment.status !== 'ready' || !environment.kubernetesData) {
      return {
        environment,
        health: {
          status: 'unknown',
          checks: [],
        },
      };
    }

    try {
      // Obtenir les ressources Kubernetes
      const [podsResult, servicesResult, nodesResult] = await Promise.all([
        this.executeKubectl(['get', 'pods', '-o', 'json'], {
          kubeconfig: environment.kubernetesData.kubeconfig,
        }),
        this.executeKubectl(['get', 'services', '-o', 'json'], {
          kubeconfig: environment.kubernetesData.kubeconfig,
        }),
        this.executeKubectl(['get', 'nodes', '-o', 'json'], {
          kubeconfig: environment.kubernetesData.kubeconfig,
        }).catch(() => ({ stdout: '{"items":[]}' })), // Les vClusters n'ont pas toujours accès aux nodes
      ]);

      const pods = JSON.parse(podsResult.stdout);
      const services = JSON.parse(servicesResult.stdout);
      const nodes = JSON.parse(nodesResult.stdout);

      // Calculer les métriques de santé
      const healthChecks = this.performHealthChecks(pods, services, nodes);

      return {
        environment,
        resources: {
          pods: pods.items,
          services: services.items,
        },
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
            name: 'api-connectivity',
            status: 'fail',
            message: `Failed to connect to Kubernetes API: ${error.message}`,
            timestamp: new Date(),
          }],
        },
      };
    }
  }

  // Méthodes privées pour Kubernetes

  private async createNamespace(namespace: string): Promise<void> {
    try {
      await this.executeKubectl(['create', 'namespace', namespace]);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }

  private async deleteNamespace(namespace: string): Promise<void> {
    await this.executeKubectl(['delete', 'namespace', namespace, '--ignore-not-found=true']);
  }

  private async installVCluster(config: VClusterConfig): Promise<void> {
    const args = [
      'create', config.name,
      '--namespace', config.namespace,
    ];

    // Ajouter les valeurs personnalisées
    if (config.values) {
      const valuesFile = `/tmp/values-${config.name}.yaml`;
      await fs.writeFile(valuesFile, yaml.dump(config.values));
      args.push('--values', valuesFile);
    }

    // Ajouter les ressources
    if (config.resources) {
      args.push('--set', `resources.requests.cpu=${config.resources.cpu}`);
      args.push('--set', `resources.requests.memory=${config.resources.memory}`);
      args.push('--set', `resources.limits.cpu=${config.resources.cpu}`);
      args.push('--set', `resources.limits.memory=${config.resources.memory}`);
    }

    await this.executeVCluster(args);
  }

  private async uninstallVCluster(name: string, namespace: string): Promise<void> {
    await this.executeVCluster(['delete', name, '--namespace', namespace]);
  }

  private async waitForVClusterReady(name: string, namespace: string): Promise<void> {
    const maxAttempts = 60; // 5 minutes
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const result = await this.executeKubectl([
          'get', 'pod',
          '-l', `app=vcluster,release=${name}`,
          '-n', namespace,
          '-o', 'jsonpath={.items[0].status.phase}'
        ]);

        if (result.stdout.trim() === 'Running') {
          // Attendre encore un peu pour que l'API soit prête
          await new Promise(resolve => setTimeout(resolve, 10000));
          return;
        }
      } catch (error) {
        // Continuer à attendre
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error(`vCluster ${name} did not become ready within timeout`);
  }

  private async getVClusterKubeconfig(name: string, namespace: string): Promise<string> {
    const result = await this.executeVCluster([
      'connect', name,
      '--namespace', namespace,
      '--print-kubeconfig'
    ]);

    return result.stdout;
  }

  private async getVClusterApiEndpoint(name: string, namespace: string): Promise<string> {
    const result = await this.executeKubectl([
      'get', 'service',
      `${name}`,
      '-n', namespace,
      '-o', 'jsonpath={.spec.clusterIP}'
    ]);

    return `https://${result.stdout.trim()}:443`;
  }

  private async setupDefaultResources(kubeconfig: string, config: EnvironmentCreationConfig): Promise<void> {
    // Créer les namespaces par défaut
    const defaultNamespaces = ['default', 'kube-system', 'workshop'];
    
    for (const ns of defaultNamespaces) {
      try {
        await this.executeKubectl(['create', 'namespace', ns], { kubeconfig });
      } catch (error) {
        // Ignorer si existe déjà
      }
    }

    // Appliquer des RBAC par défaut pour l'atelier
    const rbacManifest = this.generateDefaultRBAC();
    const tempFile = `/tmp/rbac-${Date.now()}.yaml`;
    await fs.writeFile(tempFile, rbacManifest);

    try {
      await this.executeKubectl(['apply', '-f', tempFile], { kubeconfig });
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }

    // Exécuter les scripts d'initialisation
    if (config.initScripts) {
      for (const script of config.initScripts) {
        try {
          await this.executeKubectl(['apply', '-f', '-'], { 
            kubeconfig,
            stdin: script 
          });
        } catch (error) {
          console.warn(`Failed to execute init script: ${error.message}`);
        }
      }
    }
  }

  private generateVClusterValues(config: EnvironmentCreationConfig): Record<string, any> {
    return {
      syncer: {
        extraArgs: ['--tls-san=workshop.nalabo.local'],
      },
      vcluster: {
        image: 'rancher/k3s:v1.28.2-k3s1',
        env: config.environmentVariables || {},
      },
      storage: {
        persistence: false, // Pas de persistance pour les ateliers temporaires
      },
      networking: {
        advanced: true,
        replicateServices: {
          toHost: [
            {
              from: 'default/.*',
              to: 'default',
            },
          ],
        },
      },
      rbac: {
        clusterRole: {
          create: true,
        },
      },
    };
  }

  private generateDefaultRBAC(): string {
    return `
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: workshop-user
rules:
- apiGroups: [""]
  resources: ["*"]
  verbs: ["*"]
- apiGroups: ["apps"]
  resources: ["*"]
  verbs: ["*"]
- apiGroups: ["extensions"]
  resources: ["*"]
  verbs: ["*"]
- apiGroups: ["networking.k8s.io"]
  resources: ["*"]
  verbs: ["*"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: workshop-user-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: workshop-user
subjects:
- kind: ServiceAccount
  name: default
  namespace: default
`;
  }

  private performHealthChecks(pods: any, services: any, nodes: any): any[] {
    const checks = [];

    // Vérifier l'état des pods
    const runningPods = pods.items?.filter((pod: any) => pod.status.phase === 'Running').length || 0;
    const totalPods = pods.items?.length || 0;

    checks.push({
      name: 'pods-health',
      status: runningPods === totalPods ? 'pass' : runningPods > 0 ? 'warn' : 'fail',
      message: `${runningPods}/${totalPods} pods running`,
      timestamp: new Date(),
    });

    // Vérifier les services
    const servicesCount = services.items?.length || 0;
    checks.push({
      name: 'services-available',
      status: servicesCount > 0 ? 'pass' : 'warn',
      message: `${servicesCount} services available`,
      timestamp: new Date(),
    });

    return checks;
  }

  private async executeKubectl(
    args: string[],
    options?: { kubeconfig?: string; timeout?: number; stdin?: string }
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const env = { ...process.env };
      
      if (options?.kubeconfig) {
        env.KUBECONFIG = options.kubeconfig;
      } else if (this.config.endpoint) {
        env.KUBECONFIG = this.config.endpoint;
      }

      const kubectl = spawn('kubectl', args, { env });
      
      let stdout = '';
      let stderr = '';

      kubectl.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      kubectl.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      if (options?.stdin) {
        kubectl.stdin.write(options.stdin);
        kubectl.stdin.end();
      }

      const timeout = options?.timeout || 30000;
      const timer = setTimeout(() => {
        kubectl.kill();
        reject(new Error(`kubectl command timed out after ${timeout}ms`));
      }, timeout);

      kubectl.on('close', (code) => {
        clearTimeout(timer);
        
        if (code === 0) {
          resolve({ stdout, stderr, exitCode: code });
        } else {
          reject(new Error(`kubectl command failed with code ${code}: ${stderr}`));
        }
      });

      kubectl.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  private executeKubectlStream(
    args: string[],
    options?: { kubeconfig?: string }
  ): NodeJS.ReadableStream {
    const env = { ...process.env };
    
    if (options?.kubeconfig) {
      env.KUBECONFIG = options.kubeconfig;
    } else if (this.config.endpoint) {
      env.KUBECONFIG = this.config.endpoint;
    }

    const kubectl = spawn('kubectl', args, { env });
    return kubectl.stdout;
  }

  private async executeVCluster(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const env = { ...process.env };
      
      if (this.config.endpoint) {
        env.KUBECONFIG = this.config.endpoint;
      }

      const vcluster = spawn('vcluster', args, { env });
      
      let stdout = '';
      let stderr = '';

      vcluster.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      vcluster.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      vcluster.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, exitCode: code });
        } else {
          reject(new Error(`vcluster command failed with code ${code}: ${stderr}`));
        }
      });

      vcluster.on('error', (error) => {
        reject(error);
      });
    });
  }

  private startHeartbeat(): void {
    // Heartbeat pour maintenir la connexion
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.executeKubectl(['version', '--client']);
      } catch (error) {
        console.error('Kubernetes heartbeat failed:', error);
      }
    }, 300000); // Toutes les 5 minutes
  }

  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
}