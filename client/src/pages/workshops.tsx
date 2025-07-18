import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkshopBuilder } from "@/components/workshop/workshop-builder";
import { WorkshopSession } from "@/components/workshop/workshop-session";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Play, Clock, Users } from "lucide-react";
import type { Workshop } from "@shared/schema";

export default function Workshops() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const { data: workshops, isLoading } = useQuery<Workshop[]>({
    queryKey: ["/api/workshops"],
  });

  const handleSaveWorkshop = (workshop: any) => {
    console.log("Saving workshop:", workshop);
    setShowBuilder(false);
  };

  const handlePreviewWorkshop = (workshop: any) => {
    console.log("Previewing workshop:", workshop);
  };

  const handleStartWorkshop = (workshopId: string) => {
    // Rediriger vers la page workshop-master
    window.location.href = `/workshop/${workshopId}`;
  };

  const handleSessionEnd = () => {
    setActiveSessionId(null);
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "docker":
        return "bg-blue-500";
      case "kubernetes":
        return "bg-purple-500";
      case "ai-ml":
        return "bg-emerald-500";
      case "devops":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  if (showBuilder) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowBuilder(false)}
              className="mb-4"
            >
              ← Retour aux ateliers
            </Button>
          </div>
          <WorkshopBuilder
            onSave={handleSaveWorkshop}
            onPreview={handlePreviewWorkshop}
          />
        </div>
      </div>
    );
  }

  if (activeSessionId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-800 p-4">
        <WorkshopSession 
          sessionId={activeSessionId} 
          onSessionEnd={handleSessionEnd}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-800 dark:text-orange-500">
              Ateliers Techniques
            </h1>
            <p className="text-slate-600 dark:text-gray-300 mt-2">
              Créez et participez à des workshops interactifs
            </p>
          </div>
          <Button
            onClick={() => setShowBuilder(true)}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un atelier
          </Button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops?.map((workshop) => (
              <Card key={workshop.id} className="hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${getCategoryColor(workshop.category)} text-white`}>
                      {workshop.category}
                    </Badge>
                    <Badge className={`${getDifficultyColor(workshop.difficulty)} text-white`}>
                      {workshop.difficulty}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-blue-800 dark:text-white">
                    {workshop.title}
                  </h3>
                  <p className="text-slate-600 dark:text-gray-300 mb-4 text-sm">
                    {workshop.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4 text-sm text-slate-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {workshop.estimatedDuration || 60} min
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {Math.floor(Math.random() * 100) + 10} participants
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-orange-500 text-white hover:bg-orange-600"
                    onClick={() => handleStartWorkshop(workshop.id.toString())}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Ouvrir l'Atelier
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            {(!workshops || workshops.length === 0) && (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-600 dark:text-gray-300 text-lg">
                  Aucun atelier disponible pour le moment.
                </p>
                <Button
                  onClick={() => setShowBuilder(true)}
                  className="mt-4 bg-orange-500 text-white hover:bg-orange-600"
                >
                  Créer le premier atelier
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
