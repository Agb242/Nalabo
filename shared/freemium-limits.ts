
export interface FreemiumLimits {
  maxWorkshops: number;
  maxSessionsPerDay: number;
  maxSessionDuration: number; // en minutes
  allowedTools: string[];
  allowedCategories: string[];
  maxCommunities: number;
  maxCommunityMembers: number;
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  features: {
    aiAssistant: boolean;
    advancedAnalytics: boolean;
    customBranding: boolean;
    ssoIntegration: boolean;
    apiAccess: boolean;
    privateCommunities: boolean;
    bulkUserManagement: boolean;
    customRoles: boolean;
  };
}

export const FREEMIUM_PLANS: Record<string, FreemiumLimits> = {
  free: {
    maxWorkshops: 2, // Réduit pour économiser les ressources
    maxSessionsPerDay: 1, // Une session par jour seulement
    maxSessionDuration: 30, // 30 minutes max (très limité)
    allowedTools: ['bash', 'nano'], // Outils basiques uniquement
    allowedCategories: ['docker'], // Une seule catégorie
    maxCommunities: 0, // Pas de communautés en gratuit
    maxCommunityMembers: 0,
    supportLevel: 'community',
    features: {
      aiAssistant: false,
      advancedAnalytics: false,
      customBranding: false,
      ssoIntegration: false,
      apiAccess: false,
      privateCommunities: false,
      bulkUserManagement: false,
      customRoles: false,
    }
  },
  pro: {
    maxWorkshops: 20, // Limité mais généreux
    maxSessionsPerDay: 10, // 10 sessions par jour
    maxSessionDuration: 240, // 4 heures max
    allowedTools: ['bash', 'git', 'nano', 'curl', 'wget', 'docker', 'kubectl', 'python', 'node'],
    allowedCategories: ['docker', 'kubernetes', 'python', 'nodejs', 'devops'],
    maxCommunities: 3, // Réduit pour gérer les coûts
    maxCommunityMembers: 25, // Réduit également
    supportLevel: 'email',
    features: {
      aiAssistant: true,
      advancedAnalytics: true,
      customBranding: false,
      ssoIntegration: false,
      apiAccess: true,
      privateCommunities: true,
      bulkUserManagement: false,
      customRoles: true,
    }
  },
  enterprise: {
    maxWorkshops: -1,
    maxSessionsPerDay: -1,
    maxSessionDuration: -1,
    allowedTools: [], // tous les outils
    allowedCategories: [], // toutes les catégories
    maxCommunities: -1,
    maxCommunityMembers: -1,
    supportLevel: 'dedicated',
    features: {
      aiAssistant: true,
      advancedAnalytics: true,
      customBranding: true,
      ssoIntegration: true,
      apiAccess: true,
      privateCommunities: true,
      bulkUserManagement: true,
      customRoles: true,
    }
  }
};

export function getUserLimits(userPlan: string): FreemiumLimits {
  return FREEMIUM_PLANS[userPlan] || FREEMIUM_PLANS.free;
}

export function canUserPerformAction(
  userPlan: string,
  action: string,
  currentUsage: any
): { allowed: boolean; reason?: string } {
  const limits = getUserLimits(userPlan);
  
  switch (action) {
    case 'create_workshop':
      if (limits.maxWorkshops > 0 && currentUsage.workshops >= limits.maxWorkshops) {
        return { allowed: false, reason: `Limite de ${limits.maxWorkshops} ateliers atteinte` };
      }
      break;
    
    case 'start_session':
      if (limits.maxSessionsPerDay > 0 && currentUsage.sessionsToday >= limits.maxSessionsPerDay) {
        return { allowed: false, reason: `Limite de ${limits.maxSessionsPerDay} sessions par jour atteinte` };
      }
      break;
    
    case 'use_tool':
      if (limits.allowedTools.length > 0 && !limits.allowedTools.includes(currentUsage.tool)) {
        return { allowed: false, reason: `Outil ${currentUsage.tool} non disponible dans votre plan` };
      }
      break;
    
    case 'create_community':
      if (limits.maxCommunities > 0 && currentUsage.communities >= limits.maxCommunities) {
        return { allowed: false, reason: `Limite de ${limits.maxCommunities} communautés atteinte` };
      }
      break;
  }
  
  return { allowed: true };
}
