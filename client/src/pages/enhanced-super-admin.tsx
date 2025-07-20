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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Users, 
  Server, 
  Settings, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown,
  Database,
  MonitorSpeaker,
  BarChart3,
  UserCheck,
  UserX,
  Building2,
  Zap
} from 'lucide-react';

interface SystemUser {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'workshop_creator' | 'community_admin' | 'super_admin';
  communityId?: number;
  communityName?: string;
  status: 'active' | 'suspended' | 'pending';
  lastActive: string;
  createdAt: string;
}

interface Community {
  id: number;
  name: string;
  description?: string;
  subscription: 'free' | 'enterprise';
  memberCount: number;
  workshopCount: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };
  owner: {
    id: number;
    username: string;
  };
  createdAt: string;
}

interface SystemStats {
  totalUsers: number;
  totalCommunities: number;
  activeWorkshops: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  resourceUtilization: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

export default function EnhancedSuperAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  // Fetch system stats
  const { data: systemStats, isLoading: statsLoading } = useQuery<SystemStats>({
    queryKey: ['/api', 'super-admin', 'stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery<SystemUser[]>({
    queryKey: ['/api', 'super-admin', 'users']
  });

  // Fetch all communities
  const { data: communities, isLoading: communitiesLoading } = useQuery<SystemCommunity[]>({
    queryKey: ['/api', 'super-admin', 'communities']
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: (data: { userId: number; role: string; communityId?: number }) =>
      apiRequest('PATCH', '/api/super-admin/users/role', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/users'] });
      toast({
        title: t('common.success'),
        description: 'User role updated successfully',
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  });

  // Suspend/activate user mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: (data: { userId: number; status: 'active' | 'suspended' }) =>
      apiRequest('PATCH', '/api/super-admin/users/status', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/users'] });
      toast({
        title: t('common.success'),
        description: 'User status updated successfully',
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  });

  const handleRoleChange = (userId: number, role: string, communityId?: number) => {
    updateUserRoleMutation.mutate({ userId, role, communityId });
  };

  const handleUserStatusToggle = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    toggleUserStatusMutation.mutate({ userId, status: newStatus });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'community_admin': return 'bg-blue-100 text-blue-800';
      case 'workshop_creator': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="w-4 h-4" />;
      case 'community_admin': return <Shield className="w-4 h-4" />;
      case 'workshop_creator': return <Settings className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (statsLoading || usersLoading || communitiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-nalabo-slate flex items-center">
          <Crown className="w-8 h-8 mr-3 text-nalabo-orange" />
          Super Admin Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <Badge variant={systemStats?.systemHealth === 'healthy' ? 'default' : 'destructive'}>
            {systemStats?.systemHealth === 'healthy' ? (
              <CheckCircle className="w-4 h-4 mr-1" />
            ) : (
              <AlertTriangle className="w-4 h-4 mr-1" />
            )}
            System {systemStats?.systemHealth}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Active platform users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Communities</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.totalCommunities || 0}</div>
                <p className="text-xs text-muted-foreground">Active communities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Workshops</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.activeWorkshops || 0}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStats?.resourceUtilization?.cpu || 0}%
                </div>
                <p className="text-xs text-muted-foreground">CPU utilization</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks and system management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Create Admin</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>New Community</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Server className="w-4 h-4" />
                  <span>System Health</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>View Audit Logs</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">User Management</h2>
            <Button>
              <UserCheck className="w-4 h-4 mr-2" />
              Invite Super Admin
            </Button>
          </div>

          <div className="grid gap-4">
            {users?.map((user: SystemUser) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-nalabo-blue to-nalabo-orange rounded-full flex items-center justify-center text-white font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold flex items-center">
                        {user.username}
                        {user.role !== 'user' && (
                          <span className="ml-2">
                            {getRoleIcon(user.role)}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.communityName && (
                        <p className="text-xs text-gray-500">Community: {user.communityName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                    
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                      {user.status}
                    </Badge>

                    <Select
                      value={user.role}
                      onValueChange={(newRole) => handleRoleChange(user.id, newRole, user.communityId)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="workshop_creator">Workshop Creator</SelectItem>
                        <SelectItem value="community_admin">Community Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant={user.status === 'active' ? 'destructive' : 'default'}
                      onClick={() => handleUserStatusToggle(user.id, user.status)}
                    >
                      {user.status === 'active' ? (
                        <>
                          <UserX className="w-4 h-4 mr-1" />
                          Suspend
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="communities" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Community Overview</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities?.map((community: Community) => (
              <Card key={community.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="w-5 h-5" />
                      <span>{community.name}</span>
                    </CardTitle>
                    <Badge variant={community.subscription === 'enterprise' ? 'default' : 'secondary'}>
                      {community.subscription}
                    </Badge>
                  </div>
                  <CardDescription>{community.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Members:</span>
                      <span className="font-medium">{community.memberCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Workshops:</span>
                      <span className="font-medium">{community.workshopCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Owner:</span>
                      <span className="font-medium">{community.owner.username}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        CPU: {community.resourceUsage.cpu}% | 
                        Memory: {community.resourceUsage.memory}% | 
                        Storage: {community.resourceUsage.storage}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>Kubernetes Infrastructure</span>
              </CardTitle>
              <CardDescription>
                Monitor and manage the underlying Kubernetes infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="font-semibold">Cluster Status</p>
                  <p className="text-sm text-gray-600">Healthy</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Database className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="font-semibold">Database</p>
                  <p className="text-sm text-gray-600">Connected</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <MonitorSpeaker className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <p className="font-semibold">Monitoring</p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}