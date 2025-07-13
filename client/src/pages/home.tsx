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
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-xl shadow-2xl backdrop-blur-sm">
                <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-8-5zM12 4.44L18.18 7 12 10.56 5.82 7 12 4.44zM4 8.18l7 4.08v8.34c-3.94-.64-7-4.19-7-8.6v-3.82zm16 7.82c0 4.41-3.06 7.96-7 8.6v-8.34l7-4.08v3.82z"/>
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Nalabo</span>
              <br />
              <span className="text-3xl md:text-4xl text-blue-100">Plateforme Cloud-Native de Workshops Tech</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto">
              Nalabo révolutionne l'apprentissage technologique avec des ateliers interactifs, 
              des environnements containerisés et une approche "hands-on" immersive en français.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/workshops">
                <Button size="lg" className="bg-white text-blue-800 hover:bg-gray-100 font-bold px-8 py-3">
                  Commencer un atelier
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-800 font-bold px-8 py-3"
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
