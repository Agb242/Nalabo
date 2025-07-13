import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  title?: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  currentUserPoints?: number;
}

export function Leaderboard({ entries, currentUserRank, currentUserPoints }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />;
      default:
        return (
          <span className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold">
            {rank}
          </span>
        );
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500";
      case 2:
        return "bg-gray-400";
      case 3:
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-blue-800 dark:text-white">
          Classement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.rank} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {entry.rank <= 3 ? (
                  <div className="flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                ) : (
                  <span className={`w-8 h-8 ${getRankColor(entry.rank)} text-white rounded-full flex items-center justify-center font-bold`}>
                    {entry.rank}
                  </span>
                )}
                <div>
                  <p className="font-semibold text-blue-800 dark:text-white">{entry.username}</p>
                  {entry.title && (
                    <p className="text-xs text-slate-600 dark:text-gray-300">{entry.title}</p>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="text-emerald-500 font-bold">
                {entry.points} pts
              </Badge>
            </div>
          ))}
          
          {currentUserRank && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-gray-300">
                    Votre position: <span className="font-semibold">#{currentUserRank}</span>
                  </span>
                  <Badge variant="secondary" className="text-emerald-500 font-bold">
                    {currentUserPoints} pts
                  </Badge>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
