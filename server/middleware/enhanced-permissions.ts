import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  scope: 'global' | 'community' | 'own';
}

export interface EnhancedUser {
  id: number;
  role: 'super_admin' | 'community_admin' | 'workshop_creator' | 'user';
  communityId?: number;
  permissions?: string[];
}

interface AuthenticatedRequest extends Request {
  user?: EnhancedUser;
}

// Définition des permissions par rôle
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: [
    { resource: '*', action: 'manage', scope: 'global' },
    { resource: 'infrastructure', action: 'manage', scope: 'global' },
    { resource: 'communities', action: 'manage', scope: 'global' },
    { resource: 'users', action: 'manage', scope: 'global' },
    { resource: 'workshops', action: 'manage', scope: 'global' },
    { resource: 'billing', action: 'manage', scope: 'global' }
  ],
  community_admin: [
    { resource: 'community', action: 'manage', scope: 'community' },
    { resource: 'users', action: 'manage', scope: 'community' },
    { resource: 'workshops', action: 'manage', scope: 'community' },
    { resource: 'resources', action: 'read', scope: 'community' },
    { resource: 'billing', action: 'read', scope: 'community' }
  ],
  workshop_creator: [
    { resource: 'workshops', action: 'create', scope: 'community' },
    { resource: 'workshops', action: 'manage', scope: 'own' },
    { resource: 'resources', action: 'read', scope: 'own' },
    { resource: 'profile', action: 'manage', scope: 'own' }
  ],
  user: [
    { resource: 'workshops', action: 'read', scope: 'community' },
    { resource: 'workshops', action: 'create', scope: 'own' },
    { resource: 'profile', action: 'manage', scope: 'own' },
    { resource: 'progress', action: 'manage', scope: 'own' }
  ]
};

/**
 * Vérifie si l'utilisateur a la permission requise
 */
export function hasPermission(
  user: EnhancedUser, 
  required: Permission, 
  resourceOwnerId?: number,
  resourceCommunityId?: number
): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];

  for (const permission of userPermissions) {
    // Vérification du wildcard pour super admin
    if (permission.resource === '*' && permission.action === 'manage') {
      return true;
    }

    // Vérification de la ressource
    if (permission.resource !== required.resource) {
      continue;
    }

    // Vérification de l'action
    if (permission.action !== required.action && permission.action !== 'manage') {
      continue;
    }

    // Vérification du scope
    switch (permission.scope) {
      case 'global':
        return true;
      
      case 'community':
        if (required.scope === 'community' || required.scope === 'own') {
          return user.communityId === resourceCommunityId;
        }
        return true;
      
      case 'own':
        if (required.scope === 'own') {
          return user.id === resourceOwnerId;
        }
        return false;
    }
  }

  return false;
}

/**
 * Middleware pour vérifier les permissions
 */
export function requirePermission(permission: Permission) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let resourceOwnerId: number | undefined;
    let resourceCommunityId: number | undefined;

    // Extraction des IDs depuis les paramètres
    if (req.params.userId) {
      resourceOwnerId = parseInt(req.params.userId);
    }
    if (req.params.communityId) {
      resourceCommunityId = parseInt(req.params.communityId);
    }
    if (req.params.workshopId) {
      // Récupérer les infos du workshop pour obtenir l'owner
      try {
        const workshop = await storage.getWorkshop(parseInt(req.params.workshopId));
        if (workshop) {
          resourceOwnerId = workshop.creatorId;
          resourceCommunityId = workshop.communityId ?? undefined;
        }
      } catch (error) {
        console.error('Error fetching workshop for permission check:', error);
      }
    }

    if (!hasPermission(req.user, permission, resourceOwnerId, resourceCommunityId)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: permission,
        userRole: req.user.role,
        userCommunity: req.user.communityId
      });
    }

    next();
  };
}

/**
 * Middleware pour les actions sur les workshops
 */
export function requireWorkshopPermission(action: 'create' | 'read' | 'update' | 'delete') {
  return requirePermission({
    resource: 'workshops',
    action,
    scope: action === 'read' ? 'community' : 'own'
  });
}

/**
 * Middleware pour les actions sur les communautés
 */
export function requireCommunityPermission(action: 'create' | 'read' | 'update' | 'delete') {
  return requirePermission({
    resource: 'community',
    action,
    scope: action === 'create' ? 'global' : 'community'
  });
}

/**
 * Middleware pour les actions d'administration des utilisateurs
 */
export function requireUserManagement(scope: 'global' | 'community' = 'community') {
  return requirePermission({
    resource: 'users',
    action: 'manage',
    scope
  });
}

/**
 * Filtre les données selon les permissions de l'utilisateur
 */
export function filterByPermissions<T extends { ownerId?: number; communityId?: number }>(
  user: EnhancedUser,
  data: T[],
  resource: string
): T[] {
  if (user.role === 'super_admin') {
    return data; // Super admin voit tout
  }

  return data.filter(item => {
    if (user.role === 'community_admin') {
      return item.communityId === user.communityId;
    }
    
    if (user.role === 'workshop_creator' || user.role === 'user') {
      // Voir les ressources de sa communauté + ses propres ressources
      return item.communityId === user.communityId || item.ownerId === user.id;
    }

    return false;
  });
}

/**
 * Journalisation des actions avec permissions
 */
export function auditAction(action: string, resource: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.json;
    
    res.json = function(body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        // Log successful actions
        console.log({
          timestamp: new Date().toISOString(),
          userId: req.user.id,
          userRole: req.user.role,
          action,
          resource,
          method: req.method,
          path: req.path,
          ip: req.ip,
          statusCode: res.statusCode
        });

        // TODO: Sauvegarder dans la base de données
        // storage.createAuditLog({
        //   userId: req.user.id,
        //   action,
        //   resource,
        //   method: req.method,
        //   path: req.path,
        //   ip: req.ip,
        //   metadata: req.body
        // });
      }
      
      return originalSend.call(this, body);
    };

    next();
  };
}

export default {
  requirePermission,
  requireWorkshopPermission,
  requireCommunityPermission,
  requireUserManagement,
  hasPermission,
  filterByPermissions,
  auditAction
};