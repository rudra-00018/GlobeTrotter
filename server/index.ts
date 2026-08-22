import express from 'express';
import cors from 'cors';
import { config } from './config';
import { attachUser } from './middleware/auth.middleware';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { tripRouter } from './routes/trip.routes';
import { cityRouter } from './routes/city.routes';
import { activityRouter } from './routes/activity.routes';
import { aiRouter } from './routes/ai.routes';
import { adminRouter } from './routes/admin.routes';
import { hospitalityRouter } from './routes/hospitality.routes';
import { db } from './db/database';

const app = express();

// Middleware
app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Attach user session/identity to request
app.use(attachUser);

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const users = await db.getUsers();
    const trips = await db.getTrips();
    res.json({
      status: 'ok',
      service: 'GlobeTrotter Backend API',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        usersCount: users.length,
        tripsCount: trips.length,
      },
      geminiConfigured: Boolean(config.geminiApiKey && config.geminiApiKey !== 'MY_GEMINI_API_KEY'),
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/trips', tripRouter);
app.use('/api/cities', cityRouter);
app.use('/api/activities', activityRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);
app.use('/api/hospitality', hospitalityRouter);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `Endpoint ${req.method} ${req.originalUrl} not found` });
});

// Error handling middleware
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 GlobeTrotter Backend listening on http://localhost:${config.port}`);
    console.log(`📡 Healthcheck available at http://localhost:${config.port}/api/health`);
  });
}

export default app;
