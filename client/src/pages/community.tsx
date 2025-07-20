
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Crown, 
  Trophy, 
  MessageSquare, 
  Calendar, 
  Search, 
  Plus,
  Settings,
  BookOpen,
  Star,
  TrendingUp,
  Award,
  Target,
  Zap,
  GitBranch,
  Code
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';

const CommunityPage = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const navigate = (path: string) => setLocation(path);

  // Mock data - à remplacer par de vraies données API
  const communityStats = {
    totalMembers: 1247,
    activeThisWeek: 89,
    totalWorkshops: 156,
    completionRate: 87
  };

  const topMembers = [
    { id: 1, name: 'Alex Chen', role: 'DevOps Expert', points: 2450, avatar: '/api/placeholder/40/40', isAdmin: true },
    { id: 2, name: 'Maria Garcia', role: 'Cloud Architect', points: 2100, avatar: '/api/placeholder/40/40', isAdmin: false },
    { id: 3, name: 'David Kumar', role: 'Full Stack Dev', points: 1890, avatar: '/api/placeholder/40/40', isAdmin: false },
    { id: 4, name: 'Sarah Wilson', role: 'AI Engineer', points: 1675, avatar: '/api/placeholder/40/40', isAdmin: false },
    { id: 5, name: 'Tom Rodriguez', role: 'Security Expert', points: 1456, avatar: '/api/placeholder/40/40', isAdmin: false },
  ];

  const recentActivities = [
    { id: 1, user: 'Alex Chen', action: 'completed', target: 'Kubernetes Advanced Deployment', time: '2h ago', type: 'workshop' },
    { id: 2, user: 'Maria Garcia', action: 'started', target: 'Docker Security Best Practices', time: '4h ago', type: 'workshop' },
    { id: 3, user: 'David Kumar', action: 'achieved', target: 'DevOps Master Badge', time: '6h ago', type: 'achievement' },
    { id: 4, user: 'Sarah Wilson', action: 'posted in', target: 'AI/ML Discussion Forum', time: '8h ago', type: 'discussion' },
    { id: 5, user: 'Tom Rodriguez', action: 'completed', target: 'Cybersecurity Fundamentals', time: '1d ago', type: 'workshop' },
  ];

  const popularWorkshops = [
    { id: 1, title: 'Kubernetes Production Deployment', participants: 156, difficulty: 'Advanced', category: 'DevOps' },
    { id: 2, title: 'Docker Multi-Stage Builds', participants: 134, difficulty: 'Intermediate', category: 'Containers' },
    { id: 3, title: 'AI Model Deployment Pipeline', participants: 98, difficulty: 'Advanced', category: 'AI/ML' },
    { id: 4, title: 'Infrastructure as Code with Terraform', participants: 87, difficulty: 'Intermediate', category: 'Cloud' },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workshop': return <BookOpen className="w-4 h-4" />;
      case 'achievement': return <Award className="w-4 h-4" />;
      case 'discussion': return <MessageSquare className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nalabo-light via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-nalabo-slate mb-2">Community Hub</h1>
            <p className="text-lg text-gray-600">Connect, learn, and grow with fellow developers</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <Button variant="outline" className="border-nalabo-blue text-nalabo-blue">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-nalabo-orange hover:bg-nalabo-orange/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Workshop
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-nalabo-blue">{communityStats.totalMembers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-nalabo-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active This Week</p>
                  <p className="text-2xl font-bold text-green-600">{communityStats.activeThisWeek}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Workshops</p>
                  <p className="text-2xl font-bold text-purple-600">{communityStats.totalWorkshops}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-nalabo-orange">{communityStats.completionRate}%</p>
                </div>
                <Target className="w-8 h-8 text-nalabo-orange" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg rounded-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="workshops">Workshops</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Top Members */}
              <Card className="lg:col-span-1 bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-nalabo-slate">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topMembers.slice(0, 5).map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {member.isAdmin && (
                            <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-nalabo-slate">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-nalabo-orange border-nalabo-orange">
                          {member.points} pts
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-2 bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-nalabo-slate">
                    <Zap className="w-5 h-5 mr-2 text-nalabo-orange" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="p-2 rounded-full bg-nalabo-light">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Popular Workshops */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-nalabo-slate">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Popular Workshops
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {popularWorkshops.map((workshop) => (
                    <div key={workshop.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-nalabo-slate">{workshop.title}</h4>
                        <Badge className={getDifficultyColor(workshop.difficulty)}>
                          {workshop.difficulty}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>{workshop.participants} participants</span>
                        <Badge variant="outline" className="text-nalabo-blue border-nalabo-blue">
                          {workshop.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Community Members</CardTitle>
                <div className="flex space-x-4">
                  <Input 
                    placeholder="Search members..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topMembers.map((member) => (
                    <Card key={member.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {member.isAdmin && (
                            <Crown className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-nalabo-slate">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-nalabo-orange border-nalabo-orange">
                          {member.points} points
                        </Badge>
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workshops" className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Community Workshops</CardTitle>
                <CardDescription>
                  Explore workshops created by our community members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularWorkshops.map((workshop) => (
                    <Card key={workshop.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{workshop.title}</CardTitle>
                          <Badge className={getDifficultyColor(workshop.difficulty)}>
                            {workshop.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-600">{workshop.participants} participants</span>
                          <Badge variant="outline" className="text-nalabo-blue border-nalabo-blue">
                            {workshop.category}
                          </Badge>
                        </div>
                        <Button className="w-full bg-nalabo-blue hover:bg-nalabo-blue/90">
                          Start Workshop
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussions" className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Community Discussions</CardTitle>
                <CardDescription>
                  Join the conversation with fellow developers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Discussion Forum Coming Soon</h3>
                  <p className="text-gray-500 mb-6">
                    We're building an amazing discussion platform for our community.
                  </p>
                  <Button className="bg-nalabo-orange hover:bg-nalabo-orange/90">
                    Get Notified
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityPage;
