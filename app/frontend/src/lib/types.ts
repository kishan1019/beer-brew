export type Stage = 'brew' | 'primary' | 'conditioning' | 'bottled';

export interface StageInfo {
  currentDay: number;
  estBottlingDay: number;
  stage: Stage;
  progressPct: number;
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
  name?: string;
  style?: string;
  temp?: string;
  pitchedNote?: string;
}

export interface GuestBatch {
  id: string;
  name: string;
  style: string;
  volumeL: number;
  code: string;
  status: 'active' | 'bottled';
  brewDate: string;
  hostName: string;
  location: string;
  og: string;
  fg: string;
  abv: string;
  ibu: string;
  grainBill: GrainLine[];
  hops: HopLine[];
  yeast: Yeast;
  whatsHappening: string;
  stage: StageInfo;
  pickupWindow: { opensAt: string; closesAt: string } | null;
}

export interface JournalPost {
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

export interface PickupSlot {
  id: string;
  batch_id: string;
  label: string;
  note: string;
  starts_at: string;
  ends_at: string;
}

export interface Sticker {
  key: string;
  emoji: string;
  label: string;
  earned: boolean;
}

export interface GuestBatchResponse {
  batch: GuestBatch;
  posts: JournalPost[];
  slots: PickupSlot[];
  booking: { slotId: string } | null;
  stickers: Sticker[];
}

export interface AdminBatchSummary {
  id: string;
  name: string;
  style: string;
  volumeL: number;
  brewDate: string;
  seats: number;
  code: string;
  status: 'active' | 'bottled';
  bottledAt: string | null;
  guestCount: number;
  stage: StageInfo;
  pickup: { collected: number; total: number; daysLeft: number } | null;
}

export interface AdminBatchDetail extends AdminBatchSummary {
  grainBill: GrainLine[];
  hops: HopLine[];
  yeast: Yeast;
  og: string;
  fg: string;
  abv: string;
  ibu: string;
  whatsHappening: string;
  hostName: string;
  location: string;
  recipeSrc: string;
}

export interface RecipeLine {
  label: string;
  value: string;
}
