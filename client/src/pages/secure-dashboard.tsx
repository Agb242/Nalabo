import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Trophy, Activity } from "lucide-react";

interface UserDashboardData {
  stats: {
    workshopsCreated: number;
    workshopsCompleted: number;
    workshopsInProgress: number;
    challengesCreated: number;
    totalTimeSpent: number;
  };
  workshops: any[];
  recentSessions: any[];
  challenges: any[];
}

export default function SecureDashboard() {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery<UserDashboardData>({
    queryKey: ['/api/users', user?.id, 'dashboard'],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tableau de bord personnel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bienvenue {user?.firstName} {user?.lastName} - Vos données sécurisées
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ateliers créés</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.workshopsCreated || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ateliers terminés</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.workshopsCompleted || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.workshopsInProgress || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps total</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor((stats?.totalTimeSpent || 0) / 60)}h</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mes Ateliers</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.workshops?.length ? (
                <div className="space-y-4">
                  {dashboardData.workshops.slice(0, 5).map((workshop) => (
                    <div key={workshop.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{workshop.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{workshop.category}</p>
                      </div>
                      <Badge variant={workshop.status === 'published' ? 'default' : 'secondary'}>
                        {workshop.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucun atelier créé</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sessions récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentSessions?.length ? (
                <div className="space-y-4">
                  {dashboardData.recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">Session #{session.id}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(session.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucune session récente</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}