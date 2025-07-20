import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Server, 
  Users, 
  Building2, 
  Activity, 
  Plus, 
  Settings, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface KubernetesCluster {
  id: number;
  name: string;
  description?: string;
  endpoint: string;
  provider: string;
  status: 'active' | 'inactive' | 'maintenance';
  vclusterEnabled: boolean;
  resourceLimits?: any;
  managedById: number;
  createdAt: string;
  updatedAt: string;
}

interface VCluster {
  id: number;
  name: string;
  workshopId: number;
  userId: number;
  clusterId: number;
  namespace: string;
  status: string;
  resourceUsage?: any;
  expiresAt?: string;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  subscription: string;
  communityId?: number;
  createdAt: string;
}

interface Community {
  id: number;
  name: string;
  description?: string;
  subscription: string;
  resourceLimits?: any;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCluster, setSelectedCluster] = useState<KubernetesCluster | null>(null);
  const [showAddClusterDialog, setShowAddClusterDialog] = useState(false);

  // Récupération des données
  const { data: stats } = useQuery({
    queryKey: ['/api/super-admin/stats'],
    queryFn: () => apiRequest('GET', '/api/super-admin/stats'),
  });

  const { data: clustersData } = useQuery({
    queryKey: ['/api/super-admin/infrastructure'],
    queryFn: () => apiRequest('GET', '/api/super-admin/infrastructure'),
  });

  const { data: vclustersData } = useQuery({
    queryKey: ['/api/super-admin/vclusters'],
    queryFn: () => apiRequest('GET', '/api/super-admin/vclusters'),
  });

  const { data: usersData } = useQuery({
    queryKey: ['/api/super-admin/users'],
    queryFn: () => apiRequest('GET', '/api/super-admin/users'),
  });

  const { data: communitiesData } = useQuery({
    queryKey: ['/api/super-admin/communities'],
    queryFn: () => apiRequest('GET', '/api/super-admin/communities'),
  });

  // Mutations
  const addClusterMutation = useMutation({
    mutationFn: (clusterData: any) => 
      apiRequest('POST', '/api/super-admin/infrastructure', clusterData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/infrastructure'] });
      setShowAddClusterDialog(false);
      toast({
        title: "Cluster ajouté",
        description: "Le cluster Kubernetes a été ajouté avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le cluster",
        variant: "destructive",
      });
    },
  });

  const deleteClusterMutation = useMutation({
    mutationFn: (clusterId: number) => 
      apiRequest('DELETE', `/api/super-admin/infrastructure/${clusterId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/infrastructure'] });
      toast({
        title: "Cluster supprimé",
        description: "Le cluster a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le cluster",
        variant: "destructive",
      });
    },
  });

  const clusters: KubernetesCluster[] = clustersData?.clusters || [];
  const vclusters: VCluster[] = vclustersData?.vclusters || [];
  const users: User[] = usersData?.users || [];
  const communities: Community[] = communitiesData?.communities || [];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      ready: 'default',
      inactive: 'secondary',
      maintenance: 'destructive',
      failed: 'destructive',
      creating: 'outline',
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const handleAddCluster = (formData: FormData) => {
    const clusterData = {
      name: formData.get('name'),
      description: formData.get('description'),
      kubeconfig: formData.get('kubeconfig'),
      endpoint: formData.get('endpoint'),
      provider: formData.get('provider'),
      vclusterEnabled: formData.get('vclusterEnabled') === 'on',
    };

    addClusterMutation.mutate(clusterData);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administration Système</h1>
          <p className="text-muted-foreground">
            Gestion de l'infrastructure et des permissions Nalabo
          </p>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ateliers</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats?.totalWorkshops || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">vClusters Actifs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats?.activeVClusters || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clusters K8s</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats?.kubernetesClusters || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de gestion */}
      <Tabs defaultValue="infrastructure" className="space-y-4">
        <TabsList>
          <TabsTrigger value="infrastructure">Infrastructure K8s</TabsTrigger>
          <TabsTrigger value="vclusters">vClusters</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="communities">Communautés</TabsTrigger>
        </TabsList>

        {/* Infrastructure Kubernetes */}
        <TabsContent value="infrastructure" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Clusters Kubernetes</h2>
            <Dialog open={showAddClusterDialog} onOpenChange={setShowAddClusterDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter Cluster
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un Cluster Kubernetes</DialogTitle>
                  <DialogDescription>
                    Connectez un nouveau cluster K8s pour héberger les ateliers
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleAddCluster(formData);
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom du cluster</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provider">Fournisseur</Label>
                      <Select name="provider" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aws">AWS EKS</SelectItem>
                          <SelectItem value="gcp">Google GKE</SelectItem>
                          <SelectItem value="azure">Azure AKS</SelectItem>
                          <SelectItem value="on-premise">On-Premise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endpoint">Endpoint API</Label>
                    <Input id="endpoint" name="endpoint" type="url" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" name="description" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kubeconfig">Kubeconfig</Label>
                    <Textarea 
                      id="kubeconfig" 
                      name="kubeconfig" 
                      rows={8}
                      placeholder="Collez votre kubeconfig ici..."
                      required 
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="vclusterEnabled"
                      name="vclusterEnabled"
                      defaultChecked
                    />
                    <Label htmlFor="vclusterEnabled">Activer vCluster</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddClusterDialog(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={addClusterMutation.isPending}>
                      {addClusterMutation.isPending ? 'Ajout...' : 'Ajouter'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {clusters.map((cluster) => (
              <Card key={cluster.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {cluster.name}
                        {getStatusBadge(cluster.status)}
                      </CardTitle>
                      <CardDescription>
                        {cluster.provider} • {cluster.endpoint}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteClusterMutation.mutate(cluster.id)}
                        disabled={deleteClusterMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">vCluster:</span>
                      <span className="ml-2">
                        {cluster.vclusterEnabled ? (
                          <CheckCircle className="inline h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="inline h-4 w-4 text-red-600" />
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">vClusters actifs:</span>
                      <span className="ml-2 font-medium">
                        {vclusters.filter(vc => vc.clusterId === cluster.id && vc.status === 'ready').length}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Créé:</span>
                      <span className="ml-2">{new Date(cluster.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* vClusters */}
        <TabsContent value="vclusters" className="space-y-4">
          <h2 className="text-2xl font-semibold">vClusters Actifs</h2>
          <div className="grid gap-4">
            {vclusters.map((vcluster) => (
              <Card key={vcluster.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {vcluster.name}
                        {getStatusBadge(vcluster.status)}
                      </CardTitle>
                      <CardDescription>
                        Namespace: {vcluster.namespace}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {vcluster.expiresAt && (
                        <Badge variant="outline">
                          <Clock className="mr-1 h-3 w-3" />
                          Expire: {new Date(vcluster.expiresAt).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Atelier ID:</span>
                      <span className="ml-2 font-medium">{vcluster.workshopId}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Utilisateur ID:</span>
                      <span className="ml-2 font-medium">{vcluster.userId}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cluster ID:</span>
                      <span className="ml-2 font-medium">{vcluster.clusterId}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Créé:</span>
                      <span className="ml-2">{new Date(vcluster.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Utilisateurs */}
        <TabsContent value="users" className="space-y-4">
          <h2 className="text-2xl font-semibold">Gestion des Utilisateurs</h2>
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{user.username}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Badge variant="outline">{user.subscription}</Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Communautés */}
        <TabsContent value="communities" className="space-y-4">
          <h2 className="text-2xl font-semibold">Gestion des Communautés</h2>
          <div className="grid gap-4">
            {communities.map((community) => (
              <Card key={community.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{community.name}</CardTitle>
                      <CardDescription>{community.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{community.subscription}</Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}