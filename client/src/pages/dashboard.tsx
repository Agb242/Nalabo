import { useQuery } from "@tanstack/react-query";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserStats {
  totalWorkshops: number;
  completedSessions: number;
  totalChallenges: number;
  points: number;
  communityRanking: number;
  recentSessions: any[];
}

interface LeaderboardEntry {
  rank: number;
  id: number;
  username: string;
  points: number;
  role: string;
}

export default function Dashboard() {
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/analytics/user-stats"],
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/analytics/community-leaderboard"],
  });

  if (statsLoading || leaderboardLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Données utilisateur isolées - AUCUNE donnée mock
  const stats = userStats || {
    totalWorkshops: 0,
    completedSessions: 0,
    totalChallenges: 0,
    points: 0,
    communityRanking: 0,
    recentSessions: [],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 dark:text-orange-500">
            Tableau de Bord
          </h1>
          <p className="text-slate-600 dark:text-gray-300 mt-2">
            Suivi en temps réel des performances et de l'utilisation des ressources
          </p>
        </div>

        {/* Statistiques utilisateur personnelles uniquement */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Mes Ateliers</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-orange-500">{stats.totalWorkshops}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Sessions Complétées</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-500">{stats.completedSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Mes Points</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-500">{stats.points}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Classement Communauté</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">#{stats.communityRanking}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classement communautaire isolé */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-800 dark:text-white">
              Classement de ma Communauté
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={entry.rank <= 3 ? "default" : "secondary"}>
                        #{entry.rank}
                      </Badge>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {entry.username}
                      </span>
                      {entry.role !== 'user' && (
                        <Badge variant="outline" className="text-xs">
                          {entry.role === 'community_admin' ? 'Admin' : entry.role}
                        </Badge>
                      )}
                    </div>
                    <span className="font-bold text-blue-800 dark:text-orange-500">
                      {entry.points} pts
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Aucune communauté assignée - rejoignez une communauté pour voir le classement
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
