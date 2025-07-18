
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
    maxWorkshops: 5,
    maxSessionsPerDay: 3,
    maxSessionDuration: 120, // 2 heures
    allowedTools: ['bash', 'git', 'nano', 'curl', 'wget'],
    allowedCategories: ['docker', 'kubernetes', 'python'],
    maxCommunities: 1,
    maxCommunityMembers: 5,
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
    maxWorkshops: -1, // illimité
    maxSessionsPerDay: -1,
    maxSessionDuration: 480, // 8 heures
    allowedTools: ['bash', 'git', 'nano', 'curl', 'wget', 'docker', 'kubectl', 'helm', 'terraform', 'ansible'],
    allowedCategories: ['docker', 'kubernetes', 'python', 'nodejs', 'go', 'rust', 'java', 'devops', 'security'],
    maxCommunities: 10,
    maxCommunityMembers: 50,
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
