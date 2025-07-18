import { BaseInfrastructureService, InfrastructureConfig } from './base-infrastructure';
import { KubernetesInfrastructureService } from './kubernetes-infrastructure';

/**
 * Factory pour créer les services d'infrastructure appropriés
 * Permet de basculer facilement entre Kubernetes et Docker
 */
export class InfrastructureFactory {
  private static instances: Map<string, BaseInfrastructureService> = new Map();

  /**
   * Crée ou récupère une instance de service d'infrastructure
   */
  static getInstance(config: InfrastructureConfig): BaseInfrastructureService {
    const key = `${config.type}-${config.name}`;
    
    if (!this.instances.has(key)) {
      const service = this.createService(config);
      this.instances.set(key, service);
    }

    return this.instances.get(key)!;
  }

  /**
   * Crée un nouveau service d'infrastructure
   */
  private static createService(config: InfrastructureConfig): BaseInfrastructureService {
    switch (config.type) {
      case 'kubernetes':
        return new KubernetesInfrastructureService(config);
      default:
        throw new Error(`Unsupported infrastructure type: ${config.type}. Only Kubernetes is supported.`);
    }
  }

  /**
   * Obtient toutes les instances actives
   */
  static getAllInstances(): BaseInfrastructureService[] {
    return Array.from(this.instances.values());
  }

  /**
   * Nettoie une instance spécifique
   */
  static destroyInstance(config: InfrastructureConfig): void {
    const key = `${config.type}-${config.name}`;
    const instance = this.instances.get(key);
    
    if (instance) {
      // Nettoyer les ressources si la méthode existe
      if ('destroy' in instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
      this.instances.delete(key);
    }
  }

  /**
   * Nettoie toutes les instances
   */
  static destroyAll(): void {
    for (const instance of this.instances.values()) {
      if ('destroy' in instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    }
    this.instances.clear();
  }
}

/**
 * Configuration par défaut pour l'infrastructure Kubernetes
 */
export const DefaultInfrastructureConfigs = {
  kubernetes: {
    local: {
      type: 'kubernetes' as const,
      name: 'local-k8s',
      endpoint: process.env.KUBECONFIG,
      namespace: process.env.K8S_NAMESPACE || 'nalabo',
      context: process.env.K8S_CONTEXT,
    },
    cloud: {
      type: 'kubernetes' as const,
      name: 'cloud-k8s',
      endpoint: process.env.K8S_ENDPOINT,
      credentials: {
        token: process.env.K8S_TOKEN,
      },
      namespace: process.env.K8S_NAMESPACE || 'nalabo',
    },
  },
};