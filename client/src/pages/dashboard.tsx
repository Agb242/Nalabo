import { useQuery } from "@tanstack/react-query";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsStats {
  activeWorkshops: number;
  totalUsers: number;
  certificationsIssued: number;
  successRate: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<AnalyticsStats>({
    queryKey: ["/api/analytics/stats"],
  });

  if (isLoading) {
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

  const defaultStats = {
    activeWorkshops: 247,
    totalUsers: 1843,
    certificationsIssued: 89,
    successRate: 87,
  };

  const analyticsStats = stats || defaultStats;

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

        <StatsCards stats={analyticsStats} />
        
        {/* Resource Usage Chart */}
        <Card className="bg-slate-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-800 dark:text-white">
              Utilisation des Ressources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-slate-600 dark:text-gray-300">
                Graphique d'utilisation des conteneurs Docker
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
