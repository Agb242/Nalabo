import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { LaptopIcon, Users, Tag } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-orange-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              L'alternative française à <span className="text-slate-100">Educates.dev</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Plateforme cloud-native pour workshops tech immersifs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/workshops">
                <Button size="lg" className="bg-white text-blue-800 hover:bg-gray-100 font-bold">
                  Commencer un atelier
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-800 font-bold"
              >
                Découvrir la plateforme
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-800 dark:text-orange-500">
            Une plateforme complète pour l'apprentissage tech
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="text-center p-6 bg-slate-50 dark:bg-gray-800 hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LaptopIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-blue-800 dark:text-white">
                  Environnements Containerisés
                </h3>
                <p className="text-slate-600 dark:text-gray-300">
                  Environnements Docker prêts à l'emploi pour Kubernetes, AI/ML, DevOps, et plus encore
                </p>
              </CardContent>
            </Card>
            
            {/* Feature 2 */}
            <Card className="text-center p-6 bg-slate-50 dark:bg-gray-800 hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-blue-800 dark:text-white">
                  Communauté Active
                </h3>
                <p className="text-slate-600 dark:text-gray-300">
                  Marketplace de workshops, défis techniques, et espaces communautaires privés
                </p>
              </CardContent>
            </Card>
            
            {/* Feature 3 */}
            <Card className="text-center p-6 bg-slate-50 dark:bg-gray-800 hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-blue-800 dark:text-white">
                  Certifications
                </h3>
                <p className="text-slate-600 dark:text-gray-300">
                  Système complet d'évaluation et de certification avec badges numériques
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
