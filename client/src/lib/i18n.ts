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
      title: 'Master Tech Through Practice',
      subtitle: 'La plateforme cloud-native pour des ateliers techniques immersifs',
      description: 'Formez vos équipes sur Docker, Kubernetes, IA/ML et les technologies cloud avec des environnements interactifs et sécurisés.',
      startFree: 'Commencer Gratuitement',
      exploreWorkshops: 'Explorer les Ateliers',
      startJourney: 'Démarrer votre Parcours',
      freeToStart: 'Gratuit pour commencer',
      noCreditCard: 'Aucune carte de crédit requise',
      enterpriseReady: 'Prêt pour l\'entreprise'
    },
    // Workshop Section
    workshops: {
      title: 'Explorez nos Ateliers Interactifs',
      description: 'Plongez dans l\'apprentissage pratique avec des environnements préconfigurés et des scénarios du monde réel. Nos ateliers couvrent tout, de Docker et Kubernetes à l\'IA/ML et la cybersécurité.',
      seeAll: 'Voir tous les Ateliers',
      dockerFundamentals: 'Fondamentaux Docker',
      interactiveContainer: 'Atelier Conteneur Interactif',
      terminal: 'Terminal',
      containerStarted: 'Conteneur démarré avec succès ✓'
    },
    // Technologies
    technologies: {
      docker: 'Docker',
      kubernetes: 'Kubernetes',
      python: 'Python',
      aiml: 'IA/ML',
      cloud: 'Cloud',
      devops: 'DevOps'
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
    // Stats & Features
    stats: {
      activeUsers: 'Utilisateurs Actifs',
      workshopsCompleted: 'Ateliers Terminés', 
      companiesUsing: 'Entreprises Utilisatrices',
      successRate: 'Taux de Réussite'
    },
    features: {
      whyChoose: 'Pourquoi Choisir Nalabo?',
      builtFor: 'Conçu pour les équipes de développement modernes et l\'échelle d\'entreprise',
      enterpriseUseCases: 'Cas d\'Usage Entreprise',
      accelerateTeams: 'Découvrez comment les entreprises leaders utilisent Nalabo pour accélérer leurs équipes'
    },
    // Pricing & Plans
    pricing: {
      freemium: 'Gratuit',
      enterprise: 'Entreprise',
      custom: 'Sur Mesure',
      perfectFor: 'Parfait pour les développeurs individuels',
      forTeams: 'Pour les équipes et organisations',
      contactSales: 'Contacter les Ventes'
    },
    // Community & Admin
    community: {
      management: 'Gestion des Communautés',
      members: 'Membres',
      settings: 'Paramètres',
      permissions: 'Permissions',
      createCommunity: 'Créer une Communauté',
      joinCommunity: 'Rejoindre une Communauté'
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
      insufficientPermissions: 'Permissions insuffisantes'
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
      actions: 'Actions'
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
      subtitle: 'The cloud-native platform for immersive technical workshops',
      description: 'Train your teams on Docker, Kubernetes, AI/ML and cloud technologies with interactive and secure environments.',
      startFree: 'Start Free',
      exploreWorkshops: 'Explore Workshops',
      startJourney: 'Start Your Journey',
      freeToStart: 'Free to start',
      noCreditCard: 'No credit card required',
      enterpriseReady: 'Enterprise ready'
    },
    // Workshop Section
    workshops: {
      title: 'Explore our Interactive Workshops',
      description: 'Dive into hands-on learning with pre-configured environments and real-world scenarios. Our workshops cover everything from Docker and Kubernetes to AI/ML and cybersecurity.',
      seeAll: 'See All Workshops',
      dockerFundamentals: 'Docker Fundamentals',
      interactiveContainer: 'Interactive Container Workshop',
      terminal: 'Terminal',
      containerStarted: 'Container started successfully ✓'
    },
    // Technologies
    technologies: {
      docker: 'Docker',
      kubernetes: 'Kubernetes',
      python: 'Python',
      aiml: 'AI/ML',
      cloud: 'Cloud',
      devops: 'DevOps'
    },
    // Stats & Features
    stats: {
      activeUsers: 'Active Users',
      workshopsCompleted: 'Workshops Completed',
      companiesUsing: 'Companies Using',
      successRate: 'Success Rate'
    },
    features: {
      whyChoose: 'Why Choose Nalabo?',
      builtFor: 'Built for modern development teams and enterprise scale',
      enterpriseUseCases: 'Enterprise Use Cases',
      accelerateTeams: 'See how leading companies use Nalabo to accelerate their teams'
    },
    // Pricing & Plans
    pricing: {
      freemium: 'Free',
      enterprise: 'Enterprise',
      custom: 'Custom',
      perfectFor: 'Perfect for individual developers',
      forTeams: 'For teams and organizations',
      contactSales: 'Contact Sales'
    },
    // Community & Admin
    community: {
      management: 'Community Management',
      members: 'Members',
      settings: 'Settings',
      permissions: 'Permissions',
      createCommunity: 'Create Community',
      joinCommunity: 'Join Community'
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
      insufficientPermissions: 'Insufficient Permissions'
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
      actions: 'Actions'
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