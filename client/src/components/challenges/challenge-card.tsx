import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Shield, Brain, Users, Clock } from "lucide-react";
import type { Challenge } from "@shared/schema";

interface ChallengeCardProps {
  challenge: Challenge & {
    participantCount?: number;
    timeRemaining?: string;
  };
  onParticipate: (challengeId: number) => void;
}

export function ChallengeCard({ challenge, onParticipate }: ChallengeCardProps) {
  const getIconAndColor = (category: string) => {
    switch (category) {
      case "docker":
        return { icon: Code, color: "bg-orange-500" };
      case "security":
        return { icon: Shield, color: "bg-blue-800" };
      case "ai-ml":
        return { icon: Brain, color: "bg-emerald-500" };
      default:
        return { icon: Code, color: "bg-orange-500" };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-yellow-500";
      case "advanced":
        return "bg-orange-500";
      case "expert":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const { icon: Icon, color } = getIconAndColor(challenge.category);

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-blue-800 dark:text-white">{challenge.title}</h4>
              <p className="text-sm text-slate-600 dark:text-gray-300">{challenge.description}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-emerald-500 font-bold">{challenge.points} pts</span>
            <p className="text-xs text-slate-600 dark:text-gray-300">
              {challenge.timeRemaining || "Terminé"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600 dark:text-gray-300">
              <Users className="h-4 w-4 inline mr-1" />
              {challenge.participantCount || 0} participants
            </span>
            <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
              <Clock className="h-3 w-3 mr-1" />
              {challenge.difficulty}
            </Badge>
          </div>
          <Button
            onClick={() => onParticipate(challenge.id)}
            className={`${color} text-white hover:opacity-90`}
          >
            Participer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
