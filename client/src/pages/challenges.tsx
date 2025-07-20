import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { Leaderboard } from "@/components/challenges/leaderboard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Challenge } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Target, Clock, Users, Star, Award, Zap, Crown, Medal, TrendingUp } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';

interface ChallengeWithExtras extends Challenge {
  participantCount: number;
  timeRemaining: string;
}

export default function Challenges() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('challenges');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: challenges, isLoading } = useQuery<ChallengeWithExtras[]>({
    queryKey: ["/api/challenges/active"],
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  const participateMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const response = await apiRequest("POST", "/api/challenge-participations", {
        challengeId,
        userId: 1, // TODO: Get from auth context
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Participation confirmée",
        description: "Vous participez maintenant au défi !",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/active"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de participer au défi.",
        variant: "destructive",
      });
    },
  });

  const handleParticipate = (challengeId: number) => {
    participateMutation.mutate(challengeId);
  };

  const mockChallenges: ChallengeWithExtras[] = [
    {
      id: 1,
      title: 'Docker Fundamentals Sprint',
      description: 'Master containerization basics through hands-on workshops',
      creatorId: 1,
      category: 'containers',
      difficulty: 'Beginner',
      points: 250,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      rules: {},
      createdAt: new Date(),
      participantCount: 1847,
      timeRemaining: '1 week',
    },
    {
      id: 2,
      title: 'Kubernetes Production Challenge',
      description: 'Deploy and manage complex applications in K8s',
      creatorId: 1,
      category: 'orchestration',
      difficulty: 'Advanced',
      points: 750,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isActive: true,
      rules: {},
      createdAt: new Date(),
      participantCount: 345,
      timeRemaining: '2 weeks',
    },
    {
      id: 3,
      title: 'AI/ML Pipeline Builder',
      description: 'Build end-to-end machine learning pipelines',
      creatorId: 1,
      category: 'ai-ml',
      difficulty: 'Advanced',
      points: 900,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      isActive: true,
      rules: {},
      createdAt: new Date(),
      participantCount: 178,
      timeRemaining: '3 weeks',
    },
  ];

  const mockLeaderboard = [
    { rank: 1, username: "Marie Dubois", points: 2847, title: "DevOps Expert" },
    { rank: 2, username: "Pierre Martin", points: 2156, title: "Full Stack Dev" },
    { rank: 3, username: "Sophie Chen", points: 1923, title: "ML Engineer" },
  ];

  const displayChallenges = challenges || mockChallenges;
  const displayLeaderboard = leaderboard || mockLeaderboard;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'containers': return '🐳';
      case 'orchestration': return '☸️';
      case 'ai-ml': return '🤖';
      case 'devops': return '⚙️';
      case 'security': return '🔒';
      default: return '💻';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-orange-500" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nalabo-light via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-nalabo-slate mb-4">Technical Challenges</h1>
          <p className="text-lg text-gray-600">
            Take on exciting challenges integrated with workshops and climb the leaderboard
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-lg rounded-lg">
            <TabsTrigger value="challenges">Active Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard">Global Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onParticipate={handleParticipate}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-nalabo-slate">
                  <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                  Global Leaderboard
                </CardTitle>
                <CardDescription>
                  Top performers across all challenges and workshops
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayLeaderboard.map((member) => (
                    <div key={member.rank} className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:shadow-md ${
                      member.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10">
                          {getRankIcon(member.rank)}
                        </div>

                        <Avatar className="w-12 h-12">
                          <AvatarImage src="/api/placeholder/40/40" />
                          <AvatarFallback>{member.username.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-nalabo-slate">{member.username}</h4>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-lg text-nalabo-blue">
                          {member.points.toLocaleString()} pts
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}