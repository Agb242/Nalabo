import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  X, 
  Upload, 
  FileText, 
  Download,
  Settings,
  Play,
  Pause,
  Save,
  Eye,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// Schéma de validation pour les étapes d'atelier
const WorkshopStepSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Titre requis"),
  description: z.string().min(1, "Description requise"),
  content: z.string().min(1, "Contenu requis"),
  tools: z.array(z.object({
    name: z.string(),
    version: z.string().optional(),
    config: z.record(z.any()).optional(),
  })).default([]),
  documents: z.array(z.object({
    id: z.number(),
    fileName: z.string(),
    description: z.string(),
    type: z.enum(['pdf', 'md', 'txt']),
  })).default([]),
  validation: z.object({
    commands: z.array(z.string()).optional(),
    expectedOutput: z.string().optional(),
  }).optional(),
  estimatedDuration: z.number().optional(),
});

const WorkshopFormSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  description: z.string().min(10, "Description trop courte"),
  category: z.string().min(1, "Catégorie requise"),
  difficulty: z.string().min(1, "Difficulté requise"),
  estimatedDuration: z.number().min(5, "Durée minimale: 5 minutes"),
  kubernetesTools: z.array(z.object({
    name: z.string(),
    version: z.string().optional(),
    config: z.record(z.any()).optional(),
  })).default([]),
  requiredResources: z.object({
    cpu: z.string().default('500m'),
    memory: z.string().default('1Gi'),
    storage: z.string().default('2Gi'),
  }),
  isolationLevel: z.string().default('standard'),
  steps: z.array(WorkshopStepSchema).min(1, "Au moins une étape requise"),
});

type WorkshopFormData = z.infer<typeof WorkshopFormSchema>;

const KUBERNETES_TOOLS = [
  { name: 'kubectl', description: 'Interface en ligne de commande Kubernetes' },
  { name: 'helm', description: 'Gestionnaire de packages Kubernetes' },
  { name: 'kustomize', description: 'Outil de personnalisation de configurations' },
  { name: 'istioctl', description: 'Interface Istio service mesh' },
  { name: 'argocd', description: 'Interface ArgoCD GitOps' },
  { name: 'flux', description: 'Interface Flux GitOps' },
];

const CATEGORIES = [
  'kubernetes', 'docker', 'ai-ml', 'devops', 'cloud-aws', 
  'cloud-gcp', 'cloud-azure', 'cybersecurity', 'data-science'
];

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function WorkshopBuilderEnhanced() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<WorkshopFormData>({
    resolver: zodResolver(WorkshopFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      difficulty: '',
      estimatedDuration: 30,
      kubernetesTools: [],
      requiredResources: {
        cpu: '500m',
        memory: '1Gi',
        storage: '2Gi',
      },
      isolationLevel: 'standard',
      steps: [{
        id: '1',
        title: '',
        description: '',
        content: '',
        tools: [],
        documents: [],
        estimatedDuration: 10,
      }],
    },
  });

  const createWorkshopMutation = useMutation({
    mutationFn: (data: WorkshopFormData) => 
      apiRequest('POST', '/api/workshops', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workshops'] });
      toast({
        title: "Atelier créé",
        description: "L'atelier a été créé avec succès.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'atelier",
        variant: "destructive",
      });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: ({ workshopId, file, stepIndex, description }: {
      workshopId: number;
      file: File;
      stepIndex?: number;
      description: string;
    }) => {
      const formData = new FormData();
      formData.append('document', file);
      if (stepIndex !== undefined) formData.append('stepIndex', stepIndex.toString());
      formData.append('description', description);
      
      return apiRequest('POST', `/api/workshops/${workshopId}/documents`, formData);
    },
    onSuccess: () => {
      toast({
        title: "Document téléchargé",
        description: "Le document a été ajouté à l'atelier.",
      });
    },
  });

  const onSubmit = (data: WorkshopFormData) => {
    createWorkshopMutation.mutate(data);
  };

  const addStep = () => {
    const steps = form.getValues('steps');
    const newStep = {
      id: (steps.length + 1).toString(),
      title: '',
      description: '',
      content: '',
      tools: [],
      documents: [],
      estimatedDuration: 10,
    };
    form.setValue('steps', [...steps, newStep]);
    setCurrentStepIndex(steps.length);
  };

  const removeStep = (index: number) => {
    const steps = form.getValues('steps');
    if (steps.length > 1) {
      form.setValue('steps', steps.filter((_, i) => i !== index));
      if (currentStepIndex >= steps.length - 1) {
        setCurrentStepIndex(Math.max(0, currentStepIndex - 1));
      }
    }
  };

  const addKubernetesTool = (toolName: string) => {
    const currentTools = form.getValues('kubernetesTools');
    if (!currentTools.find(t => t.name === toolName)) {
      form.setValue('kubernetesTools', [...currentTools, { name: toolName }]);
    }
  };

  const removeKubernetesTool = (toolName: string) => {
    const currentTools = form.getValues('kubernetesTools');
    form.setValue('kubernetesTools', currentTools.filter(t => t.name !== toolName));
  };

  const addStepTool = (stepIndex: number, toolName: string) => {
    const steps = form.getValues('steps');
    const updatedSteps = [...steps];
    if (!updatedSteps[stepIndex].tools.find(t => t.name === toolName)) {
      updatedSteps[stepIndex].tools.push({ name: toolName });
      form.setValue('steps', updatedSteps);
    }
  };

  const removeStepTool = (stepIndex: number, toolName: string) => {
    const steps = form.getValues('steps');
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].tools = updatedSteps[stepIndex].tools.filter(t => t.name !== toolName);
    form.setValue('steps', updatedSteps);
  };

  const handleFileUpload = (stepIndex: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const steps = form.getValues('steps');
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < steps.length) {
      const newSteps = [...steps];
      [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
      form.setValue('steps', newSteps);
      setCurrentStepIndex(newIndex);
    }
  };

  const steps = form.watch('steps');
  const currentStep = steps[currentStepIndex];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créateur d'Atelier Avancé</h1>
          <p className="text-muted-foreground">
            Créez des ateliers Kubernetes avec outils intégrés et documents
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? 'Édition' : 'Aperçu'}
          </Button>
          <Button form="workshop-form" type="submit" disabled={createWorkshopMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {createWorkshopMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form id="workshop-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration générale */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations Générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre de l'atelier</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Introduction à Kubernetes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} placeholder="Description de l'atelier..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégorie</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulté</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DIFFICULTIES.map((difficulty) => (
                                <SelectItem key={difficulty} value={difficulty}>
                                  {difficulty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="estimatedDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée estimée (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Outils Kubernetes */}
              <Card>
                <CardHeader>
                  <CardTitle>Outils Kubernetes</CardTitle>
                  <CardDescription>
                    Sélectionnez les outils disponibles dans l'environnement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {KUBERNETES_TOOLS.map((tool) => {
                      const isSelected = form.watch('kubernetesTools').some(t => t.name === tool.name);
                      return (
                        <div
                          key={tool.name}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'border-primary bg-primary/5' : 'border-muted'
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              removeKubernetesTool(tool.name);
                            } else {
                              addKubernetesTool(tool.name);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{tool.name}</div>
                              <div className="text-sm text-muted-foreground">{tool.description}</div>
                            </div>
                            {isSelected && <Badge>Sélectionné</Badge>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Ressources requises */}
              <Card>
                <CardHeader>
                  <CardTitle>Ressources vCluster</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="requiredResources.cpu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPU</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="500m" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requiredResources.memory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mémoire</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1Gi" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requiredResources.storage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stockage</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="2Gi" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Éditeur d'étapes */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Étapes de l'Atelier</CardTitle>
                      <CardDescription>
                        Configurez les étapes avec outils et documents
                      </CardDescription>
                    </div>
                    <Button onClick={addStep} variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter Étape
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Navigation des étapes */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {steps.map((step, index) => (
                      <Button
                        key={step.id}
                        variant={index === currentStepIndex ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentStepIndex(index)}
                        className="whitespace-nowrap"
                      >
                        Étape {index + 1}
                        {step.title && `: ${step.title.substring(0, 20)}${step.title.length > 20 ? '...' : ''}`}
                      </Button>
                    ))}
                  </div>

                  {/* Éditeur d'étape actuelle */}
                  {currentStep && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Étape {currentStepIndex + 1}</h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveStep(currentStepIndex, 'up')}
                            disabled={currentStepIndex === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveStep(currentStepIndex, 'down')}
                            disabled={currentStepIndex === steps.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeStep(currentStepIndex)}
                            disabled={steps.length <= 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name={`steps.${currentStepIndex}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titre de l'étape</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Créer un Pod" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`steps.${currentStepIndex}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} placeholder="Description de l'étape..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`steps.${currentStepIndex}.content`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contenu (Markdown)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                rows={8} 
                                placeholder="Rédigez les instructions en Markdown..."
                                className="font-mono"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Outils spécifiques à l'étape */}
                      <div>
                        <FormLabel>Outils pour cette étape</FormLabel>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {form.watch('kubernetesTools').map((tool) => {
                            const isUsedInStep = currentStep.tools.some(t => t.name === tool.name);
                            return (
                              <Badge
                                key={tool.name}
                                variant={isUsedInStep ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                  if (isUsedInStep) {
                                    removeStepTool(currentStepIndex, tool.name);
                                  } else {
                                    addStepTool(currentStepIndex, tool.name);
                                  }
                                }}
                              >
                                {tool.name}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>

                      {/* Documents de l'étape */}
                      <div>
                        <div className="flex items-center justify-between">
                          <FormLabel>Documents de référence</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileUpload(currentStepIndex)}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Ajouter Document
                          </Button>
                        </div>
                        <div className="mt-2 space-y-2">
                          {currentStep.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">{doc.fileName}</span>
                                <Badge variant="outline">{doc.type}</Badge>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name={`steps.${currentStepIndex}.estimatedDuration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durée estimée (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>

      {/* Input caché pour l'upload de fichiers */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.md,.txt,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            // Logic for handling file upload would go here
            console.log('File selected:', file);
          }
        }}
      />
    </div>
  );
}