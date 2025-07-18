import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Server, 
  Database, 
  Activity, 
  Users, 
  Settings, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Monitor,
  Cpu,
  MemoryStick,
  HardDrive,
  Globe,
  RefreshCw
} from "lucide-react";

interface KubernetesCluster {
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

interface InfrastructureMetrics {
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

const clusterFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  endpoint: z.string().url("URL d'endpoint valide requise"),
  kubeconfig: z.string().optional(),
  token: z.string().optional(),
  namespace: z.string().default("nalabo"),
  context: z.string().optional(),
  isDefault: z.boolean().default(false),
}).refine(data => data.kubeconfig || data.token, {
  message: "Kubeconfig ou token requis",
});

type ClusterFormData = z.infer<typeof clusterFormSchema>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCluster, setSelectedCluster] = useState<KubernetesCluster | null>(null);
  const [showAddCluster, setShowAddCluster] = useState(false);
  const [editingCluster, setEditingCluster] = useState<KubernetesCluster | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Formulaire pour ajouter/modifier un cluster
  const form = useForm<ClusterFormData>({
    resolver: zodResolver(clusterFormSchema),
    defaultValues: {
      name: "",
      description: "",
      endpoint: "",
      kubeconfig: "",
      token: "",
      namespace: "nalabo",
      context: "",
      isDefault: false,
    },
  });

  // Requêtes
  const { data: metrics, isLoading: metricsLoading } = useQuery<InfrastructureMetrics>({
    queryKey: ['/api/admin/resources/usage'],
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  const { data: clusters = [], isLoading: clustersLoading } = useQuery<KubernetesCluster[]>({
    queryKey: ['/api/admin/infrastructures'],
    refetchInterval: 5000, // Rafraîchir toutes les 5 secondes pour le status
  });

  // Mutations
  const addClusterMutation = useMutation({
    mutationFn: async (data: ClusterFormData) => {
      const response = await fetch('/api/admin/infrastructures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add cluster');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Cluster ajouté avec succès" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/infrastructures'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resources/usage'] });
      setShowAddCluster(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const updateClusterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClusterFormData> }) => {
      const response = await fetch(`/api/admin/infrastructures/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update cluster');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Cluster mis à jour avec succès" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/infrastructures'] });
      setEditingCluster(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteClusterMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/infrastructures/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete cluster');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Cluster supprimé avec succès" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/infrastructures'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resources/usage'] });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/infrastructures/${id}/test`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Connection test failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: data.connectionTest.success ? "Connexion réussie" : "Connexion échouée",
        variant: data.connectionTest.success ? "default" : "destructive"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/infrastructures'] });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/infrastructures/${id}/set-default`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to set default');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Cluster défini par défaut avec succès" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/infrastructures'] });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  // Handlers
  const handleAddCluster = (data: ClusterFormData) => {
    addClusterMutation.mutate(data);
  };

  const handleUpdateCluster = (data: ClusterFormData) => {
    if (!editingCluster) return;
    updateClusterMutation.mutate({ id: editingCluster.id, data });
  };

  const handleEditCluster = (cluster: KubernetesCluster) => {
    setEditingCluster(cluster);
    form.reset({
      name: cluster.name,
      description: cluster.description || "",
      endpoint: cluster.endpoint,
      namespace: cluster.namespace,
      context: cluster.context || "",
      isDefault: cluster.isDefault,
      // Ne pas charger les credentials sensibles
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'testing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'testing': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 dark:text-orange-500 mb-2">
            Administration Nalabo
          </h1>
          <p className="text-slate-600 dark:text-gray-300">
            Gestion centralisée des infrastructures Kubernetes et monitoring
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="infrastructures">Infrastructures</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            {metricsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Clusters Connectés</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {metrics?.connectedClusters}/{metrics?.totalClusters}
                        </p>
                      </div>
                      <Server className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Environnements Actifs</p>
                        <p className="text-2xl font-bold text-green-600">{metrics?.activeEnvironments}</p>
                      </div>
                      <Activity className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Workshops</p>
                        <p className="text-2xl font-bold text-purple-600">{metrics?.totalWorkshops}</p>
                      </div>
                      <Database className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nœuds Total</p>
                        <p className="text-2xl font-bold text-orange-600">{metrics?.totalNodes}</p>
                      </div>
                      <Monitor className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Utilisation des ressources */}
            {metrics && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <Cpu className="h-4 w-4 mr-2" />
                      CPU
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilisé: {metrics.resourceUsage.cpu.used}</span>
                        <span>Total: {metrics.resourceUsage.cpu.total}</span>
                      </div>
                      <Progress value={metrics.resourceUsage.cpu.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {metrics.resourceUsage.cpu.percentage}% d'utilisation
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <MemoryStick className="h-4 w-4 mr-2" />
                      Mémoire
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilisé: {metrics.resourceUsage.memory.used}</span>
                        <span>Total: {metrics.resourceUsage.memory.total}</span>
                      </div>
                      <Progress value={metrics.resourceUsage.memory.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {metrics.resourceUsage.memory.percentage}% d'utilisation
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <HardDrive className="h-4 w-4 mr-2" />
                      Stockage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilisé: {metrics.resourceUsage.storage.used}</span>
                        <span>Total: {metrics.resourceUsage.storage.total}</span>
                      </div>
                      <Progress value={metrics.resourceUsage.storage.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {metrics.resourceUsage.storage.percentage}% d'utilisation
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Gestion des infrastructures */}
          <TabsContent value="infrastructures" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Infrastructures Kubernetes</h2>
              <Dialog open={showAddCluster} onOpenChange={setShowAddCluster}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un cluster
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCluster ? "Modifier le cluster" : "Ajouter un nouveau cluster"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form 
                      onSubmit={form.handleSubmit(editingCluster ? handleUpdateCluster : handleAddCluster)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom du cluster</FormLabel>
                              <FormControl>
                                <Input placeholder="ex: prod-cluster" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="namespace"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Namespace</FormLabel>
                              <FormControl>
                                <Input placeholder="nalabo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Description du cluster" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endpoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endpoint API</FormLabel>
                            <FormControl>
                              <Input placeholder="https://api.cluster.example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="context"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contexte (optionnel)</FormLabel>
                            <FormControl>
                              <Input placeholder="nom du contexte" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="token"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Token d'authentification</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Bearer token" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="kubeconfig"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kubeconfig (alternative au token)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Contenu du fichier kubeconfig YAML"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isDefault"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Cluster par défaut</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Utiliser ce cluster par défaut pour les nouveaux workshops
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setShowAddCluster(false);
                            setEditingCluster(null);
                            form.reset();
                          }}
                        >
                          Annuler
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={addClusterMutation.isPending || updateClusterMutation.isPending}
                        >
                          {addClusterMutation.isPending || updateClusterMutation.isPending ? "En cours..." : 
                           editingCluster ? "Mettre à jour" : "Ajouter"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Liste des clusters */}
            {clustersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {clusters.map((cluster) => (
                  <Card key={cluster.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold">{cluster.name}</h3>
                            {cluster.isDefault && (
                              <Badge variant="outline" className="text-xs">
                                Par défaut
                              </Badge>
                            )}
                            <Badge variant={getStatusBadgeVariant(cluster.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(cluster.status)}
                                <span className="capitalize">{cluster.status}</span>
                              </div>
                            </Badge>
                          </div>
                          {cluster.description && (
                            <p className="text-sm text-muted-foreground">{cluster.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Globe className="h-4 w-4 mr-1" />
                              {cluster.endpoint}
                            </span>
                            <span>Namespace: {cluster.namespace}</span>
                            {cluster.version && <span>v{cluster.version}</span>}
                            {cluster.nodes && <span>{cluster.nodes} nœuds</span>}
                          </div>
                          {cluster.lastHealthCheck && (
                            <p className="text-xs text-muted-foreground">
                              Dernière vérification: {new Date(cluster.lastHealthCheck).toLocaleString('fr-FR')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testConnectionMutation.mutate(cluster.id)}
                            disabled={testConnectionMutation.isPending}
                          >
                            <TestTube className="h-4 w-4 mr-1" />
                            Tester
                          </Button>
                          {!cluster.isDefault && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDefaultMutation.mutate(cluster.id)}
                              disabled={setDefaultMutation.isPending}
                            >
                              Définir par défaut
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              handleEditCluster(cluster);
                              setShowAddCluster(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteClusterMutation.mutate(cluster.id)}
                            disabled={deleteClusterMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {clusters.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Aucun cluster configuré</h3>
                      <p className="text-muted-foreground mb-4">
                        Ajoutez votre premier cluster Kubernetes pour commencer
                      </p>
                      <Button onClick={() => setShowAddCluster(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un cluster
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            <h2 className="text-2xl font-bold">Monitoring en temps réel</h2>
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Monitoring avancé</h3>
              <p className="text-muted-foreground">
                Cette section sera enrichie avec des graphiques détaillés et des alertes
              </p>
            </div>
          </TabsContent>

          {/* Paramètres */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Paramètres de la plateforme</h2>
            <div className="text-center py-12">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Configuration système</h3>
              <p className="text-muted-foreground">
                Paramètres globaux et configuration avancée de Nalabo
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}