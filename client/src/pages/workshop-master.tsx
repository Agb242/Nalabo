import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
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
  Loader2,
  Settings,
  MonitorSpeaker,
  FileCode,
  Server,
  Container,
  Network,
  Shield,
  Database,
  CloudCog
} from "lucide-react";

interface WorkshopMasterProps {
  workshopId: string;
}

interface WorkshopData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  steps: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    validationCriteria?: any;
    tools?: string[];
  }>;
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
  };
  environment: {
    status: string;
    kubernetesCluster?: {
      nodes: any[];
      pods: any[];
      services: any[];
      namespaces: any[];
    };
    endpoints: {
      api: string;
      dashboard?: string;
      ingress?: string;
    };
    resources: {
      cpu: string;
      memory: string;
      storage: string;
    };
  };
}

export default function WorkshopMaster() {
  const [match, params] = useRoute("/workshop/:workshopId");
  const workshopId = params?.workshopId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState("instructions");
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Récupérer les données de l'atelier
  const { data: workshop, isLoading: isLoadingWorkshop } = useQuery<WorkshopData>({
    queryKey: [`/api/workshops/${workshopId}`],
    enabled: !!workshopId,
  });

  // Récupérer le statut de la session
  const { data: sessionStatus, isLoading: isLoadingSession } = useQuery<SessionStatus>({
    queryKey: [`/api/workshops/sessions/${sessionId}`],
    enabled: !!sessionId,
    refetchInterval: 5000,
  });

  // Démarrer une session d'atelier
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/workshops/sessions", {
        workshopId,
        infrastructureType: "kubernetes",
        duration: 240,
        resources: {
          cpu: "2000m",
          memory: "4Gi",
          storage: "20Gi",
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.session.id);
      setLogs([`[${new Date().toLocaleTimeString()}] Session Kubernetes démarrée: ${data.session.id}`]);
      toast({
        title: "Session démarrée",
        description: "Votre environnement Kubernetes est en cours de préparation...",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de démarrer la session",
        variant: "destructive",
      });
    },
  });

  // Exécuter des commandes Kubernetes
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

  // Valider une étape
  const validateStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      const response = await apiRequest("POST", `/api/workshops/sessions/${sessionId}/validate/${stepId}`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.validation.valid ? "Étape validée !" : "Validation échouée",
        description: data.validation.feedback,
        variant: data.validation.valid ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/sessions/${sessionId}`] });
    },
  });

  // Auto-scroll des logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleExecuteCommand = () => {
    if (!command.trim() || isExecuting) return;
    setIsExecuting(true);
    executeCommandMutation.mutate({ command });
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case "instruction": return <FileText className="h-4 w-4" />;
      case "code": return <Code className="h-4 w-4" />;
      case "terminal": return <Terminal className="h-4 w-4" />;
      case "validation": return <CheckCircle className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getEnvironmentStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "starting": return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const currentStep = workshop?.steps[sessionStatus?.session.currentStep || 0];
  const progressPercentage = sessionStatus ? (sessionStatus.session.currentStep / workshop?.steps.length! * 100) : 0;

  if (isLoadingWorkshop) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Atelier introuvable</h2>
              <p className="text-gray-600">L'atelier demandé n'existe pas ou n'est plus disponible.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* En-tête */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{workshop.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{workshop.category}</Badge>
              <Badge variant="outline">{workshop.difficulty}</Badge>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {workshop.estimatedDuration} min
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!sessionId ? (
              <Button 
                onClick={() => startSessionMutation.mutate()}
                disabled={startSessionMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {startSessionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Démarrer l'Atelier
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {getEnvironmentStatusIcon(sessionStatus?.environment.status || "starting")}
                <span className="text-sm">
                  Kubernetes: {sessionStatus?.environment.status || "En préparation"}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {sessionStatus && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progression: {sessionStatus.session.currentStep + 1} / {workshop.steps.length}</span>
              <span>Score: {sessionStatus.session.totalScore} points</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Panel des instructions et outils */}
          <Panel defaultSize={40} minSize={30}>
            <div className="h-full p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  <TabsTrigger value="tools">Outils</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                </TabsList>
                
                <TabsContent value="instructions" className="flex-1 overflow-hidden">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {currentStep && getStepIcon(currentStep.type)}
                        {currentStep?.title || "Étape actuelle"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-full">
                        <div className="prose prose-sm max-w-none">
                          {currentStep?.content || "Démarrez votre session pour voir les instructions."}
                        </div>
                        {currentStep && sessionId && (
                          <div className="mt-4">
                            <Button 
                              onClick={() => validateStepMutation.mutate(currentStep.id)}
                              disabled={validateStepMutation.isPending}
                            >
                              {validateStepMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Valider l'Étape
                            </Button>
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="tools" className="flex-1 overflow-hidden">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Outils Kubernetes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCommand("kubectl get pods")}>
                          <Container className="h-4 w-4 mr-2" />
                          Pods
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCommand("kubectl get services")}>
                          <Network className="h-4 w-4 mr-2" />
                          Services
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCommand("kubectl get deployments")}>
                          <Server className="h-4 w-4 mr-2" />
                          Deployments
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCommand("kubectl get ingress")}>
                          <CloudCog className="h-4 w-4 mr-2" />
                          Ingress
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCommand("kubectl get nodes")}>
                          <MonitorSpeaker className="h-4 w-4 mr-2" />
                          Nodes
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCommand("kubectl get secrets")}>
                          <Shield className="h-4 w-4 mr-2" />
                          Secrets
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCommand("kubectl get configmaps")}>
                          <FileCode className="h-4 w-4 mr-2" />
                          ConfigMaps
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCommand("kubectl get pv,pvc")}>
                          <Database className="h-4 w-4 mr-2" />
                          Storage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="resources" className="flex-1 overflow-hidden">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Ressources Allouées</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {sessionStatus && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">CPU</label>
                            <div className="text-2xl font-bold text-orange-500">
                              {sessionStatus.environment.resources.cpu}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Mémoire</label>
                            <div className="text-2xl font-bold text-blue-500">
                              {sessionStatus.environment.resources.memory}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Stockage</label>
                            <div className="text-2xl font-bold text-green-500">
                              {sessionStatus.environment.resources.storage}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="monitoring" className="flex-1 overflow-hidden">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>État du Cluster</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {sessionStatus?.environment.kubernetesCluster && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-500">
                                {sessionStatus.environment.kubernetesCluster.pods.length}
                              </div>
                              <div className="text-sm text-gray-600">Pods</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-500">
                                {sessionStatus.environment.kubernetesCluster.services.length}
                              </div>
                              <div className="text-sm text-gray-600">Services</div>
                            </div>
                          </div>
                          {sessionStatus.environment.endpoints.dashboard && (
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => window.open(sessionStatus.environment.endpoints.dashboard, '_blank')}
                            >
                              Ouvrir Dashboard Kubernetes
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </Panel>
          
          <PanelResizeHandle />
          
          {/* Panel terminal */}
          <Panel defaultSize={60} minSize={40}>
            <div className="h-full p-4">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Terminal Kubernetes
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 bg-black text-green-400 p-4 rounded font-mono text-sm">
                    <div className="space-y-1">
                      {logs.map((log, index) => (
                        <div key={index} className="whitespace-pre-wrap">
                          {log}
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  </ScrollArea>
                  
                  <div className="mt-4 flex gap-2">
                    <Textarea
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      placeholder="kubectl get pods..."
                      className="font-mono"
                      disabled={!sessionId || isExecuting}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleExecuteCommand();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleExecuteCommand}
                      disabled={!sessionId || !command.trim() || isExecuting}
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
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}