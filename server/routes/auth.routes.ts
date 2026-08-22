import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { User } from '../../src/types';

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await db.getUserByEmail(cleanEmail);

    if (!user) {
      // Auto-provision demo/new user for seamless onboarding
      const userName = cleanEmail.split('@')[0].replace('.', ' ');
      user = await db.createUser({
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        email: cleanEmail,
        photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        language: 'English (US)',
        currency: 'USD ($)',
        savedDestinations: ['paris', 'tokyo', 'rome'],
        role: cleanEmail.includes('admin') ? 'admin' : 'user',
        bio: 'Ready to discover extraordinary destinations across the globe!',
      });
    }

    return res.json({
      success: true,
      user,
      token: user.id,
      message: 'Signed in successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, language, currency } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.getUserByEmail(cleanEmail);
    if (existing) {
      return res.json({
        success: true,
        user: existing,
        token: existing.id,
        message: 'Account already exists. Signed in.',
      });
    }

    const newUser = await db.createUser({
      name: name?.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      language: language || 'English (US)',
      currency: currency || 'USD ($)',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      savedDestinations: ['paris', 'tokyo'],
      role: cleanEmail.includes('admin') ? 'admin' : 'user',
      bio: 'Excited traveler ready to plan my next grand adventure.',
    });

    return res.status(201).json({
      success: true,
      user: newUser,
      token: newUser.id,
      message: 'Account created successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    if (req.currentUser) {
      return res.json({ success: true, user: req.currentUser });
    }

    // Default fallback to first user if none specified
    const users = await db.getUsers();
    const defaultUser = users[0] || null;
    return res.json({ success: true, user: defaultUser });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/demo-users
authRouter.get('/demo-users', async (req: Request, res: Response) => {
  try {
    const users = await db.getUsers();
    return res.json({ success: true, users });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});
