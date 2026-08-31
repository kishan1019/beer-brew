import type { RecipeLine } from './types';

// Ported from the Claude Design prototype's ingest() logic (project/Brewhouse.dc.html).
// Parses a BeerSmith / Brewfather / Brewer's Friend HTML export (or any HTML with a
// grain-bill table) into generic label/value lines, plus best-guess name and style.
export interface ParsedRecipe {
  lines: RecipeLine[];
  name: string;
  style: string;
}

export function parseRecipeHtml(text: string, fileName: string): ParsedRecipe | null {
  let doc: Document | null;
  try {
    doc = new DOMParser().parseFromString(text, 'text/html');
  } catch {
    doc = null;
  }
  if (!doc) return null;

  const flat = (doc.body ? doc.body.innerText || doc.body.textContent : text) || '';
  const lines: RecipeLine[] = [];
  const push = (label: string, value: string) => {
    if (!label || !value) return;
    if (lines.length >= 9) return;
    if (lines.some((l) => l.label === label)) return;
    lines.push({ label: label.trim().slice(0, 40), value: String(value).trim().slice(0, 22) });
  };

  doc.querySelectorAll('tr').forEach((tr) => {
    const c = Array.from(tr.querySelectorAll('td,th'))
      .map((x) => (x.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    if (c.length < 2) return;
    const amt = c.find((v) => /^\d+([.,]\d+)?\s*(kg|g|lb|oz|l|ml|pkg|vial)\b/i.test(v));
    const nameCell = c.find((v) => v !== amt && /[a-z]{3}/i.test(v) && !/^\d/.test(v));
    if (amt && nameCell) push(nameCell, amt);
  });

  if (!lines.length) {
    const re = /^\s*(\d+[.,]?\d*\s*(?:kg|g|lb|oz|pkg))\s+(?:of\s+)?(.{3,40}?)\s*$/i;
    const re2 = /^\s*(.{3,40}?)\s+(\d+[.,]?\d*\s*(?:kg|g|lb|oz|pkg))\s*$/i;
    flat.split('\n').forEach((raw) => {
      const l = raw.replace(/\s+/g, ' ').trim();
      let m = l.match(re);
      if (m) return push(m[2], m[1]);
      m = l.match(re2);
      if (m) push(m[1], m[2]);
    });
  }

  const grab = (label: string, rx: RegExp) => {
    const m = flat.match(rx);
    if (m) push(label, m[1]);
  };
  grab('Original gravity', /\bOG[:\s]*([01]\.\d{3})/i);
  grab('Final gravity', /\bFG[:\s]*([01]\.\d{3})/i);
  grab('ABV', /\bABV[:\s]*(\d{1,2}[.,]?\d?\s*%?)/i);
  grab('Bitterness', /\bIBU[s]?[:\s]*(\d{1,3})/i);
  grab('Batch size', /\b(\d{1,3}\s*(?:L|liters|litres|gal))\b/i);

  if (!lines.length) return null;

  const title = doc.querySelector('h1,h2,title')?.textContent;
  const name = (title || fileName.replace(/\.html?$/i, '')).replace(/\s+/g, ' ').trim().slice(0, 40);
  const styleM = flat.match(
    /\b(dubbel|tripel|saison|ipa|stout|porter|pilsner|witbier|lager|pale ale|amber ale|wheat beer|kölsch|bock)\b/i
  );
  const style = styleM ? styleM[1].replace(/^./, (c) => c.toUpperCase()) : '';

  return { lines, name, style };
}

const KNOWN_LABELS: Record<string, 'og' | 'fg' | 'abv' | 'ibu' | 'volume'> = {
  'original gravity': 'og',
  'final gravity': 'fg',
  abv: 'abv',
  bitterness: 'ibu',
  'batch size': 'volume',
};

export interface SplitRecipe {
  og: string;
  fg: string;
  abv: string;
  ibu: string;
  grainBill: { name: string; amount: string }[];
}

// Splits the generic parsed lines into the structured fields the guest Recipe tab
// displays (OG/FG/ABV/IBU tiles + grain bill). Hops and yeast aren't distinguishable
// from a flat grain-bill table, so they're left for the host to fill in by hand.
export function splitRecipeLines(lines: RecipeLine[]): SplitRecipe {
  const out: SplitRecipe = { og: '', fg: '', abv: '', ibu: '', grainBill: [] };
  for (const line of lines) {
    const key = KNOWN_LABELS[line.label.toLowerCase()];
    if (key === 'og') out.og = line.value;
    else if (key === 'fg') out.fg = line.value;
    else if (key === 'abv') out.abv = line.value;
    else if (key === 'ibu') out.ibu = line.value;
    else if (key === 'volume') continue;
    else out.grainBill.push({ name: line.label, amount: line.value });
  }
  return out;
}
