
// Internationalization system for Nalabo platform
export type Language = 'fr' | 'en';

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

interface Translations {
  fr: TranslationObject;
  en: TranslationObject;
}

export const translations: Translations = {
  fr: {
    // Navigation
    nav: {
      home: 'Accueil',
      workshops: 'Ateliers',
      challenges: 'Défis',
      community: 'Communauté',
      dashboard: 'Tableau de bord',
      profile: 'Profil',
      admin: 'Administration',
      login: 'Connexion',
      logout: 'Déconnexion',
      register: 'Inscription'
    },
    // Hero Section  
    hero: {
      title: 'Maîtrisez la Tech par la Pratique',
      subtitle: 'La plateforme cloud-native française pour des ateliers techniques immersifs',
      description: 'Formez vos équipes sur Docker, Kubernetes, IA/ML et les technologies cloud avec des environnements interactifs et sécurisés. Alternative française à Educates.dev.',
      startFree: 'Commencer Gratuitement',
      exploreWorkshops: 'Explorer les Ateliers',
      startJourney: 'Démarrer votre Parcours',
      freeToStart: 'Gratuit pour commencer',
      noCreditCard: 'Aucune carte de crédit requise',
      enterpriseReady: 'Prêt pour l\'entreprise',
      frenchAlternative: 'Alternative Française à Educates.dev',
      badge: '🇫🇷 Made in France',
      trustedBy: 'Utilisé par',
      developers: 'développeurs',
      companies: 'entreprises'
    },
    // Workshop Section
    workshops: {
      title: 'Explorez nos Ateliers Interactifs',
      description: 'Plongez dans l\'apprentissage pratique avec des environnements préconfigurés et des scénarios du monde réel. Nos ateliers couvrent tout, de Docker et Kubernetes à l\'IA/ML et la cybersécurité.',
      seeAll: 'Voir tous les Ateliers',
      dockerFundamentals: 'Fondamentaux Docker',
      interactiveContainer: 'Atelier Conteneur Interactif',
      terminal: 'Terminal',
      containerStarted: 'Conteneur démarré avec succès ✓',
      previewEnvironment: 'Aperçu de l\'Environnement',
      realWorldScenarios: 'Scénarios du Monde Réel',
      handsonPractice: 'Pratique Immersive'
    },
    // Technologies
    technologies: {
      docker: 'Docker',
      kubernetes: 'Kubernetes',
      python: 'Python',
      aiml: 'IA/ML',
      cloud: 'Cloud',
      devops: 'DevOps',
      cybersecurity: 'Cybersécurité',
      dataScience: 'Data Science'
    },
    // Features
    features: {
      title: 'Pourquoi Choisir Nalabo ?',
      description: 'Conçu pour les équipes de développement modernes et l\'échelle d\'entreprise',
      interactiveLearning: {
        title: 'Apprentissage Interactif',
        description: 'Environnements préconfigurés pour la pratique immersive'
      },
      enterpriseSecurity: {
        title: 'Sécurité Entreprise',
        description: 'Infrastructure conforme SOC2 avec conformité RGPD'
      },
      multiTechnology: {
        title: 'Multi-Technologies',
        description: 'Docker, K8s, Python, DevOps, IA/ML, Cybersécurité'
      },
      teamCollaboration: {
        title: 'Collaboration Équipe',
        description: 'Espaces dédiés pour les équipes et organisations'
      },
      frenchInfrastructure: {
        title: 'Infrastructure Française',
        description: 'Hébergement en France, conformité RGPD native'
      },
      enterpriseUseCases: 'Cas d\'Usage Entreprise',
      accelerateTeams: 'Découvrez comment les entreprises leaders utilisent Nalabo pour accélérer leurs équipes'
    },
    // Stats
    stats: {
      activeUsers: 'Utilisateurs Actifs',
      workshopsCompleted: 'Ateliers Terminés', 
      companiesUsing: 'Entreprises Utilisatrices',
      successRate: 'Taux de Réussite',
      workshopsAvailable: 'Ateliers Disponibles',
      developersStrained: 'Développeurs Formés'
    },
    // Testimonials
    testimonials: {
      title: 'Ils Nous Font Confiance',
      description: 'Découvrez pourquoi les équipes tech leaders choisissent Nalabo',
      testimonial1: {
        content: 'Nalabo a révolutionné notre onboarding. Les nouveaux ingénieurs sont 70% plus productifs avec les ateliers pratiques.',
        author: 'Alex Chen',
        role: 'CTO, TechScale'
      },
      testimonial2: {
        content: 'Les ateliers Kubernetes sont exceptionnels. Notre équipe est passée de zéro à production en quelques semaines.',
        author: 'Maria Rodriguez',
        role: 'Lead DevOps, CloudCorp'
      },
      testimonial3: {
        content: 'Parfait pour faire évoluer notre équipe d\'ingénierie. L\'apprentissage interactif dépasse la formation traditionnelle.',
        author: 'David Kumar',
        role: 'Engineering Manager, StartupHub'
      }
    },
    // Pricing & Plans
    pricing: {
      title: 'Choisissez Votre Plan',
      description: 'Des solutions adaptées à tous les besoins, du développeur individuel à l\'entreprise',
      freemium: 'Gratuit',
      enterprise: 'Entreprise',
      custom: 'Sur Mesure',
      perfectFor: 'Parfait pour les développeurs individuels',
      forTeams: 'Pour les équipes et organisations',
      contactSales: 'Contacter les Ventes',
      getStarted: 'Commencer',
      mostPopular: 'Le Plus Populaire'
    },
    // Community & Admin
    community: {
      management: 'Gestion des Communautés',
      members: 'Membres',
      settings: 'Paramètres',
      permissions: 'Permissions',
      createCommunity: 'Créer une Communauté',
      joinCommunity: 'Rejoindre une Communauté',
      title: 'Communautés Tech',
      description: 'Rejoignez des communautés passionnées et apprenez ensemble'
    },
    // Authentication
    auth: {
      login: 'Se Connecter',
      register: 'S\'inscrire',
      logout: 'Se Déconnecter',
      profile: 'Profil',
      settings: 'Paramètres',
      adminDashboard: 'Tableau de Bord Admin',
      superAdminDashboard: 'Tableau de Bord Super Admin',
      accessDenied: 'Accès Refusé',
      insufficientPermissions: 'Permissions insuffisantes',
      welcome: 'Bienvenue',
      loginDescription: 'Connectez-vous à votre compte Nalabo',
      registerDescription: 'Créez votre compte pour commencer',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      firstName: 'Prénom',
      lastName: 'Nom',
      company: 'Entreprise'
    },
    // CTA Section
    cta: {
      title: 'Prêt à Transformer Votre Formation Tech ?',
      description: 'Rejoignez des milliers de développeurs qui maîtrisent déjà les technologies de demain',
      startToday: 'Commencer Aujourd\'hui',
      talkToExpert: 'Parler à un Expert',
      benefits: {
        free: 'Gratuit pour commencer',
        support: 'Support en français',
        gdpr: 'Conformité RGPD'
      }
    },
    // Infrastructure
    infrastructure: {
      management: 'Gestion de l\'Infrastructure',
      kubernetes: 'Gestion Kubernetes',
      clusters: 'Clusters',
      namespaces: 'Espaces de Noms',
      monitoring: 'Surveillance',
      resources: 'Ressources',
      status: 'État',
      healthy: 'Sain',
      unhealthy: 'Défaillant',
      maintenance: 'Maintenance'
    },
    // Super Admin
    superAdmin: {
      title: 'Administration Super Admin',
      k8sManagement: 'Gestion Kubernetes',
      clusterStatus: 'État du Cluster',
      connected: 'Connecté',
      disconnected: 'Déconnecté',
      connect: 'Connecter',
      disconnect: 'Déconnecter',
      namespaces: 'Espaces de noms',
      pods: 'Pods',
      services: 'Services',
      deployments: 'Déploiements',
      configMaps: 'ConfigMaps',
      secrets: 'Secrets'
    },
    // Footer
    footer: {
      company: 'Entreprise',
      about: 'À propos',
      careers: 'Carrières',
      press: 'Presse',
      contact: 'Contact',
      product: 'Produit',
      features: 'Fonctionnalités',
      integrations: 'Intégrations',
      changelog: 'Changelog',
      resources: 'Ressources',
      documentation: 'Documentation',
      blog: 'Blog',
      community: 'Communauté',
      support: 'Support',
      legal: 'Légal',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      security: 'Sécurité',
      copyright: 'Tous droits réservés',
      madeInFrance: 'Fait avec ❤️ en France'
    },
    // Common
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      update: 'Mettre à jour',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      actions: 'Actions',
      viewAll: 'Voir tout',
      learnMore: 'En savoir plus',
      getStarted: 'Commencer',
      tryFree: 'Essai gratuit'
    }
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      workshops: 'Workshops',
      challenges: 'Challenges',
      community: 'Community',
      dashboard: 'Dashboard',
      profile: 'Profile',
      admin: 'Administration',
      login: 'Login',
      logout: 'Logout',
      register: 'Register'
    },
    // Hero Section
    hero: {
      title: 'Master Tech Through Practice',
      subtitle: 'The French cloud-native platform for immersive technical workshops',
      description: 'Train your teams on Docker, Kubernetes, AI/ML and cloud technologies with interactive and secure environments. French alternative to Educates.dev.',
      startFree: 'Start Free',
      exploreWorkshops: 'Explore Workshops',
      startJourney: 'Start Your Journey',
      freeToStart: 'Free to start',
      noCreditCard: 'No credit card required',
      enterpriseReady: 'Enterprise ready',
      frenchAlternative: 'French Alternative to Educates.dev',
      badge: '🇫🇷 Made in France',
      trustedBy: 'Trusted by',
      developers: 'developers',
      companies: 'companies'
    },
    // Workshop Section
    workshops: {
      title: 'Explore our Interactive Workshops',
      description: 'Dive into hands-on learning with pre-configured environments and real-world scenarios. Our workshops cover everything from Docker and Kubernetes to AI/ML and cybersecurity.',
      seeAll: 'See All Workshops',
      dockerFundamentals: 'Docker Fundamentals',
      interactiveContainer: 'Interactive Container Workshop',
      terminal: 'Terminal',
      containerStarted: 'Container started successfully ✓',
      previewEnvironment: 'Environment Preview',
      realWorldScenarios: 'Real-World Scenarios',
      handsonPractice: 'Hands-on Practice'
    },
    // Technologies
    technologies: {
      docker: 'Docker',
      kubernetes: 'Kubernetes',
      python: 'Python',
      aiml: 'AI/ML',
      cloud: 'Cloud',
      devops: 'DevOps',
      cybersecurity: 'Cybersecurity',
      dataScience: 'Data Science'
    },
    // Features
    features: {
      title: 'Why Choose Nalabo?',
      description: 'Built for modern development teams and enterprise scale',
      interactiveLearning: {
        title: 'Interactive Learning',
        description: 'Pre-configured environments for hands-on practice'
      },
      enterpriseSecurity: {
        title: 'Enterprise Security',
        description: 'SOC2 compliant infrastructure with GDPR compliance'
      },
      multiTechnology: {
        title: 'Multi-Technology',
        description: 'Docker, K8s, Python, DevOps, AI/ML, Cybersecurity'
      },
      teamCollaboration: {
        title: 'Team Collaboration',
        description: 'Dedicated spaces for teams and organizations'
      },
      frenchInfrastructure: {
        title: 'French Infrastructure',
        description: 'Hosted in France, native GDPR compliance'
      },
      enterpriseUseCases: 'Enterprise Use Cases',
      accelerateTeams: 'See how leading companies use Nalabo to accelerate their teams'
    },
    // Stats
    stats: {
      activeUsers: 'Active Users',
      workshopsCompleted: 'Workshops Completed',
      companiesUsing: 'Companies Using',
      successRate: 'Success Rate',
      workshopsAvailable: 'Workshops Available',
      developersStrained: 'Developers Trained'
    },
    // Testimonials
    testimonials: {
      title: 'Trusted by Tech Leaders',
      description: 'Discover why leading tech teams choose Nalabo',
      testimonial1: {
        content: 'Nalabo revolutionized our onboarding. New engineers are 70% more productive with hands-on workshops.',
        author: 'Alex Chen',
        role: 'CTO, TechScale'
      },
      testimonial2: {
        content: 'The Kubernetes workshops are outstanding. Our team went from zero to production-ready in weeks.',
        author: 'Maria Rodriguez',
        role: 'DevOps Lead, CloudCorp'
      },
      testimonial3: {
        content: 'Perfect for scaling our engineering team. Interactive learning beats traditional training by miles.',
        author: 'David Kumar',
        role: 'Engineering Manager, StartupHub'
      }
    },
    // Pricing & Plans
    pricing: {
      title: 'Choose Your Plan',
      description: 'Solutions tailored for every need, from individual developers to enterprise',
      freemium: 'Free',
      enterprise: 'Enterprise',
      custom: 'Custom',
      perfectFor: 'Perfect for individual developers',
      forTeams: 'For teams and organizations',
      contactSales: 'Contact Sales',
      getStarted: 'Get Started',
      mostPopular: 'Most Popular'
    },
    // Community & Admin
    community: {
      management: 'Community Management',
      members: 'Members',
      settings: 'Settings',
      permissions: 'Permissions',
      createCommunity: 'Create Community',
      joinCommunity: 'Join Community',
      title: 'Tech Communities',
      description: 'Join passionate communities and learn together'
    },
    // Authentication
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      profile: 'Profile',
      settings: 'Settings',
      adminDashboard: 'Admin Dashboard',
      superAdminDashboard: 'Super Admin Dashboard',
      accessDenied: 'Access Denied',
      insufficientPermissions: 'Insufficient Permissions',
      welcome: 'Welcome',
      loginDescription: 'Sign in to your Nalabo account',
      registerDescription: 'Create your account to get started',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      company: 'Company'
    },
    // CTA Section
    cta: {
      title: 'Ready to Transform Your Tech Training?',
      description: 'Join thousands of developers already mastering tomorrow\'s technologies',
      startToday: 'Start Today',
      talkToExpert: 'Talk to Expert',
      benefits: {
        free: 'Free to start',
        support: 'French support',
        gdpr: 'GDPR compliant'
      }
    },
    // Infrastructure
    infrastructure: {
      management: 'Infrastructure Management',
      kubernetes: 'Kubernetes Management',
      clusters: 'Clusters',
      namespaces: 'Namespaces',
      monitoring: 'Monitoring',
      resources: 'Resources',
      status: 'Status',
      healthy: 'Healthy',
      unhealthy: 'Unhealthy',
      maintenance: 'Maintenance'
    },
    // Super Admin
    superAdmin: {
      title: 'Super Admin Dashboard',
      k8sManagement: 'Kubernetes Management',
      clusterStatus: 'Cluster Status',
      connected: 'Connected',
      disconnected: 'Disconnected',
      connect: 'Connect',
      disconnect: 'Disconnect',
      namespaces: 'Namespaces',
      pods: 'Pods',
      services: 'Services',
      deployments: 'Deployments',
      configMaps: 'ConfigMaps',
      secrets: 'Secrets'
    },
    // Footer
    footer: {
      company: 'Company',
      about: 'About',
      careers: 'Careers',
      press: 'Press',
      contact: 'Contact',
      product: 'Product',
      features: 'Features',
      integrations: 'Integrations',
      changelog: 'Changelog',
      resources: 'Resources',
      documentation: 'Documentation',
      blog: 'Blog',
      community: 'Community',
      support: 'Support',
      legal: 'Legal',
      privacy: 'Privacy',
      terms: 'Terms',
      security: 'Security',
      copyright: 'All rights reserved',
      madeInFrance: 'Made with ❤️ in France'
    },
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      update: 'Update',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      actions: 'Actions',
      viewAll: 'View All',
      learnMore: 'Learn More',
      getStarted: 'Get Started',
      tryFree: 'Try Free'
    }
  }
};

// Get nested translation value using dot notation
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

// Translation function
export function t(key: string, language: Language = 'fr'): string {
  return getNestedValue(translations[language], key);
}

// Language context will be created in a separate file to avoid circular dependencies
