import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Square, 
  Terminal, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award,
  FileText,
  Code,
  HelpCircle,
  Loader2
} from "lucide-react";

interface WorkshopSessionProps {
  sessionId: string;
  onSessionEnd?: () => void;
}

interface SessionStatus {
  session: {
    id: string;
    status: string;
    currentStep: number;
    totalScore: number;
    progress: Array<{
      stepId: string;
      completed: boolean;
      score?: number;
      attempts: number;
      completedAt?: string;
    }>;
    startedAt: string;
    expiresAt: string;
    completedAt?: string;
  };
  environment: {
    status: string;
    pods?: any;
    services?: any;
    endpoints: {
      api: string;
      ingress?: string;
    };
    resources: {
      cpu: string;
      memory: string;
      storage: string;
    };
  };
}

export function WorkshopSession({ sessionId, onSessionEnd }: WorkshopSessionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Récupérer le statut de la session
  const { data: sessionStatus, isLoading } = useQuery<SessionStatus>({
    queryKey: [`/api/workshops/sessions/${sessionId}`],
    refetchInterval: 5000, // Actualiser toutes les 5 secondes
  });

  // Mutation pour exécuter des commandes
  const executeCommandMutation = useMutation({
    mutationFn: async ({ command, timeout }: { command: string; timeout?: number }) => {
      const response = await apiRequest("POST", `/api/workshops/sessions/${sessionId}/execute`, {
        command,
        timeout,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [
        ...prev,
        `[${timestamp}] $ ${command}`,
        data.result.output,
        `Exit code: ${data.result.exitCode}`,
        "---"
      ]);
      setCommand("");
    },
    onError: (error) => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [
        ...prev,
        `[${timestamp}] $ ${command}`,
        `Error: ${error instanceof Error ? error.message : 'Command failed'}`,
        "---"
      ]);
      toast({
        title: "Erreur d'exécution",
        description: error instanceof Error ? error.message : "La commande a échoué",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsExecuting(false);
    },
  });

  // Mutation pour valider une étape
  const validateStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      const response = await apiRequest("POST", `/api/workshops/sessions/${sessionId}/validate/${stepId}`);
      return response.json();
    },
    onSuccess: (data, stepId) => {
      toast({
        title: data.validation.valid ? "Étape validée !" : "Validation échouée",
        description: data.validation.feedback,
        variant: data.validation.valid ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/sessions/${sessionId}`] });
    },
    onError: (error) => {
      toast({
        title: "Erreur de validation",
        description: error instanceof Error ? error.message : "La validation a échoué",
        variant: "destructive",
      });
    },
  });

  // Mutation pour terminer la session
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/workshops/sessions/${sessionId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Session terminée",
        description: "L'atelier a été terminé avec succès",
      });
      onSessionEnd?.();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de terminer la session",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll des logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleExecuteCommand = () => {
    if (!command.trim() || isExecuting) return;
    
    setIsExecuting(true);
    executeCommandMutation.mutate({ command: command.trim() });
  };

  const handleValidateStep = (stepId: string) => {
    validateStepMutation.mutate(stepId);
  };

  const handleEndSession = () => {
    endSessionMutation.mutate();
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case "instruction": return <FileText className="h-4 w-4" />;
      case "command": return <Terminal className="h-4 w-4" />;
      case "validation": return <CheckCircle className="h-4 w-4" />;
      case "quiz": return <HelpCircle className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "starting": return "bg-yellow-500";
      case "completed": return "bg-blue-500";
      case "failed": return "bg-red-500";
      case "expired": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return "Expiré";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m restantes`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement de la session...</span>
      </div>
    );
  }

  if (!sessionStatus) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Session non trouvée</p>
      </div>
    );
  }

  const { session, environment } = sessionStatus;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen max-h-screen">
      {/* Panneau principal - Terminal et commandes */}
      <div className="lg:col-span-2 flex flex-col">
        {/* En-tête de session */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge className={`${getStatusColor(session.status)} text-white`}>
                  {session.status}
                </Badge>
                <div>
                  <CardTitle className="text-lg">Session {session.id}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Score: {session.totalScore} points
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTimeRemaining(session.expiresAt)}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndSession}
                  disabled={endSessionMutation.isPending}
                  className="mt-2"
                >
                  {endSessionMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Square className="h-4 w-4 mr-2" />
                  )}
                  Terminer
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Terminal */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Terminal className="h-5 w-5 mr-2" />
              Terminal Kubernetes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Zone de logs */}
            <ScrollArea className="flex-1 bg-black text-green-400 p-4 rounded font-mono text-sm mb-4">
              <div className="space-y-1">
                {logs.length === 0 ? (
                  <div className="text-gray-500">
                    Bienvenue dans votre environnement Kubernetes !<br />
                    Tapez vos commandes kubectl ci-dessous.
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap">
                      {log}
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </ScrollArea>

            {/* Zone de saisie de commande */}
            <div className="flex space-x-2">
              <Textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="kubectl get pods"
                className="flex-1 font-mono"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleExecuteCommand();
                  }
                }}
              />
              <Button
                onClick={handleExecuteCommand}
                disabled={!command.trim() || isExecuting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isExecuting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panneau latéral - Progrès et informations */}
      <div className="space-y-4">
        {/* Informations sur l'environnement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Environnement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Statut:</span>
              <Badge className={`${getStatusColor(environment.status)} text-white`}>
                {environment.status}
              </Badge>
            </div>
            <div className="text-sm">
              <div className="flex justify-between">
                <span>CPU:</span>
                <span>{environment.resources.cpu}</span>
              </div>
              <div className="flex justify-between">
                <span>Mémoire:</span>
                <span>{environment.resources.memory}</span>
              </div>
              <div className="flex justify-between">
                <span>Stockage:</span>
                <span>{environment.resources.storage}</span>
              </div>
            </div>
            {environment.endpoints.api && (
              <div className="text-xs text-gray-600 dark:text-gray-300">
                API: {environment.endpoints.api}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progrès des étapes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Progrès
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {session.progress.map((progress, index) => (
                <div key={progress.stepId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      progress.completed 
                        ? 'bg-green-500 text-white' 
                        : index === session.currentStep 
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      {progress.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : index === session.currentStep ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-sm">Étape {index + 1}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {progress.score && (
                      <Badge variant="secondary" className="text-xs">
                        {progress.score} pts
                      </Badge>
                    )}
                    {index === session.currentStep && !progress.completed && (
                      <Button
                        size="sm"
                        onClick={() => handleValidateStep(progress.stepId)}
                        disabled={validateStepMutation.isPending}
                        className="text-xs"
                      >
                        {validateStepMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Valider"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {session.totalScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Points totaux
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ressources Kubernetes */}
        {environment.pods && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Ressources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Pods:</span>
                    <span>{environment.pods.items?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Services:</span>
                    <span>{environment.services?.items?.length || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}