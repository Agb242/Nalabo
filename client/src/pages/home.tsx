
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  LaptopIcon, 
  Users, 
  Tag, 
  Shield, 
  Zap, 
  Globe, 
  Code2, 
  Container,
  Database,
  Brain,
  GitBranch,
  Trophy,
  Clock,
  Star,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 via-purple-600 to-orange-500 text-white py-20">
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
              <span className="text-3xl md:text-4xl text-blue-100">L'alternative française à Educates.dev</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto">
              Plateforme cloud-native pour l'apprentissage technologique avec des environnements containerisés, 
              des ateliers interactifs et une approche "hands-on" immersive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/workshops">
                <Button size="lg" className="bg-white text-blue-800 hover:bg-gray-100 font-bold px-8 py-3">
                  Démarrer gratuitement
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-800 font-bold px-8 py-3"
              >
                Voir la démo
              </Button>
            </div>
            <div className="flex items-center justify-center mt-8 gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>Gratuit jusqu'à 5 ateliers</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>Pas de carte de crédit</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>Interface en français</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-blue-800 dark:text-orange-500">
            Pourquoi choisir Nalabo ?
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Une plateforme complète pour créer, partager et suivre des ateliers techniques 
            dans un environnement sécurisé et isolé.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="text-center p-6 bg-slate-50 dark:bg-gray-800 hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Container className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-blue-800 dark:text-white">
                  Environnements Containerisés
                </h3>
                <p className="text-slate-600 dark:text-gray-300 mb-4">
                  Environnements Docker et Kubernetes prêts à l'emploi pour tous vos ateliers techniques
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">Docker</Badge>
                  <Badge variant="secondary">Kubernetes</Badge>
                  <Badge variant="secondary">vCluster</Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Feature 2 */}
            <Card className="text-center p-6 bg-slate-50 dark:bg-gray-800 hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-blue-800 dark:text-white">
                  Ateliers Interactifs
                </h3>
                <p className="text-slate-600 dark:text-gray-300 mb-4">
                  Créez des ateliers avec validation automatique, terminal intégré et suivi de progression
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">Python</Badge>
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">Go</Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Feature 3 */}
            <Card className="text-center p-6 bg-slate-50 dark:bg-gray-800 hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-blue-800 dark:text-white">
                  Communautés Privées
                </h3>
                <p className="text-slate-600 dark:text-gray-300 mb-4">
                  Créez des espaces dédiés pour vos équipes avec gestion d'accès avancée
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">Équipes</Badge>
                  <Badge variant="secondary">Entreprises</Badge>
                  <Badge variant="secondary">Écoles</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Intégrations Entreprise */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-blue-800 dark:text-orange-500">
            Intégrations Entreprise
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Connectez Nalabo à vos outils existants pour une expérience seamless et des environnements cloud réels
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <GitBranch className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">DevOps & CI/CD</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  GitHub, GitLab, Jenkins, CircleCI
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  <Badge variant="outline" className="text-xs">GitHub Actions</Badge>
                  <Badge variant="outline" className="text-xs">GitLab CI</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Cloud Providers</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  AWS, Azure, GCP, environnements réels
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  <Badge variant="outline" className="text-xs">AWS</Badge>
                  <Badge variant="outline" className="text-xs">Azure</Badge>
                  <Badge variant="outline" className="text-xs">GCP</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Collaboration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Slack, Teams, Discord, notifications
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  <Badge variant="outline" className="text-xs">Slack</Badge>
                  <Badge variant="outline" className="text-xs">Teams</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">SSO & Sécurité</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  SAML, OAuth2, Active Directory
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  <Badge variant="outline" className="text-xs">SAML</Badge>
                  <Badge variant="outline" className="text-xs">OAuth2</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Use Cases Intégrations */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-bold mb-6 text-center">Cas d'usage concrets</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl mb-2">🏢</div>
                <h4 className="font-semibold mb-2">Recrutement Tech</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Évaluez les candidats avec des ateliers techniques connectés à votre SIRH
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-semibold mb-2">Formation Continue</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Synchronisez la progression avec vos systèmes RH et LMS existants
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold mb-2">DevOps en Temps Réel</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Ateliers sur vos propres infrastructures cloud avec monitoring intégré
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ateliers Interactifs Avancés */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-blue-800 dark:text-orange-500">
            Ateliers Interactifs Nouvelle Génération
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Au-delà de Python : explorez les technologies émergentes avec l'IA comme copilote
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* IA & Machine Learning */}
            <Card className="border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">IA & ML Avancés</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Entraînement de modèles en temps réel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>RAG et Embeddings vectoriels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Computer Vision avec OpenCV</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>LLMs personnalisés (Llama, Mistral)</span>
                  </li>
                </ul>
                <div className="flex flex-wrap gap-1 mt-4">
                  <Badge className="bg-purple-100 text-purple-800">PyTorch</Badge>
                  <Badge className="bg-purple-100 text-purple-800">Transformers</Badge>
                  <Badge className="bg-purple-100 text-purple-800">Langchain</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Cloud Native & DevOps */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">Cloud Native & DevOps</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Microservices avec Service Mesh</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>GitOps et Infrastructure as Code</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Observabilité (Grafana, Prometheus)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Serverless et Edge Computing</span>
                  </li>
                </ul>
                <div className="flex flex-wrap gap-1 mt-4">
                  <Badge className="bg-blue-100 text-blue-800">Terraform</Badge>
                  <Badge className="bg-blue-100 text-blue-800">Helm</Badge>
                  <Badge className="bg-blue-100 text-blue-800">Istio</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Coding avec IA */}
            <Card className="border-2 border-green-200 dark:border-green-800 hover:border-green-400 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Code2 className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">Vibe Coding avec IA</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Pair programming avec IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Code review automatique</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Refactoring intelligent</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Tests générés automatiquement</span>
                  </li>
                </ul>
                <div className="flex flex-wrap gap-1 mt-4">
                  <Badge className="bg-green-100 text-green-800">GitHub Copilot</Badge>
                  <Badge className="bg-green-100 text-green-800">Cursor</Badge>
                  <Badge className="bg-green-100 text-green-800">Claude</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Système de Défis Intégrés */}
          <div className="mt-16 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-orange-800 dark:text-orange-300">
                Modes d'Atelier Gamifiés
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Transformez l'apprentissage en aventure avec nos modes interactifs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="font-semibold mb-2">Mode Apprentissage</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Ateliers guidés avec aide IA et progression adaptative
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center border-2 border-orange-300">
                <div className="text-3xl mb-3">⚡</div>
                <h4 className="font-semibold mb-2">Mode Défi</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Challenges chronométrés avec classement en temps réel
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
                <div className="text-3xl mb-3">👥</div>
                <h4 className="font-semibold mb-2">Mode Collaboratif</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Ateliers en équipe avec code partagé en temps réel
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-800 dark:text-orange-500">
            Tarifs Simples et Transparents
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="relative border-2 border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Gratuit</CardTitle>
                <div className="text-3xl font-bold text-blue-600">0€</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Pour découvrir</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>5 ateliers maximum</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>2h de session par jour</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Outils de base</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Support communautaire</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Commencer gratuitement
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-orange-500 shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-500 text-white">Populaire</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-3xl font-bold text-orange-600">29€</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">par mois</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Ateliers illimités</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Sessions illimitées</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Tous les outils</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Support prioritaire</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Communautés privées</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-orange-500 hover:bg-orange-600">
                  Essayer Pro
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative border-2 border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Entreprise</CardTitle>
                <div className="text-3xl font-bold text-blue-600">Sur mesure</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Pour les équipes</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Infrastructure dédiée</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>SSO et intégrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Support 24/7</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Formation incluse</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Nous contacter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-800 to-orange-500 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6">
            Prêt à révolutionner votre apprentissage tech ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez des milliers de développeurs qui utilisent déjà Nalabo pour leurs formations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/workshops">
              <Button size="lg" className="bg-white text-blue-800 hover:bg-gray-100 font-bold px-8 py-3">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-800 font-bold px-8 py-3"
            >
              Planifier une démo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
