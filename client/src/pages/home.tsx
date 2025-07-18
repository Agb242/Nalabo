import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  LaptopIcon, 
  Users, 
  Shield, 
  Zap, 
  Globe, 
  Code2, 
  Container,
  Brain,
  GitBranch,
  Trophy,
  ArrowRight,
  CheckCircle,
  Play,
  Sparkles,
  Target,
  Cloud
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section - Design minimaliste */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl shadow-xl">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-8-5zM12 4.44L18.18 7 12 10.56 5.82 7 12 4.44zM4 8.18l7 4.08v8.34c-3.94-.64-7-4.19-7-8.6v-3.82zm16 7.82c0 4.41-3.06 7.96-7 8.6v-8.34l7-4.08v3.82z"/>
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="text-orange-500">NA</span><span className="text-white">labo</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              La plateforme cloud-native de workshops tech pour créer et partager<br />
              des <span className="text-blue-600 font-semibold">ateliers techniques interactifs</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/workshops">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <Play className="mr-2 h-5 w-5" />
                  Créer votre premier atelier
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 px-8 py-3 text-lg font-medium rounded-xl transition-all"
              >
                Voir la démo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Gratuit pour commencer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Interface en français</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Prêt en 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités principales - Design cards propre */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Des environnements isolés aux communautés privées, Nalabo simplifie l'apprentissage technique
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-900 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Container className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Environnements Prêts
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Docker, Kubernetes, Python, Node.js... Tous vos outils techniques dans des environnements isolés et sécurisés.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">Docker</Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">Kubernetes</Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">Python</Badge>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-900 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  IA Intégrée
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Assistance IA pour le code, validation automatique des exercices et création de contenu intelligent.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary" className="bg-orange-50 text-orange-700">Copilot</Badge>
                  <Badge variant="secondary" className="bg-orange-50 text-orange-700">Auto-validation</Badge>
                  <Badge variant="secondary" className="bg-orange-50 text-orange-700">Feedback</Badge>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-900 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Vos Propres Communautés
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Créez des espaces dédiés pour vos équipes avec gestion d'accès et suivi de progression personnalisé.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary" className="bg-green-50 text-green-700">Équipes</Badge>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">Permissions</Badge>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">Analytics</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Types d'ateliers - Cohérent avec les fonctionnalités */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ateliers pour tous les besoins
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              De l'apprentissage guidé aux défis techniques, créez l'expérience parfaite
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Mode Apprentissage</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Tutoriels guidés avec aide contextuelle
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Mode Défi</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Challenges chronométrés avec classement
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Mode Collaboratif</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ateliers en équipe temps réel
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Infrastructure Réelle</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                AWS, Azure, GCP connectés
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Intégrations Entreprise - Simplifié */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Intégrations Entreprise
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Connectez vos outils existants et environnements cloud
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GitBranch className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">DevOps & CI/CD</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      GitHub, GitLab, Jenkins intégrés directement dans vos ateliers
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Cloud className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Cloud Providers</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Connectez vos comptes AWS, Azure, GCP pour des ateliers réalistes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">SSO & Sécurité</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      SAML, OAuth2, Active Directory pour l'authentification entreprise
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Cas d'usage concrets</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Recrutement Tech</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Évaluez les candidats avec des tests techniques réalistes
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Formation Continue</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Montée en compétences avec suivi de progression
                  </p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Onboarding</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Intégration des nouveaux développeurs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tarifs - Design simple et clair */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tarifs transparents
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Gratuit</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">0€</div>
                <p className="text-gray-500 mb-6">Pour découvrir</p>
                <ul className="space-y-3 text-sm text-left mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>5 ateliers maximum</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>2h de session par jour</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Outils de base (Python, Node.js)</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full rounded-xl">
                  Commencer gratuitement
                </Button>
              </div>
            </Card>

            <Card className="border-2 border-blue-500 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Populaire</Badge>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Pro</h3>
                <div className="text-4xl font-bold text-blue-600 mb-1">29€</div>
                <p className="text-gray-500 mb-6">par mois</p>
                <ul className="space-y-3 text-sm text-left mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Ateliers illimités</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Sessions illimitées</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Tous les outils et langages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Communautés privées</span>
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
                  Essayer Pro
                </Button>
              </div>
            </Card>

            <Card className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Entreprise</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">Sur mesure</div>
                <p className="text-gray-500 mb-6">Pour les équipes</p>
                <ul className="space-y-3 text-sm text-left mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Infrastructure dédiée</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>SSO et intégrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Support dédié</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Formation incluse</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full rounded-xl">
                  Nous contacter
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final - Simple et efficace */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-orange-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à créer votre premier atelier ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez les équipes qui utilisent déjà Nalabo pour transformer l'apprentissage technique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/workshops">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-medium rounded-xl shadow-lg">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-medium rounded-xl"
            >
              Planifier une démo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}