import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { computeStage, computeStickers, whatsHappeningFor } from '../logic.js';
import type { BatchRow, JournalPostRow, PickupSlotRow, PickupBookingRow } from '../types.js';

export const guestRouter = Router();

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

function findBatchByCode(code: string): BatchRow | undefined {
  const norm = normalizeCode(code);
  const all = db.prepare('SELECT * FROM batches').all() as BatchRow[];
  return all.find((b) => normalizeCode(b.code) === norm);
}

guestRouter.post('/redeem', (req, res) => {
  const code = String((req.body || {}).code || '');
  const batch = findBatchByCode(code);
  if (!batch) return res.status(404).json({ error: "That code isn't pouring." });
  res.json({ code: batch.code });
});

guestRouter.get('/batches/:code', (req, res) => {
  const batch = findBatchByCode(req.params.code);
  if (!batch) return res.status(404).json({ error: 'Not found' });

  const guestId = String(req.query.guestId || '');
  const stage = computeStage(batch.brew_date, batch.primary_days, batch.conditioning_days, batch.bottled_at);
  const posts = db
    .prepare('SELECT * FROM journal_posts WHERE batch_id = ? ORDER BY day DESC, posted_at DESC')
    .all(batch.id) as JournalPostRow[];
  const slots = db.prepare('SELECT * FROM pickup_slots WHERE batch_id = ? ORDER BY starts_at ASC').all(batch.id) as PickupSlotRow[];

  let booking: PickupBookingRow | undefined;
  if (guestId) {
    booking = db.prepare('SELECT * FROM pickup_bookings WHERE batch_id = ? AND guest_id = ?').get(batch.id, guestId) as
      | PickupBookingRow
      | undefined;
  }

  const hasSgPost = posts.some((p) => !!p.sg);
  const stickers = computeStickers({
    hasSgPost,
    bottled: batch.status === 'bottled',
    collected: !!(booking && slots.find((s) => s.id === booking!.slot_id && new Date(s.ends_at).getTime() < Date.now())),
  });

  let pickupWindow: { opensAt: string; closesAt: string } | null = null;
  if (batch.bottled_at) {
    const opens = new Date(batch.bottled_at);
    const closes = new Date(opens.getTime() + batch.pickup_window_days * 86400000);
    pickupWindow = { opensAt: opens.toISOString(), closesAt: closes.toISOString() };
  }

  res.json({
    batch: {
      id: batch.id,
      name: batch.name,
      style: batch.style,
      volumeL: batch.volume_l,
      code: batch.code,
      status: batch.status,
      brewDate: batch.brew_date,
      hostName: batch.host_name,
      location: batch.location,
      og: batch.og,
      fg: batch.fg,
      abv: batch.abv,
      ibu: batch.ibu,
      grainBill: JSON.parse(batch.grain_bill),
      hops: JSON.parse(batch.hops),
      yeast: JSON.parse(batch.yeast),
      whatsHappening: whatsHappeningFor(stage.stage, batch.whats_happening),
      stage,
      pickupWindow,
    },
    posts,
    slots,
    booking: booking ? { slotId: booking.slot_id } : null,
    stickers,
  });
});

guestRouter.post('/batches/:code/pickup/book', (req, res) => {
  const batch = findBatchByCode(req.params.code);
  if (!batch) return res.status(404).json({ error: 'Not found' });
  const { guestId, slotId } = req.body || {};
  if (!guestId || !slotId) return res.status(400).json({ error: 'Missing guestId or slotId' });
  const slot = db.prepare('SELECT * FROM pickup_slots WHERE id = ? AND batch_id = ?').get(slotId, batch.id);
  if (!slot) return res.status(404).json({ error: 'Slot not found' });

  db.prepare(
    `INSERT INTO pickup_bookings (id, batch_id, guest_id, slot_id, created_at) VALUES (?,?,?,?,?)
     ON CONFLICT(batch_id, guest_id) DO UPDATE SET slot_id = excluded.slot_id`
  ).run(crypto.randomUUID(), batch.id, String(guestId), String(slotId), new Date().toISOString());

  res.json({ ok: true });
});

guestRouter.post('/batches/:code/pickup/unbook', (req, res) => {
  const batch = findBatchByCode(req.params.code);
  if (!batch) return res.status(404).json({ error: 'Not found' });
  const { guestId } = req.body || {};
  db.prepare('DELETE FROM pickup_bookings WHERE batch_id = ? AND guest_id = ?').run(batch.id, String(guestId || ''));
  res.json({ ok: true });
});
