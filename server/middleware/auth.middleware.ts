import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database';
import { User } from '../../src/types';

// Extend Express Request type to include currentUser
declare global {
  namespace Express {
    interface Request {
      currentUser?: User | null;
      userId?: string;
    }
  }
}

export const attachUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const xUserId = req.headers['x-user-id'] as string;

    let userId: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      userId = authHeader.split(' ')[1];
    } else if (xUserId) {
      userId = xUserId;
    }

    if (userId) {
      const user = await db.getUserById(userId);
      req.currentUser = user;
      req.userId = userId;
    } else {
      req.currentUser = null;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.currentUser) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in.',
    });
  }
  next();
};
