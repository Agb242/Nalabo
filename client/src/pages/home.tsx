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
  TrendingUp,
  Rocket,
  Building2,
  GitBranch,
  Target,
  Layers,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';

const techLogos = [
  { name: 'Docker', icon: Container, color: 'text-blue-500' },
  { name: 'Kubernetes', icon: Server, color: 'text-purple-500' },
  { name: 'Python', icon: Code, color: 'text-yellow-500' },
  { name: 'AI/ML', icon: Brain, color: 'text-green-500' },
  { name: 'Cloud', icon: Cloud, color: 'text-blue-400' },
  { name: 'DevOps', icon: GitBranch, color: 'text-orange-500' },
];

const stats = [
  { label: 'Interactive Workshops', value: '200+', icon: Code },
  { label: 'Enterprise Partners', value: '100+', icon: Building2 },
  { label: 'Developers Trained', value: '25K+', icon: Users },
  { label: 'Success Rate', value: '96%', icon: TrendingUp },
];

const useCases = [
  {
    title: 'DevOps Academy',
    description: 'Train teams on CI/CD, Infrastructure as Code, and cloud-native technologies',
    icon: GitBranch,
    color: 'bg-blue-500',
    benefits: ['Docker & K8s mastery', 'CI/CD pipelines', 'Cloud automation'],
  },
  {
    title: 'AI/ML Bootcamp',
    description: 'Hands-on machine learning workshops with real datasets and production workflows',
    icon: Brain,
    color: 'bg-green-500',
    benefits: ['MLOps workflows', 'Model deployment', 'Data pipelines'],
  },
  {
    title: 'Cloud Migration Lab',
    description: 'Interactive environments for AWS, Azure, GCP migration strategies',
    icon: Cloud,
    color: 'bg-purple-500',
    benefits: ['Multi-cloud strategy', 'Cost optimization', 'Security best practices'],
  },
  {
    title: 'Startup Tech Stack',
    description: 'Complete development environment setup for fast-growing companies',
    icon: Rocket,
    color: 'bg-nalabo-orange',
    benefits: ['Scalable architecture', 'Monitoring setup', 'Team collaboration'],
  },
];

const features = [
  {
    title: 'Interactive Learning',
    description: 'Pre-configured environments for hands-on practice',
    icon: Play,
    color: 'bg-nalabo-orange',
  },
  {
    title: 'Enterprise Security',
    description: 'SOC2 compliant infrastructure with GDPR compliance',
    icon: Shield,
    color: 'bg-nalabo-blue',
  },
  {
    title: 'Multi-Technology',
    description: 'Docker, K8s, Python, DevOps, AI/ML, Cybersecurity',
    icon: Zap,
    color: 'bg-nalabo-emerald',
  },
  {
    title: 'Team Collaboration',
    description: 'Dedicated spaces for teams and organizations',
    icon: Users,
    color: 'bg-purple-500',
  },
];

const testimonials = [
  {
    name: 'Alex Chen',
    role: 'CTO, TechScale',
    avatar: '/api/placeholder/32/32',
    content: 'Nalabo revolutionized our onboarding. New engineers are productive 70% faster with hands-on workshops.',
    rating: 5,
  },
  {
    name: 'Maria Rodriguez',
    role: 'DevOps Lead, CloudCorp',
    avatar: '/api/placeholder/32/32',
    content: 'The Kubernetes workshops are outstanding. Our team went from zero to production-ready in weeks.',
    rating: 5,
  },
  {
    name: 'David Kumar',
    role: 'Engineering Manager, StartupHub',
    avatar: '/api/placeholder/32/32',
    content: 'Perfect for scaling our engineering team. Interactive learning beats traditional training by miles.',
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: 'Freemium',
    price: 'Free',
    description: 'Perfect for individual developers',
    features: [
      '5 workshops per month',
      'Basic Docker environments',
      'Community support',
      'Public workspace'
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For teams and organizations',
    features: [
      'Unlimited workshops',
      'Multi-cloud integrations',
      'SSO & advanced security',
      'Dedicated support',
      'Custom branding',
      'Analytics dashboard'
    ],
    cta: 'Contact Sales',
    popular: true,
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
              The Ultimate Learning Platform for Developers
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-nalabo-slate mb-6 leading-tight">
              Master 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nalabo-orange via-nalabo-blue to-nalabo-emerald animate-tech-glow animate-gradient-shift">
                {' '}Tech{' '}
              </span>
              Through Practice
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              The cloud-native platform for immersive technical workshops. 
              Train your teams on Docker, Kubernetes, AI/ML and cutting-edge technologies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-nalabo-orange hover:bg-nalabo-orange/90 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={handleGetStarted}
              >
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="border-nalabo-blue text-nalabo-blue hover:bg-nalabo-blue/10 px-8 py-4 text-lg font-semibold"
                onClick={() => navigate('/workshops')}
              >
                <Play className="mr-2 h-5 w-5" />
                Explore Workshops
              </Button>
            </div>
          </div>

          {/* Tech Logos Animation */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
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

      {/* Workshop Illustration Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-nalabo-slate mb-4">
                Explore Our Interactive Workshops
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Dive into hands-on learning with pre-configured environments and real-world scenarios.
                Our workshops cover everything from Docker and Kubernetes to AI/ML and cybersecurity.
              </p>
              <Button onClick={() => navigate('/workshops')}>See All Workshops</Button>
            </div>
            <div className="relative">
              {/* Animated Workshop Interface Preview */}
              <div className="bg-white rounded-lg shadow-2xl p-6 border border-gray-200 transform hover:scale-105 transition-all duration-500">
                {/* Mock Browser Header */}
                <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded px-3 py-1 text-xs text-gray-500">
                    nalabo.co/workshop/docker-basics
                  </div>
                </div>

                {/* Workshop Content Preview */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-nalabo-blue rounded-lg flex items-center justify-center">
                      <Container className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Docker Fundamentals</h3>
                      <p className="text-xs text-gray-500">Interactive Container Workshop</p>
                    </div>
                  </div>

                  {/* Code Editor Mock */}
                  <div className="bg-gray-900 rounded-lg p-3 text-xs">
                    <div className="flex items-center space-x-2 mb-2">
                      <Code className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Terminal</span>
                    </div>
                    <div className="text-green-400 font-mono space-y-1">
                      <div className="animate-pulse">$ docker run -d --name workshop nginx</div>
                      <div className="text-gray-400">Container started successfully ✓</div>
                      <div className="animate-pulse delay-1000">$ docker ps</div>
                    </div>
                  </div>

                  {/* Progress Indicators */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-nalabo-blue font-semibold">Step 3/7</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-nalabo-orange to-nalabo-blue h-2 rounded-full animate-pulse" style={{width: '43%'}}></div>
                    </div>
                  </div>

                  {/* Tools Panel */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 rounded p-2 text-center">
                      <Server className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                      <span className="text-xs text-blue-600">Kubernetes</span>
                    </div>
                    <div className="bg-orange-50 rounded p-2 text-center">
                      <Container className="w-4 h-4 mx-auto text-orange-600 mb-1" />
                      <span className="text-xs text-orange-600">Docker</span>
                    </div>
                    <div className="bg-green-50 rounded p-2 text-center">
                      <GitBranch className="w-4 h-4 mx-auto text-green-600 mb-1" />
                      <span className="text-xs text-green-600">CI/CD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-nalabo-orange/20 rounded-full animate-bounce delay-500"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-nalabo-blue/20 rounded-full animate-bounce delay-1000"></div>
            </div>
          </div>
        </div>
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

      {/* Use Cases Section */}
      <section className="py-20 bg-gradient-to-br from-nalabo-light to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-nalabo-slate mb-4">
              Enterprise Use Cases
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how leading companies use Nalabo to accelerate their teams
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card 
                key={useCase.title} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${useCase.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <useCase.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-nalabo-slate">
                    {useCase.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {useCase.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {useCase.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-nalabo-slate mb-4">
              Why Choose Nalabo?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for modern development teams and enterprise scale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg text-center"
              >
                <CardHeader>
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

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-nalabo-light to-blue-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-nalabo-slate mb-4">
              Simple Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, scale with your team
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={plan.name}
                className={`relative overflow-hidden ${plan.popular ? 'ring-2 ring-nalabo-orange shadow-xl scale-105' : 'shadow-lg'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-nalabo-orange text-white px-3 py-1 text-sm font-semibold">
                    Popular
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-nalabo-slate">
                    {plan.name}
                  </CardTitle>
                  <div className="text-4xl font-bold text-nalabo-blue mb-2">
                    {plan.price}
                  </div>
                  <CardDescription className="text-gray-600">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}

                  <Button 
                    className={`w-full mt-6 ${plan.popular ? 'bg-nalabo-orange hover:bg-nalabo-orange/90' : 'bg-nalabo-blue hover:bg-nalabo-blue/90'} text-white`}
                    onClick={plan.name === 'Freemium' ? handleGetStarted : () => window.open('tel:065267497', '_blank')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-nalabo-slate mb-4">
              Need Enterprise Solutions?
            </h3>
            <p className="text-gray-600 mb-6">
              Custom integrations, dedicated support, and tailored workshops for your organization
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-nalabo-blue mr-2" />
                <a href="tel:065267497" className="text-nalabo-blue hover:underline">065 267 497</a>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-nalabo-blue mr-2" />
                <a href="mailto:contact@nalabo.co" className="text-nalabo-blue hover:underline">contact@nalabo.co</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-nalabo-slate mb-4">
              Trusted by Leading Teams
            </h2>
            <p className="text-xl text-gray-600">
              See what engineering leaders say about Nalabo
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
            Ready to Transform Your Tech Training?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 25,000+ developers mastering tomorrow's technologies today
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-nalabo-blue hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              onClick={handleGetStarted}
            >
              Start Your Journey
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              onClick={() => navigate('/workshops')}
            >
              Explore Workshops
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm opacity-80">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Free to start
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Enterprise ready
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}