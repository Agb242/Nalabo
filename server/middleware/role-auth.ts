import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: UserRole;
    communityId?: number;
  };
}

export function requireRole(requiredRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredRoles,
        current: req.user.role 
      });
    }

    next();
  };
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return requireRole(['admin', 'super_admin'])(req, res, next);
}

export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return requireRole(['super_admin'])(req, res, next);
}

// Enhanced permission checking with community-based access
export function requireCommunityAccess(action: 'read' | 'write' | 'admin') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { user } = req;
    const requestedCommunityId = req.params.communityId ? parseInt(req.params.communityId) : null;

    // Super admin has access to everything
    if (user.role === 'super_admin') {
      return next();
    }

    // Community admin has full access to their community
    if (user.role === 'admin' && user.communityId === requestedCommunityId) {
      return next();
    }

    // Regular users can only access their own community for read operations
    if (action === 'read' && user.communityId === requestedCommunityId) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Insufficient community permissions',
      action,
      userCommunity: user.communityId,
      requestedCommunity: requestedCommunityId
    });
  };
}

// Audit logging for sensitive operations
export function auditLog(action: string, resource: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.json;
    
    res.json = function(body: any) {
      // Log the action after successful completion
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        console.log({
          timestamp: new Date().toISOString(),
          userId: req.user.id,
          role: req.user.role,
          action,
          resource,
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          status: res.statusCode
        });

        // TODO: Store audit logs in database
        // storage.createAuditLog({
        //   userId: req.user.id,
        //   action,
        //   resource,
        //   metadata: {
        //     method: req.method,
        //     path: req.path,
        //     ip: req.ip,
        //     userAgent: req.get('User-Agent')
        //   }
        // });
      }
      
      return originalSend.call(this, body);
    };

    next();
  };
}

// Rate limiting for sensitive endpoints
export function rateLimitSensitive() {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  const LIMIT = 10; // 10 attempts
  const WINDOW = 15 * 60 * 1000; // 15 minutes

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = `${req.ip}-${req.user?.id || 'anonymous'}`;
    const now = Date.now();
    
    const userAttempts = attempts.get(key);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + WINDOW });
      return next();
    }
    
    if (userAttempts.count >= LIMIT) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        resetTime: userAttempts.resetTime
      });
    }
    
    userAttempts.count++;
    next();
  };
}