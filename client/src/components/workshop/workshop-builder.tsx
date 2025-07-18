import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye,
  Code,
  FileText,
  Terminal,
  HelpCircle,
  GripVertical
} from "lucide-react";

interface WorkshopStep {
  id: string;
  type: "instruction" | "code" | "terminal" | "quiz";
  title: string;
  content: string;
  expected_output?: string;
  hint?: string;
}

interface WorkshopBuilderProps {
  onSave?: (workshop: any) => void;
  onPreview?: (workshop: any) => void;
  initialWorkshop?: any;
}

export function WorkshopBuilder({ onSave, onPreview, initialWorkshop }: WorkshopBuilderProps) {
  const { toast } = useToast();
  const [workshop, setWorkshop] = useState({
    title: initialWorkshop?.title || "",
    description: initialWorkshop?.description || "",
    category: initialWorkshop?.category || "",
    difficulty: initialWorkshop?.difficulty || "beginner",
    duration: initialWorkshop?.duration || 60,
    tags: initialWorkshop?.tags || [],
    steps: initialWorkshop?.steps || [] as WorkshopStep[]
  });

  const [newTag, setNewTag] = useState("");

  const saveWorkshopMutation = useMutation({
    mutationFn: async (workshopData: any) => {
      const response = await fetch('/api/workshops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...workshopData,
          template: workshopData.template,
          validateTemplate: true,
          useOrchestrator: true
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save workshop");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Atelier sauvegardé",
        description: "L'atelier a été sauvegardé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workshops"] });
      onSave?.(data);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const addStep = () => {
    const newStep: WorkshopStep = {
      id: Date.now().toString(),
      type: "instruction",
      title: "",
      content: "",
    };
    setWorkshop(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (stepId: string, field: string, value: string) => {
    setWorkshop(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, [field]: value } : step
      )
    }));
  };

  const removeStep = (stepId: string) => {
    setWorkshop(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !workshop.tags.includes(newTag.trim())) {
      setWorkshop(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setWorkshop(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = () => {
    if (!workshop.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre de l'atelier est requis",
        variant: "destructive",
      });
      return;
    }

    saveWorkshopMutation.mutate(workshop);
  };

  const handlePreview = () => {
    console.log("Previewing workshop:", workshop);
    onPreview?.(workshop);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case "instruction": return <FileText className="h-4 w-4" />;
      case "code": return <Code className="h-4 w-4" />;
      case "terminal": return <Terminal className="h-4 w-4" />;
      case "quiz": return <HelpCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Créateur d'Atelier</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Aperçu
          </Button>
          <Button onClick={handleSave} disabled={saveWorkshopMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveWorkshopMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {/* Workshop Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'atelier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={workshop.title}
                onChange={(e) => setWorkshop(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de l'atelier"
              />
            </div>
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select value={workshop.category} onValueChange={(value) => setWorkshop(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docker">Docker</SelectItem>
                  <SelectItem value="kubernetes">Kubernetes</SelectItem>
                  <SelectItem value="ai-ml">IA/ML</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="security">Sécurité</SelectItem>
                  <SelectItem value="data-science">Data Science</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulté</Label>
              <Select value={workshop.difficulty} onValueChange={(value) => setWorkshop(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Durée (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={workshop.duration}
                onChange={(e) => setWorkshop(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                placeholder="60"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={workshop.description}
              onChange={(e) => setWorkshop(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de l'atelier"
              rows={3}
            />
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {workshop.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Ajouter un tag"
              />
              <Button type="button" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workshop Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Étapes de l'atelier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workshop.steps.map((step, index) => (
              <Card key={step.id} className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Étape {index + 1}</span>
                      {getStepIcon(step.type)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={step.type} onValueChange={(value) => updateStep(step.id, "type", value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instruction">Instruction</SelectItem>
                          <SelectItem value="code">Code</SelectItem>
                          <SelectItem value="terminal">Terminal</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(step.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Titre</Label>
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(step.id, "title", e.target.value)}
                      placeholder="Titre de l'étape"
                    />
                  </div>
                  <div>
                    <Label>Contenu</Label>
                    <Textarea
                      value={step.content}
                      onChange={(e) => updateStep(step.id, "content", e.target.value)}
                      placeholder={
                        step.type === "code" ? "Code à exécuter..." :
                        step.type === "terminal" ? "Commandes terminal..." :
                        step.type === "quiz" ? "Question du quiz..." :
                        "Instructions pour l'utilisateur..."
                      }
                      rows={4}
                    />
                  </div>
                  {(step.type === "code" || step.type === "terminal") && (
                    <div>
                      <Label>Sortie attendue (optionnel)</Label>
                      <Textarea
                        value={step.expected_output || ""}
                        onChange={(e) => updateStep(step.id, "expected_output", e.target.value)}
                        placeholder="Sortie attendue..."
                        rows={2}
                      />
                    </div>
                  )}
                  <div>
                    <Label>Conseil (optionnel)</Label>
                    <Input
                      value={step.hint || ""}
                      onChange={(e) => updateStep(step.id, "hint", e.target.value)}
                      placeholder="Conseil pour aider l'utilisateur..."
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              onClick={addStep}
              className="w-full border-dashed border-2 hover:border-orange-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une étape
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}