import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const userRouter = Router();

// PUT /api/users/profile
userRouter.put('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id || req.body.id || req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const { name, photo, language, currency, bio, savedDestinations } = req.body;
    const updated = await db.updateUser(userId, {
      ...(name !== undefined && { name }),
      ...(photo !== undefined && { photo }),
      ...(language !== undefined && { language }),
      ...(currency !== undefined && { currency }),
      ...(bio !== undefined && { bio }),
      ...(savedDestinations !== undefined && { savedDestinations }),
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, user: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/users/save-destination
userRouter.post('/save-destination', async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id || req.body.userId || req.headers['x-user-id'] as string;
    const { cityId } = req.body;

    if (!cityId) {
      return res.status(400).json({ success: false, error: 'cityId is required' });
    }

    if (!userId) {
      // If not logged in, take the default user
      const users = await db.getUsers();
      if (users[0]) {
        const saved = await db.toggleSavedDestination(users[0].id, cityId);
        const updatedUser = await db.getUserById(users[0].id);
        return res.json({ success: true, savedDestinations: saved, user: updatedUser });
      }
      return res.status(400).json({ success: false, error: 'User not specified' });
    }

    const saved = await db.toggleSavedDestination(userId, cityId);
    const updatedUser = await db.getUserById(userId);
    return res.json({ success: true, savedDestinations: saved, user: updatedUser });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/users/account
userRouter.delete('/account', async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id || req.body.userId || req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const deleted = await db.deleteUser(userId);
    return res.json({ success: true, deleted, message: 'User account and trips removed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users/:id
userRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
