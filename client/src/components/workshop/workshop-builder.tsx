import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Play, Trash2, Bot } from "lucide-react";

interface WorkshopStep {
  id: string;
  type: "instruction" | "code" | "terminal" | "quiz";
  content: string;
}

interface WorkshopBuilderProps {
  onSave?: (workshop: any) => void;
  onPreview?: (workshop: any) => void;
}

export function WorkshopBuilder({ onSave, onPreview }: WorkshopBuilderProps) {
  const [steps, setSteps] = useState<WorkshopStep[]>([
    {
      id: "1",
      type: "instruction",
      content: "Introduction à Docker : comprendre les concepts de base des conteneurs"
    },
    {
      id: "2",
      type: "terminal",
      content: "docker run hello-world"
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState("docker-basics");

  const templates = [
    { id: "docker-basics", name: "Docker Basics", description: "Introduction aux conteneurs" },
    { id: "kubernetes-deploy", name: "Kubernetes Deploy", description: "Déploiement d'applications" },
    { id: "ai-ml-pipeline", name: "AI/ML Pipeline", description: "Pipeline machine learning" },
  ];

  const addStep = () => {
    const newStep: WorkshopStep = {
      id: (steps.length + 1).toString(),
      type: "instruction",
      content: ""
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const updateStep = (stepId: string, field: keyof WorkshopStep, value: string) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    ));
  };

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case "instruction":
        return "bg-blue-500";
      case "code":
        return "bg-green-500";
      case "terminal":
        return "bg-purple-500";
      case "quiz":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-bold text-blue-800 dark:text-white">
              Nouvel Atelier Docker
            </h3>
            <Badge className="bg-emerald-500 text-white">Brouillon</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => onSave && onSave({ steps })}
              className="text-slate-600 dark:text-gray-300 hover:text-orange-500"
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button
              onClick={() => onPreview && onPreview({ steps })}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              <Play className="h-4 w-4 mr-2" />
              Prévisualiser
            </Button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6 p-6">
        {/* Templates Panel */}
        <div className="lg:col-span-1">
          <h4 className="font-bold mb-4 text-blue-800 dark:text-white">
            Templates Disponibles
          </h4>
          <div className="space-y-3">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-colors ${
                  selectedTemplate === template.id
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-orange-500"
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardContent className="p-4">
                  <h5 className={`font-semibold ${
                    selectedTemplate === template.id ? "text-orange-500" : "text-blue-800 dark:text-white"
                  }`}>
                    {template.name}
                  </h5>
                  <p className="text-sm text-slate-600 dark:text-gray-300">
                    {template.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Editor Panel */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-blue-800 dark:text-white">
              Édition de l'Atelier
            </h4>
            <Button
              variant="outline"
              className="text-orange-500 hover:text-orange-600 border-orange-500"
            >
              <Bot className="h-4 w-4 mr-2" />
              Assistance IA
            </Button>
          </div>
          
          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card key={step.id} className="border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 ${getStepTypeColor(step.type)} text-white rounded-full flex items-center justify-center text-sm font-semibold`}>
                        {index + 1}
                      </span>
                      <Select
                        value={step.type}
                        onValueChange={(value) => updateStep(step.id, "type", value)}
                      >
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
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(step.id)}
                      className="text-slate-600 dark:text-gray-300 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={step.content}
                    onChange={(e) => updateStep(step.id, "content", e.target.value)}
                    className="w-full border-gray-300 dark:border-gray-600"
                    rows={3}
                    placeholder="Décrivez l'étape de votre atelier..."
                  />
                </CardContent>
              </Card>
            ))}
            
            {/* Add Step Button */}
            <Button
              onClick={addStep}
              variant="outline"
              className="w-full border-2 border-dashed border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 py-8"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une étape
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
