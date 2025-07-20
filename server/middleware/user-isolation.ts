import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Middleware pour filtrer automatiquement les données par utilisateur
export const enforceUserIsolation = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Ajouter l'ID utilisateur aux paramètres pour filtrage automatique
  req.query.userId = req.session.userId.toString();

  // Stocker l'ID utilisateur dans les locals pour accès facile
  res.locals.userId = req.session.userId;
  res.locals.userRole = req.session.userRole;

  next();
};

// Middleware spécialisé pour les ressources sensibles
export const enforceResourceOwnership = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.session?.userId;
    const resourceId = req.params.id;

    if (!userId || !resourceId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      // Vérifier que la ressource appartient à l'utilisateur
      const { storage } = await import('../storage');
      let isOwner = false;

      switch (resourceType) {
        case 'workshop':
          const workshop = await storage.getWorkshop(parseInt(resourceId));
          isOwner = workshop && workshop.createdById === userId;
          break;
        case 'session':
          const session = await storage.getWorkshopSession(parseInt(resourceId));
          isOwner = session && session.userId === userId;
          break;
        default:
          return res.status(400).json({ error: "Invalid resource type" });
      }

      if (!isOwner && req.session.userRole !== 'admin') {
        return res.status(403).json({ error: "Access denied - resource not owned by user" });
      }

      next();
    } catch (error) {
      console.error('Resource ownership check error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};

// Middleware pour vérifier l'ownership des ressources
// This middleware is replaced by the enforceResourceOwnership function
// export const enforceResourceOwnership = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const resourceId = parseInt(req.params.id);
//     const userId = req.session?.userId;
//     const userRole = req.session?.userRole;

//     if (!userId) {
//       return res.status(401).json({ error: 'Non authentifié' });
//     }

//     // Super admin et admin communauté ont accès à tout dans leur scope
//     if (userRole === 'super_admin') {
//       return next();
//     }

//     // Vérification de l'ownership selon le type de ressource
//     const path = req.path;
//     let hasAccess = false;

//     if (path.includes('/workshops/')) {
//       const workshop = await storage.getWorkshop(resourceId);
//       if (workshop) {
//         hasAccess = workshop.creatorId === userId || 
//                    (userRole === 'community_admin' && workshop.communityId === req.session.communityId);
//       }
//     } else if (path.includes('/workshop-sessions/')) {
//       const session = await storage.getWorkshopSession(resourceId);
//       if (session) {
//         hasAccess = session.userId === userId ||
//                    (userRole === 'community_admin' && 
//                     await checkCommunityAccess(session.userId, req.session.communityId));
//       }
//     } else if (path.includes('/challenges/')) {
//       const challenge = await storage.getChallenge(resourceId);
//       if (challenge) {
//         hasAccess = challenge.creatorId === userId ||
//                    (userRole === 'community_admin' && challenge.communityId === req.session.communityId);
//       }
//     }

//     if (!hasAccess) {
//       return res.status(403).json({ error: 'Accès refusé - Ressource non autorisée' });
//     }

//     next();
//   } catch (error) {
//     console.error('Erreur vérification ownership:', error);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// };

// Middleware pour filtrer les réponses selon le rôle et communauté
export const filterResponseByRole = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function(body: any) {
    const userId = req.session?.userId;
    const userRole = req.session?.userRole;
    const communityId = req.session?.communityId;

    if (!userId) {
      return originalJson.call(this, body);
    }

    // Filtrer les données selon l'isolation utilisateur
    if (Array.isArray(body)) {
      // Filtrer les listes d'objets
      const filteredBody = body.filter((item: any) => {
        return isUserAuthorizedForItem(item, userId, userRole, communityId);
      });
      return originalJson.call(this, filteredBody);
    } else if (body && typeof body === 'object') {
      // Filtrer les objets individuels
      if (body.users) {
        body.users = body.users.filter((user: any) => 
          isUserAuthorizedForItem(user, userId, userRole, communityId)
        );
      }
      if (body.workshops) {
        body.workshops = body.workshops.filter((workshop: any) => 
          isUserAuthorizedForItem(workshop, userId, userRole, communityId)
        );
      }
      if (body.sessions) {
        body.sessions = body.sessions.filter((session: any) => 
          isUserAuthorizedForItem(session, userId, userRole, communityId)
        );
      }
    }

    return originalJson.call(this, body);
  };

  next();
};

// Fonction utilitaire pour vérifier l'autorisation sur un item
function isUserAuthorizedForItem(item: any, userId: number, userRole: string, communityId?: number): boolean {
  // Super admin voit tout
  if (userRole === 'super_admin') {
    return true;
  }

  // Community admin voit sa communauté
  if (userRole === 'community_admin') {
    return item.communityId === communityId || item.creatorId === userId || item.userId === userId;
  }

  // Utilisateur normal voit seulement ses propres données
  return item.creatorId === userId || item.userId === userId || item.id === userId;
}

// Fonction pour vérifier l'accès communauté
async function checkCommunityAccess(targetUserId: number, communityId: number): Promise<boolean> {
  try {
    const user = await storage.getUser(targetUserId);
    return user?.communityId === communityId;
  } catch {
    return false;
  }
}

// Middleware pour metrics isolées par utilisateur
export const isolateUserMetrics = (req: Request, res: Response, next: NextFunction) => {
  // Ajouter des filtres automatiques pour les métriques
  if (req.path.includes('/analytics/') || req.path.includes('/stats')) {
    req.metricsFilters = {
      userId: req.session?.userId,
      communityId: req.session?.communityId,
      role: req.session?.userRole,
    };
  }
  next();
};

export default {
  enforceUserIsolation,
  enforceResourceOwnership,
  filterResponseByRole,
  isolateUserMetrics,
};