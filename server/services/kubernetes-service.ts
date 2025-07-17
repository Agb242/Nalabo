import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface KubernetesConfig {
  kubeconfig?: string;
  namespace?: string;
  context?: string;
  apiServer?: string;
  token?: string;
}

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

export interface WorkshopEnvironment {
  id: string;
  vclusterName: string;
  namespace: string;
  status: 'creating' | 'ready' | 'error' | 'destroying';
  kubeconfig: string;
  endpoints: {
    api: string;
    ingress?: string;
  };
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  createdAt: Date;
  expiresAt: Date;
}

export class KubernetesService extends EventEmitter {
  private config: KubernetesConfig;
  private environments: Map<string, WorkshopEnvironment> = new Map();

  constructor(config: KubernetesConfig) {
    super();
    this.config = config;
  }

  /**
   * Crée un vCluster pour un atelier
   */
  async createWorkshopEnvironment(
    workshopId: string,
    userId: string,
    config: VClusterConfig
  ): Promise<WorkshopEnvironment> {
    const environmentId = `workshop-${workshopId}-${userId}-${uuidv4().slice(0, 8)}`;
    const vclusterName = `vcluster-${environmentId}`;
    const namespace = config.namespace || `nalabo-${environmentId}`;

    const environment: WorkshopEnvironment = {
      id: environmentId,
      vclusterName,
      namespace,
      status: 'creating',
      kubeconfig: '',
      endpoints: {
        api: '',
      },
      resources: config.resources || {
        cpu: '1000m',
        memory: '2Gi',
        storage: '10Gi',
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 heures par défaut
    };

    this.environments.set(environmentId, environment);

    try {
      // 1. Créer le namespace
      await this.createNamespace(namespace);

      // 2. Installer le vCluster
      await this.installVCluster(vclusterName, namespace, config);

      // 3. Attendre que le vCluster soit prêt
      await this.waitForVClusterReady(vclusterName, namespace);

      // 4. Récupérer la kubeconfig du vCluster
      const kubeconfig = await this.getVClusterKubeconfig(vclusterName, namespace);

      // 5. Configurer les ressources par défaut dans le vCluster
      await this.setupWorkshopResources(kubeconfig, config);

      // Mettre à jour l'environnement
      environment.status = 'ready';
      environment.kubeconfig = kubeconfig;
      environment.endpoints.api = await this.getVClusterApiEndpoint(vclusterName, namespace);

      this.emit('environmentReady', environment);
      return environment;

    } catch (error) {
      environment.status = 'error';
      this.emit('environmentError', environment, error);
      throw error;
    }
  }

  /**
   * Détruit un environnement d'atelier
   */
  async destroyWorkshopEnvironment(environmentId: string): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    environment.status = 'destroying';

    try {
      // Supprimer le vCluster
      await this.uninstallVCluster(environment.vclusterName, environment.namespace);

      // Supprimer le namespace
      await this.deleteNamespace(environment.namespace);

      this.environments.delete(environmentId);
      this.emit('environmentDestroyed', environmentId);

    } catch (error) {
      this.emit('environmentError', environment, error);
      throw error;
    }
  }

  /**
   * Exécute une commande kubectl dans un environnement
   */
  async executeInEnvironment(
    environmentId: string,
    command: string[],
    options?: { timeout?: number }
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const environment = this.environments.get(environmentId);
    if (!environment || environment.status !== 'ready') {
      throw new Error(`Environment ${environmentId} not ready`);
    }

    return this.executeKubectl(command, {
      kubeconfig: environment.kubeconfig,
      timeout: options?.timeout || 30000,
    });
  }

  /**
   * Obtient les logs d'un pod dans un environnement
   */
  async getEnvironmentLogs(
    environmentId: string,
    podName: string,
    namespace: string = 'default',
    options?: { follow?: boolean; tail?: number }
  ): Promise<string | NodeJS.ReadableStream> {
    const environment = this.environments.get(environmentId);
    if (!environment || environment.status !== 'ready') {
      throw new Error(`Environment ${environmentId} not ready`);
    }

    const args = ['logs', podName, '-n', namespace];
    
    if (options?.tail) {
      args.push('--tail', options.tail.toString());
    }

    if (options?.follow) {
      args.push('-f');
      // Retourner un stream pour les logs en temps réel
      return this.executeKubectlStream(args, {
        kubeconfig: environment.kubeconfig,
      });
    }

    const result = await this.executeKubectl(args, {
      kubeconfig: environment.kubeconfig,
    });

    return result.stdout;
  }

  /**
   * Applique des manifestes YAML dans un environnement
   */
  async applyManifests(
    environmentId: string,
    manifests: string
  ): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment || environment.status !== 'ready') {
      throw new Error(`Environment ${environmentId} not ready`);
    }

    // Écrire les manifestes dans un fichier temporaire
    const tempFile = `/tmp/manifests-${environmentId}-${Date.now()}.yaml`;
    const fs = await import('fs/promises');
    await fs.writeFile(tempFile, manifests);

    try {
      await this.executeKubectl(['apply', '-f', tempFile], {
        kubeconfig: environment.kubeconfig,
      });
    } finally {
      // Nettoyer le fichier temporaire
      await fs.unlink(tempFile).catch(() => {});
    }
  }

  /**
   * Obtient le statut des ressources dans un environnement
   */
  async getEnvironmentStatus(environmentId: string): Promise<any> {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    if (environment.status !== 'ready') {
      return { status: environment.status };
    }

    try {
      // Obtenir les pods
      const podsResult = await this.executeKubectl(['get', 'pods', '-o', 'json'], {
        kubeconfig: environment.kubeconfig,
      });

      // Obtenir les services
      const servicesResult = await this.executeKubectl(['get', 'services', '-o', 'json'], {
        kubeconfig: environment.kubeconfig,
      });

      return {
        status: environment.status,
        pods: JSON.parse(podsResult.stdout),
        services: JSON.parse(servicesResult.stdout),
        endpoints: environment.endpoints,
        resources: environment.resources,
        expiresAt: environment.expiresAt,
      };

    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  // Méthodes privées

  private async createNamespace(namespace: string): Promise<void> {
    try {
      await this.executeKubectl(['create', 'namespace', namespace]);
    } catch (error) {
      // Ignorer si le namespace existe déjà
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }

  private async deleteNamespace(namespace: string): Promise<void> {
    await this.executeKubectl(['delete', 'namespace', namespace, '--ignore-not-found=true']);
  }

  private async installVCluster(
    name: string,
    namespace: string,
    config: VClusterConfig
  ): Promise<void> {
    const args = [
      'create', name,
      '--namespace', namespace,
    ];

    // Ajouter les valeurs personnalisées
    if (config.values) {
      const valuesFile = `/tmp/values-${name}.yaml`;
      const fs = await import('fs/promises');
      const yaml = await import('yaml');
      
      await fs.writeFile(valuesFile, yaml.stringify(config.values));
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

  private async setupWorkshopResources(kubeconfig: string, config: VClusterConfig): Promise<void> {
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
    const rbacManifest = `
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

    const tempFile = `/tmp/rbac-${Date.now()}.yaml`;
    const fs = await import('fs/promises');
    await fs.writeFile(tempFile, rbacManifest);

    try {
      await this.executeKubectl(['apply', '-f', tempFile], { kubeconfig });
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }
  }

  private async executeKubectl(
    args: string[],
    options?: { kubeconfig?: string; timeout?: number }
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const env = { ...process.env };
      
      if (options?.kubeconfig) {
        env.KUBECONFIG = options.kubeconfig;
      } else if (this.config.kubeconfig) {
        env.KUBECONFIG = this.config.kubeconfig;
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
    } else if (this.config.kubeconfig) {
      env.KUBECONFIG = this.config.kubeconfig;
    }

    const kubectl = spawn('kubectl', args, { env });
    return kubectl.stdout;
  }

  private async executeVCluster(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const env = { ...process.env };
      
      if (this.config.kubeconfig) {
        env.KUBECONFIG = this.config.kubeconfig;
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

  /**
   * Nettoie les environnements expirés
   */
  async cleanupExpiredEnvironments(): Promise<void> {
    const now = new Date();
    
    for (const [id, environment] of this.environments.entries()) {
      if (environment.expiresAt < now) {
        try {
          await this.destroyWorkshopEnvironment(id);
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
}