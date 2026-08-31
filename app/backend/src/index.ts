import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminRouter } from './routes/admin.js';
import { guestRouter } from './routes/guest.js';
import './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/admin', adminRouter);
app.use('/api', guestRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Central error handler (e.g. multer file-type rejections)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'Something went wrong' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Brewhouse API listening on http://0.0.0.0:${PORT}`);
});
