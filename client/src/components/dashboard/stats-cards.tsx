import { Card, CardContent } from "@/components/ui/card";
import { LaptopIcon, Users, Tag, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats: {
    activeWorkshops: number;
    totalUsers: number;
    certificationsIssued: number;
    successRate: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Ateliers Actifs",
      value: stats.activeWorkshops,
      icon: LaptopIcon,
      color: "bg-orange-500",
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-800",
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Certifications",
      value: stats.certificationsIssued,
      icon: Tag,
      color: "bg-emerald-500",
      change: "+23%",
      changeType: "positive" as const,
    },
    {
      title: "Taux Réussite",
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: "bg-yellow-500",
      change: "+3%",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-12">
      {cards.map((card, index) => (
        <Card key={index} className="bg-slate-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-gray-300 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-white">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-emerald-500 text-sm">↑ {card.change}</span>
              <span className="text-slate-600 dark:text-gray-300 text-sm ml-2">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
