import { EventEmitter } from 'events';
import { storage } from '../storage';
import { KubernetesInfrastructureService } from './infrastructure/kubernetes-infrastructure';
import { BaseInfrastructureService, InfrastructureConfig, WorkshopEnvironment } from './infrastructure/base-infrastructure';

export interface KubernetesCluster {
  id: string;
  name: string;
  description?: string;
  endpoint: string;
  kubeconfig?: string;
  token?: string;
  namespace: string;
  context?: string;
  isDefault: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastHealthCheck: Date;
  version?: string;
  nodes?: number;
  resources?: {
    totalCpu: string;
    totalMemory: string;
    totalStorage: string;
    usedCpu: string;
    usedMemory: string;
    usedStorage: string;
  };
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface InfrastructureMetrics {
  totalClusters: number;
  connectedClusters: number;
  totalNodes: number;
  totalWorkshops: number;
  activeEnvironments: number;
  resourceUsage: {
    cpu: { total: string; used: string; percentage: number };
    memory: { total: string; used: string; percentage: number };
    storage: { total: string; used: string; percentage: number };
  };
}

/**
 * Gestionnaire centralisé pour toutes les infrastructures Kubernetes
 * Permet de connecter Nalabo à n'importe quelle infrastructure K8s
 */
export class InfrastructureManager extends EventEmitter {
  private clusters: Map<string, KubernetesCluster> = new Map();
  private services: Map<string, BaseInfrastructureService> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.loadClusters();
    this.startHealthChecks();
  }

  /**
   * Charger les clusters depuis la base de données
   */
  private async loadClusters(): Promise<void> {
    try {
      // Récupérer les clusters depuis le storage
      const clusters = await storage.getKubernetesClusters();
      
      for (const cluster of clusters) {
        this.clusters.set(cluster.id, cluster);
        
        // Créer le service d'infrastructure pour chaque cluster
        try {
          const config: InfrastructureConfig = {
            type: 'kubernetes',
            name: cluster.name,
            endpoint: cluster.endpoint,
            namespace: cluster.namespace,
            context: cluster.context,
            credentials: cluster.token ? { token: cluster.token } : undefined,
            kubeconfig: cluster.kubeconfig,
          };
          
          const service = new KubernetesInfrastructureService(config);
          this.services.set(cluster.id, service);
        } catch (error) {
          console.error(`Failed to create service for cluster ${cluster.name}:`, error);
          cluster.status = 'error';
        }
      }
      
      this.emit('clusters-loaded', this.clusters.size);
    } catch (error) {
      console.error('Failed to load clusters:', error);
    }
  }

  /**
   * Ajouter un nouveau cluster Kubernetes
   */
  async addCluster(clusterData: Partial<KubernetesCluster>): Promise<KubernetesCluster> {
    const cluster: KubernetesCluster = {
      id: `cluster-${Date.now()}`,
      name: clusterData.name!,
      description: clusterData.description,
      endpoint: clusterData.endpoint!,
      kubeconfig: clusterData.kubeconfig,
      token: clusterData.token,
      namespace: clusterData.namespace || 'nalabo',
      context: clusterData.context,
      isDefault: clusterData.isDefault || false,
      status: 'disconnected',
      lastHealthCheck: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validation de la configuration
    await this.validateClusterConfig(cluster);

    // Si c'est le cluster par défaut, désactiver les autres
    if (cluster.isDefault) {
      for (const [id, existingCluster] of this.clusters) {
        if (existingCluster.isDefault) {
          existingCluster.isDefault = false;
          await storage.updateKubernetesCluster(id, existingCluster);
        }
      }
    }

    // Sauvegarder en base de données
    await storage.createKubernetesCluster(cluster);
    
    // Ajouter au cache
    this.clusters.set(cluster.id, cluster);

    // Créer le service d'infrastructure
    try {
      const config: InfrastructureConfig = {
        type: 'kubernetes',
        name: cluster.name,
        endpoint: cluster.endpoint,
        namespace: cluster.namespace,
        context: cluster.context,
        credentials: cluster.token ? { token: cluster.token } : undefined,
        kubeconfig: cluster.kubeconfig,
      };
      
      const service = new KubernetesInfrastructureService(config);
      this.services.set(cluster.id, service);
      
      // Test de connexion initial
      await this.testClusterConnection(cluster.id);
    } catch (error) {
      console.error(`Failed to create service for cluster ${cluster.name}:`, error);
      cluster.status = 'error';
    }

    this.emit('cluster-added', cluster);
    return cluster;
  }

  /**
   * Mettre à jour un cluster existant
   */
  async updateCluster(clusterId: string, updates: Partial<KubernetesCluster>): Promise<KubernetesCluster> {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) {
      throw new Error(`Cluster ${clusterId} not found`);
    }

    // Mise à jour des propriétés
    Object.assign(cluster, updates, { updatedAt: new Date() });

    // Si c'est maintenant le cluster par défaut, désactiver les autres
    if (updates.isDefault) {
      for (const [id, existingCluster] of this.clusters) {
        if (id !== clusterId && existingCluster.isDefault) {
          existingCluster.isDefault = false;
          await storage.updateKubernetesCluster(id, existingCluster);
        }
      }
    }

    // Sauvegarder en base de données
    await storage.updateKubernetesCluster(clusterId, cluster);

    // Recréer le service si la configuration a changé
    if (updates.endpoint || updates.kubeconfig || updates.token || updates.namespace) {
      this.services.delete(clusterId);
      
      try {
        const config: InfrastructureConfig = {
          type: 'kubernetes',
          name: cluster.name,
          endpoint: cluster.endpoint,
          namespace: cluster.namespace,
          context: cluster.context,
          credentials: cluster.token ? { token: cluster.token } : undefined,
          kubeconfig: cluster.kubeconfig,
        };
        
        const service = new KubernetesInfrastructureService(config);
        this.services.set(clusterId, service);
        
        // Test de connexion
        await this.testClusterConnection(clusterId);
      } catch (error) {
        console.error(`Failed to recreate service for cluster ${cluster.name}:`, error);
        cluster.status = 'error';
      }
    }

    this.emit('cluster-updated', cluster);
    return cluster;
  }

  /**
   * Supprimer un cluster
   */
  async removeCluster(clusterId: string): Promise<void> {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) {
      throw new Error(`Cluster ${clusterId} not found`);
    }

    // Vérifier qu'aucun environnement n'est actif sur ce cluster
    const activeEnvironments = await storage.getActiveEnvironmentsByCluster(clusterId);
    if (activeEnvironments.length > 0) {
      throw new Error(`Cannot remove cluster ${cluster.name}: ${activeEnvironments.length} active environments`);
    }

    // Nettoyer le service
    const service = this.services.get(clusterId);
    if (service && 'destroy' in service) {
      try {
        (service as any).destroy();
      } catch (error) {
        console.error(`Error destroying service for cluster ${cluster.name}:`, error);
      }
    }

    // Supprimer de la base de données
    await storage.deleteKubernetesCluster(clusterId);

    // Supprimer du cache
    this.clusters.delete(clusterId);
    this.services.delete(clusterId);

    this.emit('cluster-removed', clusterId);
  }

  /**
   * Tester la connexion à un cluster
   */
  async testClusterConnection(clusterId: string): Promise<boolean> {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) {
      throw new Error(`Cluster ${clusterId} not found`);
    }

    const service = this.services.get(clusterId);
    if (!service) {
      throw new Error(`Service not found for cluster ${clusterId}`);
    }

    try {
      cluster.status = 'testing';
      this.emit('cluster-testing', cluster);

      // Test de connexion via le service
      const health = await service.getHealth();
      
      if (health.status === 'healthy') {
        cluster.status = 'connected';
        cluster.lastHealthCheck = new Date();
        
        // Récupérer les métadonnées du cluster
        const metadata = await service.getClusterInfo();
        cluster.version = metadata.version;
        cluster.nodes = metadata.nodeCount;
        cluster.resources = metadata.resources;
        cluster.metadata = metadata;
        
        await storage.updateKubernetesCluster(clusterId, cluster);
        this.emit('cluster-connected', cluster);
        
        return true;
      } else {
        cluster.status = 'error';
        await storage.updateKubernetesCluster(clusterId, cluster);
        this.emit('cluster-error', cluster);
        
        return false;
      }
    } catch (error) {
      console.error(`Connection test failed for cluster ${cluster.name}:`, error);
      cluster.status = 'error';
      await storage.updateKubernetesCluster(clusterId, cluster);
      this.emit('cluster-error', cluster);
      
      return false;
    }
  }

  /**
   * Obtenir un cluster par ID
   */
  getCluster(clusterId: string): KubernetesCluster | undefined {
    return this.clusters.get(clusterId);
  }

  /**
   * Obtenir tous les clusters
   */
  getAllClusters(): KubernetesCluster[] {
    return Array.from(this.clusters.values());
  }

  /**
   * Obtenir le cluster par défaut
   */
  getDefaultCluster(): KubernetesCluster | undefined {
    return Array.from(this.clusters.values()).find(cluster => cluster.isDefault);
  }

  /**
   * Obtenir le service d'infrastructure pour un cluster
   */
  getClusterService(clusterId: string): BaseInfrastructureService | undefined {
    return this.services.get(clusterId);
  }

  /**
   * Obtenir les métriques globales
   */
  async getInfrastructureMetrics(): Promise<InfrastructureMetrics> {
    const clusters = Array.from(this.clusters.values());
    const connectedClusters = clusters.filter(c => c.status === 'connected');
    
    let totalNodes = 0;
    let totalCpu = 0, usedCpu = 0;
    let totalMemory = 0, usedMemory = 0;
    let totalStorage = 0, usedStorage = 0;

    for (const cluster of connectedClusters) {
      if (cluster.nodes) totalNodes += cluster.nodes;
      
      if (cluster.resources) {
        totalCpu += this.parseResourceValue(cluster.resources.totalCpu);
        usedCpu += this.parseResourceValue(cluster.resources.usedCpu);
        totalMemory += this.parseResourceValue(cluster.resources.totalMemory);
        usedMemory += this.parseResourceValue(cluster.resources.usedMemory);
        totalStorage += this.parseResourceValue(cluster.resources.totalStorage);
        usedStorage += this.parseResourceValue(cluster.resources.usedStorage);
      }
    }

    const totalWorkshops = await storage.getTotalWorkshopsCount();
    const activeEnvironments = await storage.getActiveEnvironmentsCount();

    return {
      totalClusters: clusters.length,
      connectedClusters: connectedClusters.length,
      totalNodes,
      totalWorkshops,
      activeEnvironments,
      resourceUsage: {
        cpu: {
          total: this.formatResourceValue(totalCpu, 'cpu'),
          used: this.formatResourceValue(usedCpu, 'cpu'),
          percentage: totalCpu > 0 ? Math.round((usedCpu / totalCpu) * 100) : 0,
        },
        memory: {
          total: this.formatResourceValue(totalMemory, 'memory'),
          used: this.formatResourceValue(usedMemory, 'memory'),
          percentage: totalMemory > 0 ? Math.round((usedMemory / totalMemory) * 100) : 0,
        },
        storage: {
          total: this.formatResourceValue(totalStorage, 'storage'),
          used: this.formatResourceValue(usedStorage, 'storage'),
          percentage: totalStorage > 0 ? Math.round((usedStorage / totalStorage) * 100) : 0,
        },
      },
    };
  }

  /**
   * Validation de la configuration d'un cluster
   */
  private async validateClusterConfig(cluster: KubernetesCluster): Promise<void> {
    if (!cluster.name || cluster.name.trim() === '') {
      throw new Error('Cluster name is required');
    }

    if (!cluster.endpoint || cluster.endpoint.trim() === '') {
      throw new Error('Cluster endpoint is required');
    }

    if (!cluster.kubeconfig && !cluster.token) {
      throw new Error('Either kubeconfig or token is required');
    }

    // Vérifier que le nom n'est pas déjà utilisé
    const existingCluster = Array.from(this.clusters.values())
      .find(c => c.name === cluster.name && c.id !== cluster.id);
    
    if (existingCluster) {
      throw new Error(`Cluster name "${cluster.name}" is already in use`);
    }
  }

  /**
   * Démarrer les vérifications de santé automatiques
   */
  private startHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      const clusters = Array.from(this.clusters.values());
      
      for (const cluster of clusters) {
        if (cluster.status === 'connected' || cluster.status === 'error') {
          try {
            await this.testClusterConnection(cluster.id);
          } catch (error) {
            console.error(`Health check failed for cluster ${cluster.name}:`, error);
          }
        }
      }
    }, 5 * 60 * 1000); // Toutes les 5 minutes
  }

  /**
   * Arrêter les vérifications de santé
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Parser une valeur de ressource (ex: "2000m" -> 2000)
   */
  private parseResourceValue(value: string): number {
    if (!value) return 0;
    
    const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
    
    if (value.includes('Ki')) return numericValue * 1024;
    if (value.includes('Mi')) return numericValue * 1024 * 1024;
    if (value.includes('Gi')) return numericValue * 1024 * 1024 * 1024;
    if (value.includes('m')) return numericValue / 1000;
    
    return numericValue;
  }

  /**
   * Formater une valeur de ressource
   */
  private formatResourceValue(value: number, type: 'cpu' | 'memory' | 'storage'): string {
    if (type === 'cpu') {
      if (value >= 1000) return `${(value / 1000).toFixed(1)}`;
      return `${value}m`;
    }
    
    if (value >= 1024 * 1024 * 1024) return `${(value / (1024 * 1024 * 1024)).toFixed(1)}Gi`;
    if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)}Mi`;
    if (value >= 1024) return `${(value / 1024).toFixed(1)}Ki`;
    
    return `${value}`;
  }

  /**
   * Nettoyer les ressources
   */
  destroy(): void {
    this.stopHealthChecks();
    
    for (const service of this.services.values()) {
      if ('destroy' in service) {
        try {
          (service as any).destroy();
        } catch (error) {
          console.error('Error destroying service:', error);
        }
      }
    }
    
    this.clusters.clear();
    this.services.clear();
    this.removeAllListeners();
  }
}

// Instance globale
export const infrastructureManager = new InfrastructureManager();