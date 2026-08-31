import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'brewhouse.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT '',
  volume_l INTEGER NOT NULL DEFAULT 20,
  brew_date TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 6,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  primary_days INTEGER NOT NULL DEFAULT 11,
  conditioning_days INTEGER NOT NULL DEFAULT 13,
  bottled_at TEXT,
  pickup_window_days INTEGER NOT NULL DEFAULT 20,
  og TEXT DEFAULT '',
  fg TEXT DEFAULT '',
  abv TEXT DEFAULT '',
  ibu TEXT DEFAULT '',
  grain_bill TEXT NOT NULL DEFAULT '[]',
  hops TEXT NOT NULL DEFAULT '[]',
  yeast TEXT NOT NULL DEFAULT '{}',
  whats_happening TEXT DEFAULT '',
  host_name TEXT NOT NULL DEFAULT 'Joris',
  location TEXT NOT NULL DEFAULT 'Kitchen Brewery · Amsterdam',
  recipe_src TEXT DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS journal_posts (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  video_url TEXT,
  sg TEXT,
  temp_c TEXT,
  bubbles_per_min TEXT,
  taste_note TEXT,
  posted_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pickup_slots (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pickup_bookings (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL,
  slot_id TEXT NOT NULL REFERENCES pickup_slots(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  UNIQUE(batch_id, guest_id)
);
`);
