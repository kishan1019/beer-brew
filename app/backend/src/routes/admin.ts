import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { db } from '../db.js';
import { requireAdmin, signAdminToken } from '../middleware/auth.js';
import { computeStage, genCode } from '../logic.js';
import type { BatchRow, JournalPostRow } from '../types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomUUID() + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype) || /^video\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image or video files are allowed'));
  },
});

export const adminRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'brewhouse';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

adminRouter.post('/login', (req, res) => {
  const { password } = req.body || {};
  if (typeof password !== 'string' || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' });
  }
  res.cookie('admin_token', signAdminToken(), COOKIE_OPTS);
  res.json({ ok: true });
});

adminRouter.post('/logout', (_req, res) => {
  res.clearCookie('admin_token');
  res.json({ ok: true });
});

adminRouter.get('/session', requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

adminRouter.use(requireAdmin);

function batchSummary(b: BatchRow) {
  const stage = computeStage(b.brew_date, b.primary_days, b.conditioning_days, b.bottled_at);
  const guestCount = (db.prepare('SELECT COUNT(*) as c FROM pickup_bookings WHERE batch_id = ?').get(b.id) as any)?.c ?? 0;
  let pickup: null | { collected: number; total: number; daysLeft: number } = null;
  if (b.status === 'bottled' && b.bottled_at) {
    const total = (db.prepare('SELECT COUNT(*) as c FROM pickup_bookings WHERE batch_id = ?').get(b.id) as any)?.c ?? 0;
    const bookings = db.prepare('SELECT pb.slot_id FROM pickup_bookings pb WHERE pb.batch_id = ?').all(b.id) as { slot_id: string }[];
    let collected = 0;
    for (const bk of bookings) {
      const slot = db.prepare('SELECT ends_at FROM pickup_slots WHERE id = ?').get(bk.slot_id) as { ends_at: string } | undefined;
      if (slot && new Date(slot.ends_at).getTime() < Date.now()) collected++;
    }
    const closesAt = new Date(b.bottled_at).getTime() + b.pickup_window_days * 86400000;
    const daysLeft = Math.max(0, Math.ceil((closesAt - Date.now()) / 86400000));
    pickup = { collected, total: Math.max(total, b.seats), daysLeft };
  }
  return {
    id: b.id,
    name: b.name,
    style: b.style,
    volumeL: b.volume_l,
    brewDate: b.brew_date,
    seats: b.seats,
    code: b.code,
    status: b.status,
    bottledAt: b.bottled_at,
    guestCount,
    stage,
    pickup,
  };
}

adminRouter.get('/batches', (_req, res) => {
  const rows = db.prepare('SELECT * FROM batches ORDER BY created_at DESC').all() as BatchRow[];
  res.json({ batches: rows.map(batchSummary) });
});

adminRouter.get('/batches/:id', (req, res) => {
  const b = db.prepare('SELECT * FROM batches WHERE id = ?').get(req.params.id) as BatchRow | undefined;
  if (!b) return res.status(404).json({ error: 'Not found' });
  const posts = db.prepare('SELECT * FROM journal_posts WHERE batch_id = ? ORDER BY day DESC, posted_at DESC').all(b.id) as JournalPostRow[];
  res.json({
    batch: {
      ...batchSummary(b),
      grainBill: JSON.parse(b.grain_bill),
      hops: JSON.parse(b.hops),
      yeast: JSON.parse(b.yeast),
      og: b.og,
      fg: b.fg,
      abv: b.abv,
      ibu: b.ibu,
      whatsHappening: b.whats_happening,
      hostName: b.host_name,
      location: b.location,
      recipeSrc: b.recipe_src,
    },
    posts,
  });
});

adminRouter.post('/batches', (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Batch name is required' });
  const style = String(body.style || '').trim();
  const volumeL = Number(body.volumeL) || 20;
  const brewDate = String(body.brewDate || new Date().toISOString().slice(0, 10));
  const seats = Number(body.seats) || 6;
  const primaryDays = Number(body.primaryDays) || 11;
  const conditioningDays = Number(body.conditioningDays) || 13;
  const og = String(body.og || '');
  const fg = String(body.fg || '');
  const abv = String(body.abv || '');
  const ibu = String(body.ibu || '');
  const grainBill = Array.isArray(body.grainBill) ? body.grainBill : [];
  const hops = Array.isArray(body.hops) ? body.hops : [];
  const yeast = body.yeast && typeof body.yeast === 'object' ? body.yeast : {};
  const recipeSrc = String(body.recipeSrc || '');

  const exists = (code: string) => !!db.prepare('SELECT 1 FROM batches WHERE code = ?').get(code);
  const preferred = typeof body.preferredCode === 'string' ? body.preferredCode.trim().toUpperCase() : '';
  const code = preferred && /^[A-Z]+-\d{3}$/.test(preferred) && !exists(preferred) ? preferred : genCode(exists);
  const id = crypto.randomUUID();

  db.prepare(
    `INSERT INTO batches (id,name,style,volume_l,brew_date,seats,code,status,primary_days,conditioning_days,
      bottled_at,pickup_window_days,og,fg,abv,ibu,grain_bill,hops,yeast,whats_happening,host_name,location,recipe_src,created_at)
     VALUES (?,?,?,?,?,?,?, 'active', ?,?, NULL, 20, ?,?,?,?,?,?,?, '', 'Joris', 'Kitchen Brewery · Amsterdam', ?, ?)`
  ).run(
    id, name, style, volumeL, brewDate, seats, code, primaryDays, conditioningDays,
    og, fg, abv, ibu, JSON.stringify(grainBill), JSON.stringify(hops), JSON.stringify(yeast), recipeSrc,
    new Date().toISOString()
  );

  const b = db.prepare('SELECT * FROM batches WHERE id = ?').get(id) as BatchRow;
  res.status(201).json({ batch: batchSummary(b) });
});

adminRouter.post('/batches/:id/bottle', (req, res) => {
  const b = db.prepare('SELECT * FROM batches WHERE id = ?').get(req.params.id) as BatchRow | undefined;
  if (!b) return res.status(404).json({ error: 'Not found' });
  if (b.status === 'bottled') return res.status(400).json({ error: 'Already bottled' });

  const now = new Date();
  db.prepare('UPDATE batches SET status = ?, bottled_at = ? WHERE id = ?').run('bottled', now.toISOString(), b.id);

  const day = (offset: number, startH: number, startM: number, endH: number, endM: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    const start = new Date(d); start.setHours(startH, startM, 0, 0);
    const end = new Date(d); end.setHours(endH, endM, 0, 0);
    return { start, end };
  };
  const slots = [
    { ...day(0, 14, 0, 17, 0), label: 'Bottling-day open house', note: 'Taste it flat, take it home' },
    { ...day(9, 18, 0, 21, 0), label: 'Midweek pickup', note: 'Properly carbonated by now' },
    { ...day(b.pickup_window_days - 1, 11, 0, 15, 0), label: 'Last call', note: 'Window shuts sharp' },
  ];
  const insertSlot = db.prepare('INSERT INTO pickup_slots (id,batch_id,label,note,starts_at,ends_at) VALUES (?,?,?,?,?,?)');
  for (const s of slots) {
    insertSlot.run(crypto.randomUUID(), b.id, s.label, s.note, s.start.toISOString(), s.end.toISOString());
  }

  const updated = db.prepare('SELECT * FROM batches WHERE id = ?').get(b.id) as BatchRow;
  res.json({ batch: batchSummary(updated) });
});

adminRouter.post('/batches/:id/journal', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'video', maxCount: 1 }]), (req, res) => {
  const b = db.prepare('SELECT * FROM batches WHERE id = ?').get(req.params.id) as BatchRow | undefined;
  if (!b) return res.status(404).json({ error: 'Not found' });

  const body = req.body || {};
  const title = String(body.title || '').trim();
  const bodyText = String(body.body || '').trim();
  if (!title && !bodyText) return res.status(400).json({ error: 'Add a title or a note' });

  const stage = computeStage(b.brew_date, b.primary_days, b.conditioning_days, b.bottled_at);
  const files = req.files as { photo?: Express.Multer.File[]; video?: Express.Multer.File[] } | undefined;
  const photoUrl = files?.photo?.[0] ? `/uploads/${files.photo[0].filename}` : null;
  const videoUrl = files?.video?.[0] ? `/uploads/${files.video[0].filename}` : null;

  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO journal_posts (id,batch_id,day,title,body,photo_url,video_url,sg,temp_c,bubbles_per_min,taste_note,posted_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id, b.id, stage.currentDay, title || `Day ${stage.currentDay} update`, bodyText,
    photoUrl, videoUrl,
    body.sg ? String(body.sg) : null,
    body.tempC ? String(body.tempC) : null,
    body.bubblesPerMin ? String(body.bubblesPerMin) : null,
    body.tasteNote ? String(body.tasteNote) : null,
    new Date().toISOString()
  );

  const post = db.prepare('SELECT * FROM journal_posts WHERE id = ?').get(id) as JournalPostRow;
  res.status(201).json({ post });
});
