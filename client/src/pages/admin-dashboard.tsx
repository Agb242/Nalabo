import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Plus, Settings, Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { useNavigate } from 'react-router-dom';

interface KubernetesCluster {
  id: string;
  name: string;
  description?: string;
  endpoint: string;
  namespace: string;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastHealthCheck: Date;
  version?: string;
  nodes?: number;
  isDefault: boolean;
}

interface InfrastructureMetrics {
  totalClusters: number;
  connectedClusters: number;
  totalNodes: number;
  activeEnvironments: number;
  resourceUsage: {
    cpu: { total: string; used: string; percentage: number };
    memory: { total: string; used: string; percentage: number };
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clusters, setClusters] = useState<KubernetesCluster[]>([]);
  const [metrics, setMetrics] = useState<InfrastructureMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddCluster, setShowAddCluster] = useState(false);
  const [newCluster, setNewCluster] = useState({
    name: '',
    description: '',
    endpoint: '',
    namespace: 'nalabo',
    kubeconfig: '',
    isDefault: false,
  });

  // Vérifier les permissions admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [clustersRes, metricsRes] = await Promise.all([
        fetch('/api/admin/infrastructure/clusters'),
        fetch('/api/admin/resources/usage'),
      ]);

      if (clustersRes.ok) {
        const clustersData = await clustersRes.json();
        setClusters(clustersData.clusters || []);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.metrics);
      }
    } catch (error) {
      console.error('Erreur chargement données admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCluster = async () => {
    try {
      const response = await fetch('/api/admin/infrastructure/clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCluster),
      });

      if (response.ok) {
        setShowAddCluster(false);
        setNewCluster({
          name: '',
          description: '',
          endpoint: '',
          namespace: 'nalabo',
          kubeconfig: '',
          isDefault: false,
        });
        loadDashboardData();
      }
    } catch (error) {
      console.error('Erreur ajout cluster:', error);
    }
  };

  const handleTestConnection = async (clusterId: string) => {
    try {
      const response = await fetch(`/api/admin/infrastructure/test/${clusterId}`, {
        method: 'POST',
      });

      if (response.ok) {
        loadDashboardData(); // Recharger pour voir le statut mis à jour
      }
    } catch (error) {
      console.error('Erreur test connexion:', error);
    }
  };

  const handleDeleteCluster = async (clusterId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cluster ?')) return;

    try {
      const response = await fetch(`/api/admin/infrastructure/clusters/${clusterId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Erreur suppression cluster:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Administration Infrastructure
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Gestion des clusters Kubernetes et monitoring des ressources
        </p>
      </div>

      {/* Métriques Globales */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Clusters Connectés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.connectedClusters}/{metrics.totalClusters}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Nœuds Totaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalNodes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Environnements Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.activeEnvironments}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">CPU Utilisé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.resourceUsage.cpu.percentage}%
              </div>
              <div className="text-xs text-gray-500">
                {metrics.resourceUsage.cpu.used} / {metrics.resourceUsage.cpu.total}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="clusters" className="space-y-6">
        <TabsList>
          <TabsTrigger value="clusters">Clusters Kubernetes</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="sessions">Sessions Actives</TabsTrigger>
        </TabsList>

        <TabsContent value="clusters" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Clusters Kubernetes</h2>
            <Dialog open={showAddCluster} onOpenChange={setShowAddCluster}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Cluster
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter un Cluster Kubernetes</DialogTitle>
                  <DialogDescription>
                    Connecter un nouveau cluster pour les ateliers
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom du Cluster</Label>
                    <Input
                      id="name"
                      value={newCluster.name}
                      onChange={(e) => setNewCluster({ ...newCluster, name: e.target.value })}
                      placeholder="cluster-production"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endpoint">Endpoint API</Label>
                    <Input
                      id="endpoint"
                      value={newCluster.endpoint}
                      onChange={(e) => setNewCluster({ ...newCluster, endpoint: e.target.value })}
                      placeholder="https://api.cluster.example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="namespace">Namespace</Label>
                    <Input
                      id="namespace"
                      value={newCluster.namespace}
                      onChange={(e) => setNewCluster({ ...newCluster, namespace: e.target.value })}
                      placeholder="nalabo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kubeconfig">Kubeconfig</Label>
                    <textarea
                      id="kubeconfig"
                      className="w-full h-32 p-2 border rounded text-sm font-mono"
                      value={newCluster.kubeconfig}
                      onChange={(e) => setNewCluster({ ...newCluster, kubeconfig: e.target.value })}
                      placeholder="Coller le contenu kubeconfig..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddCluster(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddCluster}>Ajouter</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Nodes</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clusters.map((cluster) => (
                    <TableRow key={cluster.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {cluster.name}
                          {cluster.isDefault && (
                            <Badge variant="secondary">Défaut</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(cluster.status)}
                          <span className="capitalize">{cluster.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {cluster.endpoint}
                      </TableCell>
                      <TableCell>{cluster.nodes || '-'}</TableCell>
                      <TableCell>{cluster.version || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestConnection(cluster.id)}
                          >
                            <Activity className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteCluster(cluster.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring des Ressources</CardTitle>
              <CardDescription>
                Surveillance en temps réel des clusters connectés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Interface de monitoring en cours d'implémentation
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Sessions d'Ateliers Actives</CardTitle>
              <CardDescription>
                Sessions en cours d'exécution sur les clusters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Liste des sessions actives en cours d'implémentation
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}