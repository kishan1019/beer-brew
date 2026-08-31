export interface BatchRow {
  id: string;
  name: string;
  style: string;
  volume_l: number;
  brew_date: string;
  seats: number;
  code: string;
  status: 'active' | 'bottled';
  primary_days: number;
  conditioning_days: number;
  bottled_at: string | null;
  pickup_window_days: number;
  og: string;
  fg: string;
  abv: string;
  ibu: string;
  grain_bill: string;
  hops: string;
  yeast: string;
  whats_happening: string;
  host_name: string;
  location: string;
  recipe_src: string;
  created_at: string;
}

export interface JournalPostRow {
  id: string;
  batch_id: string;
  day: number;
  title: string;
  body: string;
  photo_url: string | null;
  video_url: string | null;
  sg: string | null;
  temp_c: string | null;
  bubbles_per_min: string | null;
  taste_note: string | null;
  posted_at: string;
}

export interface PickupSlotRow {
  id: string;
  batch_id: string;
  label: string;
  note: string;
  starts_at: string;
  ends_at: string;
}

export interface PickupBookingRow {
  id: string;
  batch_id: string;
  guest_id: string;
  slot_id: string;
  created_at: string;
}

export interface GrainLine {
  name: string;
  amount: string;
}

export interface HopLine {
  name: string;
  amount: string;
  time: string;
}

export interface Yeast {
  name: string;
  style: string;
  temp: string;
  pitchedNote: string;
}
