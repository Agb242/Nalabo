
import { Request, Response, NextFunction } from 'express';
import { getUserLimits, canUserPerformAction } from '../../shared/freemium-limits';
import { storage } from '../storage';

export interface FreemiumRequest extends Request {
  userLimits?: any;
  userUsage?: any;
}

export const checkFreemiumLimits = (action: string) => {
  return async (req: FreemiumRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: 'Authentification requise' });
      }

      // Obtenir les informations utilisateur
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const userPlan = user.plan || 'free';
      const userLimits = getUserLimits(userPlan);

      // Obtenir l'utilisation actuelle
      const userUsage = await storage.getUserUsage(req.session.userId);

      // Vérifier les limites
      const actionCheck = canUserPerformAction(userPlan, action, {
        ...userUsage,
        ...req.body,
        ...req.params
      });

      if (!actionCheck.allowed) {
        return res.status(403).json({ 
          error: 'Limite atteinte',
          message: actionCheck.reason,
          currentPlan: userPlan,
          limits: userLimits
        });
      }

      // Ajouter les informations au request
      req.userLimits = userLimits;
      req.userUsage = userUsage;

      next();
    } catch (error) {
      console.error('Freemium middleware error:', error);
      res.status(500).json({ error: 'Erreur interne' });
    }
  };
};

export const filterByPlan = (feature: string) => {
  return (req: FreemiumRequest, res: Response, next: NextFunction) => {
    if (!req.userLimits) {
      return res.status(500).json({ error: 'Limites utilisateur non chargées' });
    }

    const hasFeature = req.userLimits.features[feature];
    if (!hasFeature) {
      return res.status(403).json({ 
        error: 'Fonctionnalité non disponible',
        message: `La fonctionnalité "${feature}" n'est pas disponible dans votre plan`,
        currentPlan: req.userLimits.plan
      });
    }

    next();
  };
};
