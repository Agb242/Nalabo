import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { Leaderboard } from "@/components/challenges/leaderboard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Challenge } from "@shared/schema";

interface ChallengeWithExtras extends Challenge {
  participantCount: number;
  timeRemaining: string;
}

export default function Challenges() {
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
      title: "Docker Optimization Challenge",
      description: "Optimisez une image Docker existante",
      creatorId: 1,
      category: "docker",
      difficulty: "intermediate",
      points: 500,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      isActive: true,
      rules: {},
      createdAt: new Date(),
      participantCount: 127,
      timeRemaining: "2j restants",
    },
    {
      id: 2,
      title: "CTF Cybersécurité",
      description: "Capture The Flag - Sécurité web",
      creatorId: 1,
      category: "security",
      difficulty: "advanced",
      points: 750,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isActive: true,
      rules: {},
      createdAt: new Date(),
      participantCount: 89,
      timeRemaining: "5j restants",
    },
    {
      id: 3,
      title: "Machine Learning Pipeline",
      description: "Créez un pipeline ML performant",
      creatorId: 1,
      category: "ai-ml",
      difficulty: "expert",
      points: 1000,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      rules: {},
      createdAt: new Date(),
      participantCount: 56,
      timeRemaining: "7j restants",
    },
  ];

  const mockLeaderboard = [
    { rank: 1, username: "Marie Dubois", points: 2847, title: "DevOps Expert" },
    { rank: 2, username: "Pierre Martin", points: 2156, title: "Full Stack Dev" },
    { rank: 3, username: "Sophie Chen", points: 1923, title: "ML Engineer" },
  ];

  const displayChallenges = challenges || mockChallenges;
  const displayLeaderboard = leaderboard || mockLeaderboard;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-blue-800 dark:text-orange-500">
            Défis Communautaires
          </h1>
          <p className="text-slate-600 dark:text-gray-300 max-w-2xl mx-auto">
            Participez aux défis techniques et montez dans le classement
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Challenges */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6 text-blue-800 dark:text-white">
              Défis Actifs
            </h2>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {displayChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onParticipate={handleParticipate}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <Leaderboard
              entries={displayLeaderboard}
              currentUserRank={47}
              currentUserPoints={892}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
