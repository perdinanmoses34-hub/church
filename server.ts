import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory data store for fast real-time sync across all connected devices
const syncStore = new Map<string, { payload: string; updatedAt: number }>();
const sseClients = new Set<Response>();

// File cache path to preserve data across server restarts
const CACHE_DIR = path.resolve(__dirname, 'data');
const CACHE_FILE = path.join(CACHE_DIR, 'cloud_sync_cache.json');
const FIREBASE_CONFIG_FILE = path.join(CACHE_DIR, 'custom_firebase_config.json');

let activeCustomFirebaseConfig: any = null;

try {
  if (fs.existsSync(FIREBASE_CONFIG_FILE)) {
    const raw = fs.readFileSync(FIREBASE_CONFIG_FILE, 'utf-8');
    activeCustomFirebaseConfig = JSON.parse(raw);
    console.log('[ServerSync] Loaded custom Firebase config for project:', activeCustomFirebaseConfig.projectId);
  }
} catch (e) {
  console.warn('[ServerSync] Custom config load note:', e);
}

// Ensure cache directory exists and load persisted data
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([k, v]: [string, any]) => {
      syncStore.set(k, {
        payload: typeof v?.payload === 'string' ? v.payload : JSON.stringify(v?.payload ?? v),
        updatedAt: v?.updatedAt || Date.now()
      });
    });
    console.log(`[ServerSync] Restored ${syncStore.size} collections from disk cache.`);
  }
} catch (e) {
  console.warn('[ServerSync] Cache load note:', e);
}

// Save store to disk periodically
let saveTimeout: NodeJS.Timeout | null = null;
function persistStoreToDisk() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const obj: Record<string, any> = {};
      syncStore.forEach((val, key) => {
        obj[key] = val;
      });
      fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[ServerSync] Cache save error:', e);
    }
  }, 1000);
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // SSE (Server-Sent Events) Endpoint for instant Real-time Multi-Device Sync
  app.get('/api/sync/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Send initial handshake
    res.write(`data: ${JSON.stringify({ type: 'connected', time: Date.now(), totalRecords: syncStore.size })}\n\n`);

    sseClients.add(res);

    const heartbeat = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch {
        clearInterval(heartbeat);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // Push updated data to all connected devices in real-time
  app.post('/api/sync/push', (req: Request, res: Response) => {
    try {
      const { key, payload, updatedAt } = req.body;
      if (!key) {
        return res.status(400).json({ success: false, error: 'Key is required' });
      }

      const stringPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const timestamp = updatedAt || Date.now();

      syncStore.set(key, { payload: stringPayload, updatedAt: timestamp });
      persistStoreToDisk();

      // Broadcast to all active clients (Mobile phones, desktop, tablets)
      const broadcastMsg = `data: ${JSON.stringify({
        type: 'sync',
        key,
        payload: stringPayload,
        updatedAt: timestamp
      })}\n\n`;

      let deliveredCount = 0;
      sseClients.forEach((client) => {
        try {
          client.write(broadcastMsg);
          deliveredCount++;
        } catch {
          sseClients.delete(client);
        }
      });

      return res.json({
        success: true,
        key,
        clientsNotified: deliveredCount,
        timestamp
      });
    } catch (err: any) {
      console.error('[ServerSync] Push error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Pull all synchronized documents
  app.get('/api/sync/pull', (req: Request, res: Response) => {
    const data: Record<string, { payload: string; updatedAt: number }> = {};
    syncStore.forEach((val, k) => {
      data[k] = val;
    });
    return res.json({
      success: true,
      count: syncStore.size,
      data
    });
  });

  // Reset Quota & Status endpoint
  app.post('/api/sync/reset-quota', (req: Request, res: Response) => {
    const broadcastMsg = `data: ${JSON.stringify({ type: 'quota_reset', time: Date.now() })}\n\n`;
    sseClients.forEach((client) => {
      try {
        client.write(broadcastMsg);
      } catch {
        sseClients.delete(client);
      }
    });
    return res.json({ success: true, message: 'Status kuota berhasil direset.' });
  });

  // Get active custom Firebase configuration (accessible by mobile phones & all instances)
  app.get('/api/firebase-config', (req: Request, res: Response) => {
    return res.json({
      isCustom: !!activeCustomFirebaseConfig,
      config: activeCustomFirebaseConfig || null
    });
  });

  // Save active custom Firebase configuration across all connected devices
  app.post('/api/firebase-config', (req: Request, res: Response) => {
    try {
      const { config } = req.body;
      if (config && config.apiKey && config.projectId) {
        activeCustomFirebaseConfig = {
          apiKey: String(config.apiKey).trim(),
          projectId: String(config.projectId).trim(),
          authDomain: config.authDomain ? String(config.authDomain).trim() : `${String(config.projectId).trim()}.firebaseapp.com`,
          storageBucket: config.storageBucket ? String(config.storageBucket).trim() : `${String(config.projectId).trim()}.firebasestorage.app`,
          messagingSenderId: config.messagingSenderId ? String(config.messagingSenderId).trim() : '',
          appId: config.appId ? String(config.appId).trim() : '',
          firestoreDatabaseId: config.firestoreDatabaseId && String(config.firestoreDatabaseId).trim() ? String(config.firestoreDatabaseId).trim() : '(default)'
        };
        fs.writeFileSync(FIREBASE_CONFIG_FILE, JSON.stringify(activeCustomFirebaseConfig, null, 2), 'utf-8');

        // Broadcast to all connected clients
        const broadcastMsg = `data: ${JSON.stringify({ type: 'firebase_config_updated', config: activeCustomFirebaseConfig })}\n\n`;
        sseClients.forEach((client) => {
          try {
            client.write(broadcastMsg);
          } catch {
            sseClients.delete(client);
          }
        });
        return res.json({ success: true, message: 'Firebase configuration saved and broadcasted to all devices.', config: activeCustomFirebaseConfig });
      } else {
        activeCustomFirebaseConfig = null;
        if (fs.existsSync(FIREBASE_CONFIG_FILE)) {
          fs.unlinkSync(FIREBASE_CONFIG_FILE);
        }
        const broadcastMsg = `data: ${JSON.stringify({ type: 'firebase_config_reset' })}\n\n`;
        sseClients.forEach((client) => {
          try {
            client.write(broadcastMsg);
          } catch {
            sseClients.delete(client);
          }
        });
        return res.json({ success: true, message: 'Reset to default Firebase configuration.' });
      }
    } catch (err: any) {
      console.error('[ServerSync] Firebase config save error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Status check endpoint
  app.get('/api/sync/status', (req: Request, res: Response) => {
    return res.json({
      status: 'online',
      activeClients: sseClients.size,
      cachedCollections: syncStore.size,
      uptime: process.uptime(),
      time: new Date().toISOString()
    });
  });

  // Mount Vite middleware in development
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Server] CMS Gereja Full-Stack running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal bootstrap error:', err);
  process.exit(1);
});
