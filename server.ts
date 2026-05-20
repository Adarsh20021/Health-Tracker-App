import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import authRoutes from './server/routes/auth.js';
import logRoutes from './server/routes/log.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser middleware
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api', logRoutes);

  // Health API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      dbType: authRoutes, // Just to reference
      timestamp: new Date().toISOString()
    });
  });

  // Vite setup for local application hosting
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start health tracker server:', err);
});
