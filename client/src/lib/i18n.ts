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
      subtitle: 'La plateforme cloud-native pour des ateliers techniques immersifs. Formez vos équipes sur Docker, Kubernetes, IA/ML et les technologies de pointe.',
      startFree: 'Commencer Gratuitement',
      exploreWorkshops: 'Explorer les Ateliers'
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
      subtitle: 'The cloud-native platform for immersive technical workshops. Train your teams on Docker, Kubernetes, AI/ML and cutting-edge technologies.',
      startFree: 'Start Free Today',
      exploreWorkshops: 'Explore Workshops'
    },
    // Workshop Section
    workshops: {
      title: 'Explore Our Interactive Workshops',
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