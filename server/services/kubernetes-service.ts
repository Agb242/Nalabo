import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { z } from 'zod';

const execAsync = promisify(exec);

export interface VClusterConfig {
  name: string;
  namespace: string;
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  tools: string[];
  expiresIn?: number; // hours
}

export interface KubernetesCluster {
  id: number;
  name: string;
  kubeconfig: string;
  endpoint: string;
  provider: string;
  status: 'active' | 'inactive' | 'maintenance';
}

export class KubernetesService {
  private kubeconfigPath: string;

  constructor(kubeconfigPath?: string) {
    this.kubeconfigPath = kubeconfigPath || process.env.KUBECONFIG || path.join(process.cwd(), '.kube', 'config');
  }

  /**
   * Test connection to Kubernetes cluster
   */
  async testConnection(kubeconfig?: string): Promise<boolean> {
    try {
      const kubeconfigToUse = kubeconfig || this.kubeconfigPath;
      await execAsync(`kubectl --kubeconfig=${kubeconfigToUse} version --client`, { timeout: 10000 });
      return true;
    } catch (error) {
      console.error('Kubernetes connection test failed:', error);
      return false;
    }
  }

  /**
   * Create a new vCluster instance
   */
  async createVCluster(config: VClusterConfig): Promise<{ 
    success: boolean; 
    kubeconfig?: string; 
    error?: string 
  }> {
    try {
      const { name, namespace, resources, tools } = config;

      // Create namespace if it doesn't exist
      await this.createNamespace(namespace);

      // Generate vCluster values
      const vclusterValues = {
        vcluster: {
          image: 'rancher/k3s:v1.28.4-k3s1',
          resources: {
            limits: {
              cpu: resources.cpu,
              memory: resources.memory,
            },
            requests: {
              cpu: Math.round(parseFloat(resources.cpu) * 0.1) + 'm',
              memory: Math.round(parseFloat(resources.memory.replace('Gi', '')) * 0.1) + 'Gi',
            }
          }
        },
        storage: {
          size: resources.storage,
        },
        init: {
          manifests: this.generateToolManifests(tools),
        }
      };

      // Create vCluster
      const valuesFile = `/tmp/vcluster-${name}-values.yaml`;
      await fs.writeFile(valuesFile, yaml.dump(vclusterValues));

      const createCommand = `vcluster create ${name} --namespace ${namespace} -f ${valuesFile}`;
      await execAsync(createCommand, { timeout: 300000 }); // 5 minutes timeout

      // Get kubeconfig for the vCluster
      const kubeconfigCommand = `vcluster connect ${name} --namespace ${namespace} --print`;
      const { stdout: kubeconfig } = await execAsync(kubeconfigCommand);

      // Clean up temporary file
      await fs.unlink(valuesFile);

      return {
        success: true,
        kubeconfig: kubeconfig.trim(),
      };
    } catch (error) {
      console.error('Failed to create vCluster:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete a vCluster instance
   */
  async deleteVCluster(name: string, namespace: string): Promise<boolean> {
    try {
      const deleteCommand = `vcluster delete ${name} --namespace ${namespace}`;
      await execAsync(deleteCommand, { timeout: 120000 }); // 2 minutes timeout
      return true;
    } catch (error) {
      console.error('Failed to delete vCluster:', error);
      return false;
    }
  }

  /**
   * List all vClusters in a namespace
   */
  async listVClusters(namespace?: string): Promise<Array<{
    name: string;
    namespace: string;
    status: string;
  }>> {
    try {
      const listCommand = namespace 
        ? `vcluster list --namespace ${namespace} --output json`
        : `vcluster list --output json`;

      const { stdout } = await execAsync(listCommand);
      const result = JSON.parse(stdout);

      return result.vclusters || [];
    } catch (error) {
      console.error('Failed to list vClusters:', error);
      return [];
    }
  }

  /**
   * Get vCluster status and resource usage
   */
  async getVClusterStatus(name: string, namespace: string): Promise<{
    status: string;
    resources?: {
      cpu: string;
      memory: string;
      pods: number;
    };
  }> {
    try {
      // Get basic status
      const statusCommand = `vcluster list --namespace ${namespace} --output json`;
      const { stdout } = await execAsync(statusCommand);
      const result = JSON.parse(stdout);

      const vcluster = result.vclusters?.find((vc: any) => vc.name === name);
      if (!vcluster) {
        return { status: 'not_found' };
      }

      // Get resource usage
      const resourceCommand = `kubectl top pods -n ${namespace} -l app=vcluster,release=${name} --no-headers`;
      try {
        const { stdout: resourceOutput } = await execAsync(resourceCommand);
        const lines = resourceOutput.trim().split('\n');
        let totalCpu = 0;
        let totalMemory = 0;

        lines.forEach(line => {
          const parts = line.split(/\s+/);
          if (parts.length >= 3) {
            totalCpu += parseInt(parts[1].replace('m', '')) || 0;
            totalMemory += parseInt(parts[2].replace('Mi', '')) || 0;
          }
        });

        return {
          status: vcluster.status,
          resources: {
            cpu: `${totalCpu}m`,
            memory: `${totalMemory}Mi`,
            pods: lines.length,
          }
        };
      } catch (resourceError) {
        return { status: vcluster.status };
      }
    } catch (error) {
      console.error('Failed to get vCluster status:', error);
      return { status: 'error' };
    }
  }

  /**
   * Create namespace if it doesn't exist
   */
  private async createNamespace(namespace: string): Promise<void> {
    try {
      await execAsync(`kubectl get namespace ${namespace}`);
    } catch (error) {
      // Namespace doesn't exist, create it
      await execAsync(`kubectl create namespace ${namespace}`);
    }
  }

  /**
   * Generate Kubernetes manifests for required tools
   */
  private generateToolManifests(tools: string[]): string {
    const manifests: string[] = [];

    if (tools.includes('helm')) {
      manifests.push(`
apiVersion: v1
kind: ConfigMap
metadata:
  name: helm-installer
  namespace: kube-system
data:
  install.sh: |
    #!/bin/bash
    curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
`);
    }

    if (tools.includes('kustomize')) {
      manifests.push(`
apiVersion: v1
kind: ConfigMap
metadata:
  name: kustomize-installer
  namespace: kube-system
data:
  install.sh: |
    #!/bin/bash
    curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
`);
    }

    return manifests.join('\n---\n');
  }

  /**
   * Validate kubeconfig format
   */
  static validateKubeconfig(kubeconfig: string): boolean {
    try {
      const config = yaml.load(kubeconfig) as any;
      return (
        config &&
        config.apiVersion &&
        config.kind === 'Config' &&
        config.clusters &&
        Array.isArray(config.clusters) &&
        config.users &&
        Array.isArray(config.users) &&
        config.contexts &&
        Array.isArray(config.contexts)
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Extract cluster information from kubeconfig
   */
  static extractClusterInfo(kubeconfig: string): {
    endpoint?: string;
    name?: string;
    certificate?: string;
  } {
    try {
      const config = yaml.load(kubeconfig) as any;
      const cluster = config.clusters?.[0]?.cluster;

      return {
        endpoint: cluster?.server,
        name: config.clusters?.[0]?.name,
        certificate: cluster?.['certificate-authority-data'],
      };
    } catch (error) {
      return {};
    }
  }

  /**
   * Get current context from kubeconfig
   */
  getCurrentContext(kubeconfig: string): string | undefined {
    try {
      const config = yaml.load(kubeconfig) as any;
      return config['current-context'];
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Execute kubectl command with specific kubeconfig
   */
  async executeKubectl(args: string[], kubeconfig: string): Promise<{ stdout: string; stderr: string }> {
    // Écrire temporairement le kubeconfig
    const tempKubeconfigPath = `/tmp/kubeconfig-${Date.now()}.yaml`;
    await fs.writeFile(tempKubeconfigPath, kubeconfig);

    try {
      const { stdout, stderr } = await execAsync(
        `kubectl --kubeconfig=${tempKubeconfigPath} ${args.join(' ')}`,
        { timeout: 30000 }
      );
      return { stdout, stderr };
    } finally {
      // Nettoyer le fichier temporaire
      await fs.unlink(tempKubeconfigPath).catch(() => {});
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      // Check if kubectl is available
      const checkKubectl = await this.executeCommand('which kubectl').catch(() => ({ success: false }));
      if (!checkKubectl.success) {
        console.warn('⚠️  kubectl not available in environment - Kubernetes features disabled');
        return false;
      }

      const result = await this.executeCommand('kubectl version --client');
      return result.success;
    } catch (error) {
      console.error('Kubernetes heartbeat failed:', error);
      return false;
    }
  }

  /**
   * 
   */
  
// Heartbeat pour maintenir la connexion
  private startHeartbeat() {
    // Désactivé temporairement car kubectl n'est pas disponible dans l'environnement
    // this.heartbeatInterval = setInterval(async () => {
    //   try {
    //     await this.executeKubectl(['version', '--client']);
    //   } catch (error) {
    //     console.error('Kubernetes heartbeat failed:', error);
    //   }
    // }, 30000); // Toutes les 30 secondes
  }
}

export default KubernetesService;