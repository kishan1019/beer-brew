export type Stage = 'brew' | 'primary' | 'conditioning' | 'bottled';

export interface StageInfo {
  currentDay: number;
  estBottlingDay: number;
  stage: Stage;
  progressPct: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function computeStage(brewDate: string, primaryDays: number, conditioningDays: number, bottledAt: string | null): StageInfo {
  const brew = new Date(brewDate + 'T12:00:00').getTime();
  const now = Date.now();
  const estBottlingDay = primaryDays + conditioningDays;
  const currentDay = bottledAt
    ? Math.max(1, Math.round((new Date(bottledAt).getTime() - brew) / DAY_MS) + 1)
    : Math.max(1, Math.floor((now - brew) / DAY_MS) + 1);

  let stage: Stage = 'brew';
  if (bottledAt) stage = 'bottled';
  else if (currentDay > primaryDays) stage = 'conditioning';
  else if (currentDay > 1) stage = 'primary';

  const progressPct = bottledAt ? 100 : Math.min(100, Math.round((currentDay / estBottlingDay) * 100));

  return { currentDay, estBottlingDay, stage, progressPct };
}

export function whatsHappeningFor(stage: Stage, custom: string): string {
  if (custom && custom.trim()) return custom;
  switch (stage) {
    case 'brew':
      return "Mash, boil and pitch are done — the yeast just woke up and is starting to eat through the sugars.";
    case 'primary':
      return 'Fermentation is in full swing: the yeast is converting sugar into alcohol and CO2, which is what you see bubbling through the airlock.';
    case 'conditioning':
      return "Right now the yeast has eaten most of the sugar and is turning back to the byproducts it left behind — reabsorbing the buttery and green-apple notes. That's why conditioning matters: nothing looks like it's happening, and everything is.";
    case 'bottled':
      return 'Bottled and carbonating. Every bottle now has a little priming sugar working with the yeast still in suspension to build natural carbonation.';
  }
}

export interface Sticker {
  key: string;
  emoji: string;
  label: string;
  earned: boolean;
}

export function computeStickers(opts: { hasSgPost: boolean; bottled: boolean; collected: boolean }): Sticker[] {
  return [
    { key: 'mash', emoji: '🌾', label: 'MASH MASTER', earned: true },
    { key: 'boil', emoji: '🔥', label: 'BOIL SURVIVOR', earned: true },
    { key: 'bubble', emoji: '💨', label: 'FIRST BUBBLE', earned: true },
    { key: 'gravity', emoji: '🧪', label: 'GRAVITY NERD', earned: opts.hasSgPost },
    { key: 'capped', emoji: '🍾', label: 'CAPPED IT', earned: opts.bottled },
    { key: 'crate', emoji: '📦', label: 'CRATE CLAIMED', earned: opts.collected },
  ];
}

export function genCode(existing: (code: string) => boolean): string {
  const words = ['MALT', 'HOPS', 'BREW', 'YEAST', 'WORT', 'CASK'];
  for (let i = 0; i < 50; i++) {
    const code = words[Math.floor(Math.random() * words.length)] + '-' + (100 + Math.floor(Math.random() * 899));
    if (!existing(code)) return code;
  }
  throw new Error('could not generate unique code');
}
