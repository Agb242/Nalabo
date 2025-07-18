import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Settings, 
  BookOpen, 
  Server, 
  Activity, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Globe,
  Lock
} from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateWorkshop, setShowCreateWorkshop] = useState(false);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);

  // Queries
  const { data: adminStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: workshops, isLoading: isLoadingWorkshops } = useQuery({
    queryKey: ['/api/admin/workshops'],
  });

  const { data: communities, isLoading: isLoadingCommunities } = useQuery({
    queryKey: ['/api/admin/communities'],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const { data: infrastructures, isLoading: isLoadingInfra } = useQuery({
    queryKey: ['/api/admin/infrastructure'],
  });

  // Mutations
  const createWorkshopMutation = useMutation({
    mutationFn: async (workshopData: any) => {
      const response = await fetch('/api/admin/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workshopData),
      });
      if (!response.ok) throw new Error('Failed to create workshop');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workshops'] });
      toast({ title: "Atelier créé avec succès" });
      setShowCreateWorkshop(false);
    },
  });

  const createCommunityMutation = useMutation({
    mutationFn: async (communityData: any) => {
      const response = await fetch('/api/admin/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(communityData),
      });
      if (!response.ok) throw new Error('Failed to create community');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities'] });
      toast({ title: "Communauté créée avec succès" });
      setShowCreateCommunity(false);
    },
  });

  const toggleWorkshopVisibility = useMutation({
    mutationFn: async ({ id, isPublic }: { id: number; isPublic: boolean }) => {
      const response = await fetch(`/api/admin/workshops/${id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic }),
      });
      if (!response.ok) throw new Error('Failed to update workshop visibility');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workshops'] });
      toast({ title: "Visibilité mise à jour" });
    },
  });

  if (isLoadingStats || isLoadingWorkshops || isLoadingCommunities || isLoadingUsers || isLoadingInfra) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Administration Nalabo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez les utilisateurs, ateliers, communautés et infrastructures
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="workshops">Ateliers</TabsTrigger>
            <TabsTrigger value="communities">Communautés</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats?.users?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{adminStats?.users?.newThisMonth || 0} ce mois
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ateliers Actifs</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats?.workshops?.active || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {adminStats?.workshops?.total || 0} au total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessions Aujourd'hui</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats?.sessions?.today || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {adminStats?.sessions?.active || 0} actives
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Communautés</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats?.communities?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {adminStats?.communities?.private || 0} privées
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workshops Tab */}
          <TabsContent value="workshops" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestion des Ateliers</h2>
              <Dialog open={showCreateWorkshop} onOpenChange={setShowCreateWorkshop}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un atelier
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer un nouvel atelier</DialogTitle>
                  </DialogHeader>
                  <CreateWorkshopForm onSubmit={createWorkshopMutation.mutate} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {workshops?.map((workshop: any) => (
                <Card key={workshop.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{workshop.title}</h3>
                        <Badge variant={workshop.status === 'published' ? 'default' : 'secondary'}>
                          {workshop.status}
                        </Badge>
                        <Badge variant="outline">{workshop.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {workshop.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Créé par: {workshop.creatorName}</span>
                        <span>Participants: {workshop.participantCount || 0}</span>
                        <span>Communauté: {workshop.communityName || 'Public'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleWorkshopVisibility.mutate({
                          id: workshop.id,
                          isPublic: !workshop.isPublic
                        })}
                      >
                        {workshop.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestion des Communautés</h2>
              <Dialog open={showCreateCommunity} onOpenChange={setShowCreateCommunity}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une communauté
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle communauté</DialogTitle>
                  </DialogHeader>
                  <CreateCommunityForm onSubmit={createCommunityMutation.mutate} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {communities?.map((community: any) => (
                <Card key={community.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{community.name}</h3>
                        <Badge variant={community.isPrivate ? 'destructive' : 'default'}>
                          {community.isPrivate ? <Lock className="h-3 w-3 mr-1" /> : <Globe className="h-3 w-3 mr-1" />}
                          {community.isPrivate ? 'Privée' : 'Publique'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {community.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Propriétaire: {community.ownerName}</span>
                        <span>Membres: {community.memberCount || 0}</span>
                        <span>Ateliers: {community.workshopCount || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
            <div className="space-y-4">
              {users?.map((user: any) => (
                <Card key={user.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                          {user.role}
                        </Badge>
                        <Badge variant="outline">{user.plan || 'free'}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{user.email}</span>
                        <span>Points: {user.points || 0}</span>
                        <span>Inscrit: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="space-y-6">
            <h2 className="text-2xl font-bold">Gestion de l'Infrastructure</h2>
            <div className="grid gap-4">
              {infrastructures?.map((infra: any) => (
                <Card key={infra.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{infra.name}</h3>
                        <Badge variant={infra.status === 'healthy' ? 'default' : 'destructive'}>
                          {infra.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Type: {infra.type}</span>
                        <span>Sessions actives: {infra.activeSessions || 0}</span>
                        <span>CPU: {infra.resources?.cpu || 'N/A'}</span>
                        <span>Mémoire: {infra.resources?.memory || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Composant pour créer un atelier
function CreateWorkshopForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [workshop, setWorkshop] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    duration: 60,
    isPublic: true,
    communityId: null,
    accessLevel: 'public' // public, community, private
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(workshop);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          value={workshop.title}
          onChange={(e) => setWorkshop(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={workshop.description}
          onChange={(e) => setWorkshop(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Catégorie</Label>
          <Select value={workshop.category} onValueChange={(value) => setWorkshop(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="docker">Docker</SelectItem>
              <SelectItem value="kubernetes">Kubernetes</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="nodejs">Node.js</SelectItem>
              <SelectItem value="devops">DevOps</SelectItem>
              <SelectItem value="security">Sécurité</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="difficulty">Difficulté</Label>
          <Select value={workshop.difficulty} onValueChange={(value) => setWorkshop(prev => ({ ...prev, difficulty: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Débutant</SelectItem>
              <SelectItem value="intermediate">Intermédiaire</SelectItem>
              <SelectItem value="advanced">Avancé</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="accessLevel">Niveau d'accès</Label>
        <Select value={workshop.accessLevel} onValueChange={(value) => setWorkshop(prev => ({ ...prev, accessLevel: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public (tous les utilisateurs)</SelectItem>
            <SelectItem value="community">Communauté spécifique</SelectItem>
            <SelectItem value="private">Privé (invitation uniquement)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Annuler
        </Button>
        <Button type="submit">
          Créer l'atelier
        </Button>
      </div>
    </form>
  );
}

// Composant pour créer une communauté
function CreateCommunityForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [community, setCommunity] = useState({
    name: '',
    description: '',
    isPrivate: false,
    settings: {
      allowWorkshopCreation: true,
      requireApproval: false,
      maxMembers: 100
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(community);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom de la communauté</Label>
        <Input
          id="name"
          value={community.name}
          onChange={(e) => setCommunity(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={community.description}
          onChange={(e) => setCommunity(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPrivate"
          checked={community.isPrivate}
          onChange={(e) => setCommunity(prev => ({ ...prev, isPrivate: e.target.checked }))}
        />
        <Label htmlFor="isPrivate">Communauté privée</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Annuler
        </Button>
        <Button type="submit">
          Créer la communauté
        </Button>
      </div>
    </form>
  );
}