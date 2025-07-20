import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/language-context';
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
  Users, 
  Plus, 
  Settings, 
  Trash2, 
  Edit3,
  UserPlus,
  Shield,
  Crown,
  Activity,
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface Community {
  id: number;
  name: string;
  description?: string;
  subscription: 'free' | 'enterprise';
  resourceLimits?: {
    maxUsers?: number;
    maxWorkshops?: number;
    maxStorage?: number;
  };
  memberCount: number;
  ownerId: number;
  createdAt: string;
}

interface CommunityMember {
  id: number;
  userId: number;
  communityId: number;
  role: 'member' | 'admin' | 'moderator';
  joinedAt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export default function CommunityManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    subscription: 'free' as 'free' | 'enterprise'
  });

  // Fetch communities
  const { data: communities, isLoading } = useQuery({
    queryKey: ['/api/communities'],
    queryFn: () => apiRequest('/api/communities')
  });

  // Fetch community members when a community is selected
  const { data: members } = useQuery({
    queryKey: ['/api/communities', selectedCommunity?.id, 'members'],
    queryFn: () => apiRequest(`/api/communities/${selectedCommunity?.id}/members`),
    enabled: !!selectedCommunity
  });

  // Create community mutation
  const createCommunityMutation = useMutation({
    mutationFn: (data: typeof newCommunity) => 
      apiRequest('/api/communities', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
      setShowCreateDialog(false);
      setNewCommunity({ name: '', description: '', subscription: 'free' });
      toast({
        title: t('common.success'),
        description: 'Community created successfully',
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: 'Failed to create community',
        variant: 'destructive',
      });
    }
  });

  // Update community mutation
  const updateCommunityMutation = useMutation({
    mutationFn: (data: Partial<Community>) => 
      apiRequest(`/api/communities/${selectedCommunity?.id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
      setShowEditDialog(false);
      toast({
        title: t('common.success'),
        description: 'Community updated successfully',
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: 'Failed to update community',
        variant: 'destructive',
      });
    }
  });

  // Delete community mutation
  const deleteCommunityMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/communities/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
      setSelectedCommunity(null);
      toast({
        title: t('common.success'),
        description: 'Community deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: 'Failed to delete community',
        variant: 'destructive',
      });
    }
  });

  const handleCreateCommunity = () => {
    createCommunityMutation.mutate(newCommunity);
  };

  const handleUpdateCommunity = (updates: Partial<Community>) => {
    updateCommunityMutation.mutate(updates);
  };

  const handleDeleteCommunity = (id: number) => {
    if (window.confirm('Are you sure you want to delete this community?')) {
      deleteCommunityMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-nalabo-slate">
          {t('community.management')}
        </h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-nalabo-orange hover:bg-nalabo-orange/90">
              <Plus className="w-4 h-4 mr-2" />
              {t('community.createCommunity')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('community.createCommunity')}</DialogTitle>
              <DialogDescription>
                Create a new community for your organization or project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Community Name</Label>
                <Input
                  id="name"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity(prev => ({...prev, name: e.target.value}))}
                  placeholder="Enter community name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity(prev => ({...prev, description: e.target.value}))}
                  placeholder="Describe your community"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="subscription">Subscription Plan</Label>
                <Select 
                  value={newCommunity.subscription} 
                  onValueChange={(value: 'free' | 'enterprise') => 
                    setNewCommunity(prev => ({...prev, subscription: value}))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleCreateCommunity}
                  disabled={createCommunityMutation.isPending || !newCommunity.name}
                >
                  {createCommunityMutation.isPending ? t('common.loading') : t('common.create')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities?.map((community: Community) => (
              <Card key={community.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCommunity(community)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>{community.name}</span>
                    </CardTitle>
                    <Badge variant={community.subscription === 'enterprise' ? 'default' : 'secondary'}>
                      {community.subscription}
                    </Badge>
                  </div>
                  <CardDescription>{community.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{community.memberCount} members</span>
                    <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCommunity(community);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCommunity(community.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          {selectedCommunity ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">
                  Members of {selectedCommunity.name}
                </h2>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Members
                </Button>
              </div>
              
              <div className="grid gap-4">
                {members?.map((member: CommunityMember) => (
                  <Card key={member.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-nalabo-blue to-nalabo-orange rounded-full flex items-center justify-center text-white font-semibold">
                          {member.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{member.user.username}</p>
                          <p className="text-sm text-gray-600">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {member.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                          {member.role === 'moderator' && <Shield className="w-3 h-3 mr-1" />}
                          {member.role}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Select a community to view its members</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {selectedCommunity ? (
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Community Settings</CardTitle>
                  <CardDescription>
                    Configure your community preferences and limitations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Community Name</Label>
                    <Input defaultValue={selectedCommunity.name} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea defaultValue={selectedCommunity.description} rows={3} />
                  </div>
                  <div>
                    <Label>Subscription Plan</Label>
                    <Select defaultValue={selectedCommunity.subscription}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedCommunity.subscription === 'enterprise' && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold">Resource Limits</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Max Users</Label>
                          <Input type="number" defaultValue={selectedCommunity.resourceLimits?.maxUsers || 100} />
                        </div>
                        <div>
                          <Label>Max Workshops</Label>
                          <Input type="number" defaultValue={selectedCommunity.resourceLimits?.maxWorkshops || 50} />
                        </div>
                        <div>
                          <Label>Max Storage (GB)</Label>
                          <Input type="number" defaultValue={selectedCommunity.resourceLimits?.maxStorage || 100} />
                        </div>
                      </div>
                    </div>
                  )}
                  <Button 
                    className="w-full"
                    onClick={() => handleUpdateCommunity({
                      name: selectedCommunity.name,
                      description: selectedCommunity.description
                    })}
                  >
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Select a community to configure its settings</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Community Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Community</DialogTitle>
            <DialogDescription>
              Update community information and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedCommunity && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Community Name</Label>
                <Input
                  id="edit-name"
                  defaultValue={selectedCommunity.name}
                  onChange={(e) => setSelectedCommunity(prev => prev ? {...prev, name: e.target.value} : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  defaultValue={selectedCommunity.description}
                  onChange={(e) => setSelectedCommunity(prev => prev ? {...prev, description: e.target.value} : null)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={() => handleUpdateCommunity({
                    name: selectedCommunity.name,
                    description: selectedCommunity.description
                  })}
                  disabled={updateCommunityMutation.isPending}
                >
                  {updateCommunityMutation.isPending ? t('common.loading') : t('common.save')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}