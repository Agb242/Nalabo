import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  Award,
  ChevronRight,
  Container,
  Cloud,
  Brain,
  Code,
  Server,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';

const techLogos = [
  { name: 'Docker', icon: Container, color: 'text-blue-500' },
  { name: 'Kubernetes', icon: Server, color: 'text-purple-500' },
  { name: 'Python', icon: Code, color: 'text-yellow-500' },
  { name: 'AI/ML', icon: Brain, color: 'text-green-500' },
  { name: 'Cloud', icon: Cloud, color: 'text-blue-400' },
];

const stats = [
  { label: 'Ateliers Disponibles', value: '150+', icon: Code },
  { label: 'Entreprises Partenaires', value: '50+', icon: Users },
  { label: 'Développeurs Formés', value: '10K+', icon: Award },
  { label: 'Taux de Réussite', value: '94%', icon: TrendingUp },
];

const features = [
  {
    title: 'Ateliers Interactifs',
    description: 'Environnements préconfigurés pour apprendre par la pratique',
    icon: Play,
    color: 'bg-nalabo-orange',
  },
  {
    title: 'Infrastructure Française',
    description: 'Hébergement souverain et conformité RGPD native',
    icon: Shield,
    color: 'bg-nalabo-blue',
  },
  {
    title: 'Multi-Technologies',
    description: 'Docker, K8s, Python, DevOps, AI/ML, Cybersécurité',
    icon: Zap,
    color: 'bg-nalabo-emerald',
  },
  {
    title: 'Communautés Pro',
    description: 'Espaces dédiés pour équipes et organisations',
    icon: Users,
    color: 'bg-purple-500',
  },
];

const testimonials = [
  {
    name: 'Thomas Dubois',
    role: 'Tech Lead, TechCorp',
    avatar: '/api/placeholder/32/32',
    content: 'Nalabo a révolutionné notre formation interne. Nos développeurs montent en compétences 3x plus vite.',
    rating: 5,
  },
  {
    name: 'Sarah Martin',
    role: 'DevOps Engineer, CloudFirm',
    avatar: '/api/placeholder/32/32',
    content: 'La qualité des ateliers Kubernetes est exceptionnelle. Interface 100% française, c\'est parfait.',
    rating: 5,
  },
  {
    name: 'Pierre Lambert',
    role: 'CTO, StartupTech',
    avatar: '/api/placeholder/32/32',
    content: 'Alternative française idéale à Educates. Notre équipe adore les ateliers pratiques.',
    rating: 5,
  },
];

export default function Home() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  const navigate = (path: string) => setLocation(path);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/workshops');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nalabo-light via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-nalabo-orange/10 via-nalabo-blue/10 to-nalabo-emerald/10 animate-pulse" />

        <div className={`max-w-7xl mx-auto relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 text-nalabo-blue border-nalabo-blue bg-blue-50">
              <Sparkles className="w-4 h-4 mr-2" />
              Alternative Française à Educates.dev
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-nalabo-slate mb-6 leading-tight">
              Maîtrisez la 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nalabo-orange to-nalabo-blue animate-pulse">
                {' '}Tech{' '}
              </span>
              par la Pratique
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              La première plateforme française cloud-native pour des ateliers techniques immersifs. 
              Formez vos équipes sur Docker, Kubernetes, AI/ML et bien plus.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-nalabo-orange hover:bg-nalabo-orange/90 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={handleGetStarted}
              >
                Commencer Gratuitement
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="border-nalabo-blue text-nalabo-blue hover:bg-nalabo-blue/10 px-8 py-4 text-lg font-semibold"
                onClick={() => navigate('/workshops')}
              >
                <Play className="mr-2 h-5 w-5" />
                Voir les Ateliers
              </Button>
            </div>
          </div>

          {/* Tech Logos Animation */}
          <div className="flex justify-center items-center space-x-8 opacity-60">
            {techLogos.map((tech, index) => (
              <div 
                key={tech.name}
                className={`flex flex-col items-center transition-all duration-500 hover:scale-110 ${tech.color}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <tech.icon className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium text-gray-600">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-nalabo-orange/20 rounded-full animate-bounce delay-1000" />
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-nalabo-blue/20 rounded-full animate-bounce delay-2000" />
        <div className="absolute top-40 right-20 w-12 h-12 bg-nalabo-emerald/20 rounded-full animate-bounce delay-500" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center group hover:scale-105 transition-transform duration-300">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-nalabo-blue group-hover:text-nalabo-orange transition-colors" />
                <div className="text-3xl font-bold text-nalabo-slate mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-nalabo-light to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-nalabo-slate mb-4">
              Pourquoi Choisir Nalabo ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme conçue pour l'excellence technique française
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg"
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-nalabo-slate">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-nalabo-slate mb-4">
              Ils Nous Font Confiance
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez pourquoi les équipes tech françaises choisissent Nalabo
            </p>
          </div>

          <Card className="bg-gradient-to-r from-nalabo-light to-blue-50 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <blockquote className="text-lg text-gray-700 mb-6 italic">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>

                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-nalabo-blue rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonials[currentTestimonial].name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-nalabo-slate">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-nalabo-orange' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-nalabo-blue to-nalabo-emerald">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à Transformer Votre Formation Tech ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les 10 000+ développeurs qui maîtrisent déjà les technologies du futur
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-nalabo-blue hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              onClick={handleGetStarted}
            >
              Commencer Maintenant
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              onClick={() => navigate('/workshops')}
            >
              Explorer les Ateliers
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-sm opacity-80">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Gratuit pour commencer
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Support français
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              RGPD compliant
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}