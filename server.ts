import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  initDatabase,
  getAllProblems,
  insertProblem,
  updateProblemStatus,
  upvoteProblem,
  deleteProblem,
  getAllManifestoItems,
  insertManifestoItem,
  updateManifestoItem,
  deleteManifestoItem,
  deleteCompletedManifestos,
  resetManifestoItems,
  getLeaderProfile,
  updateLeaderProfile,
  getDatabaseStatus,
} from './server/db.ts';
import { INITIAL_MANIFESTO_ITEMS } from './src/data/manifestoData.ts';
import { ProblemReport, ManifestoItem, LeaderProfile } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Initialize Turso Database (local or cloud)
  try {
    await initDatabase();
  } catch (err) {
    console.error('[Turso DB] Initialization error:', err);
  }

  // ==========================================
  // API ROUTES
  // ==========================================

  // Database Status
  app.get('/api/status', async (_req: Request, res: Response) => {
    try {
      const status = await getDatabaseStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal database error' });
    }
  });

  // Problems: Get all
  app.get('/api/problems', async (_req: Request, res: Response) => {
    try {
      const problems = await getAllProblems();
      res.json(problems);
    } catch (err: any) {
      console.error('Failed to get problems:', err);
      res.status(500).json({ error: 'Failed to retrieve problems' });
    }
  });

  // Problems: Create new
  app.post('/api/problems', async (req: Request, res: Response) => {
    try {
      const problemData: ProblemReport = req.body;
      if (!problemData.id || !problemData.title || !problemData.ward) {
        return res.status(400).json({ error: 'Missing required problem fields' });
      }
      const created = await insertProblem(problemData);
      res.status(201).json(created);
    } catch (err: any) {
      console.error('Failed to create problem:', err);
      res.status(500).json({ error: 'Failed to record problem' });
    }
  });

  // Problems: Update status & notes
  app.patch('/api/problems/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, noteText, officerName } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      const updated = await updateProblemStatus(id, status, noteText, officerName);
      if (!updated) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json(updated);
    } catch (err: any) {
      console.error('Failed to update problem status:', err);
      res.status(500).json({ error: 'Failed to update problem' });
    }
  });

  // Problems: Upvote
  app.post('/api/problems/:id/upvote', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { delta } = req.body;
      const count = await upvoteProblem(id, typeof delta === 'number' ? delta : 1);
      res.json({ id, upvotes: count });
    } catch (err: any) {
      console.error('Failed to upvote problem:', err);
      res.status(500).json({ error: 'Failed to upvote problem' });
    }
  });

  // Problems: Delete
  app.delete('/api/problems/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await deleteProblem(id);
      if (!success) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json({ success: true, id });
    } catch (err: any) {
      console.error('Failed to delete problem:', err);
      res.status(500).json({ error: 'Failed to delete problem' });
    }
  });

  // Manifesto: Get all
  app.get('/api/manifesto', async (_req: Request, res: Response) => {
    try {
      const items = await getAllManifestoItems();
      res.json(items);
    } catch (err: any) {
      console.error('Failed to get manifesto items:', err);
      res.status(500).json({ error: 'Failed to retrieve manifesto items' });
    }
  });

  // Manifesto: Create new
  app.post('/api/manifesto', async (req: Request, res: Response) => {
    try {
      const item: ManifestoItem = req.body;
      if (!item.id || !item.titleBn) {
        return res.status(400).json({ error: 'Missing required manifesto item fields' });
      }
      const created = await insertManifestoItem(item);
      res.status(201).json(created);
    } catch (err: any) {
      console.error('Failed to create manifesto item:', err);
      res.status(500).json({ error: 'Failed to save manifesto item' });
    }
  });

  // Manifesto: Update item
  app.put('/api/manifesto/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const item: ManifestoItem = req.body;
      item.id = id;
      const updated = await updateManifestoItem(item);
      res.json(updated);
    } catch (err: any) {
      console.error('Failed to update manifesto item:', err);
      res.status(500).json({ error: 'Failed to update manifesto item' });
    }
  });

  // Manifesto: Delete single item
  app.delete('/api/manifesto/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await deleteManifestoItem(id);
      if (!success) {
        return res.status(404).json({ error: 'Manifesto item not found' });
      }
      res.json({ success: true, id });
    } catch (err: any) {
      console.error('Failed to delete manifesto item:', err);
      res.status(500).json({ error: 'Failed to delete manifesto item' });
    }
  });

  // Manifesto: Delete all completed items
  app.delete('/api/manifesto-completed/bulk', async (_req: Request, res: Response) => {
    try {
      const deletedCount = await deleteCompletedManifestos();
      res.json({ success: true, deletedCount });
    } catch (err: any) {
      console.error('Failed to delete completed manifestos:', err);
      res.status(500).json({ error: 'Failed to delete completed manifestos' });
    }
  });

  // Manifesto: Reset to defaults
  app.post('/api/manifesto/reset', async (_req: Request, res: Response) => {
    try {
      const items = await resetManifestoItems(INITIAL_MANIFESTO_ITEMS);
      res.json(items);
    } catch (err: any) {
      console.error('Failed to reset manifesto:', err);
      res.status(500).json({ error: 'Failed to reset manifesto' });
    }
  });

  // Leader Profile: Get
  app.get('/api/profile', async (_req: Request, res: Response) => {
    try {
      const profile = await getLeaderProfile();
      res.json(profile);
    } catch (err: any) {
      console.error('Failed to get leader profile:', err);
      res.status(500).json({ error: 'Failed to retrieve profile' });
    }
  });

  // Leader Profile: Update
  app.put('/api/profile', async (req: Request, res: Response) => {
    try {
      const profile: LeaderProfile = req.body;
      const updated = await updateLeaderProfile(profile);
      res.json(updated);
    } catch (err: any) {
      console.error('Failed to update leader profile:', err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // ==========================================
  // FRONTEND MOUNTING (Vite in dev, dist in prod)
  // ==========================================

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Dhamti Server] Listening on http://0.0.0.0:${PORT} (${isProd ? 'Production' : 'Development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Dhamti Server] Fatal error starting server:', err);
  process.exit(1);
});
