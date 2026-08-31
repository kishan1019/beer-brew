import crypto from 'node:crypto';
import { db } from './db.js';

const existing = db.prepare('SELECT COUNT(*) as c FROM batches').get() as { c: number };
if (existing.c > 0) {
  console.log('Database already has batches, skipping seed.');
  process.exit(0);
}

const now = new Date();
const brewDate = new Date(now.getTime() - 15 * 86400000).toISOString().slice(0, 10);

const id = crypto.randomUUID();
db.prepare(
  `INSERT INTO batches (id,name,style,volume_l,brew_date,seats,code,status,primary_days,conditioning_days,
    bottled_at,pickup_window_days,og,fg,abv,ibu,grain_bill,hops,yeast,whats_happening,host_name,location,recipe_src,created_at)
   VALUES (?,?,?,?,?,?,?, 'active', ?,?, NULL, 20, ?,?,?,?,?,?,?, '', ?, ?, '', ?)`
).run(
  id,
  'Nachtwacht Dubbel',
  'Belgian Dubbel',
  20,
  brewDate,
  6,
  'MALT-482',
  11,
  13,
  '1.068',
  '1.014',
  '7.1%',
  '22',
  JSON.stringify([
    { name: 'Pilsner malt', amount: '4.20 kg' },
    { name: 'Munich malt', amount: '0.80 kg' },
    { name: 'CaraMunich III', amount: '0.35 kg' },
    { name: 'Dark candi syrup D-90', amount: '0.50 kg' },
  ]),
  JSON.stringify([
    { name: 'Styrian Golding', amount: '30 g', time: '60 min' },
    { name: 'Saaz', amount: '15 g', time: '10 min' },
  ]),
  JSON.stringify({ name: 'Wyeast 1214', style: 'Belgian Abbey', temp: '19–21 °C', pitchedNote: `pitched ${brewDate}` }),
  'Joris',
  'Kitchen Brewery · Amsterdam',
  now.toISOString()
);

const post = (day: number, daysAgo: number, title: string, body: string, sg?: string, tempC?: string, bubbles?: string, taste?: string) => {
  db.prepare(
    `INSERT INTO journal_posts (id,batch_id,day,title,body,photo_url,video_url,sg,temp_c,bubbles_per_min,taste_note,posted_at)
     VALUES (?,?,?,?,?,NULL,NULL,?,?,?,?,?)`
  ).run(
    crypto.randomUUID(), id, day, title, body,
    sg ?? null, tempC ?? null, bubbles ?? null, taste ?? null,
    new Date(now.getTime() - daysAgo * 86400000).toISOString()
  );
};

post(16, 1, 'Day 16 — quiet and clear', 'Bubbling is down to about 3 a minute. Krausen has dropped and the beer is starting to clear from the top down — exactly where a dubbel should be at this point.', '1.018', '19.4', '3 / min');
post(11, 6, 'Day 11 — first taste test', 'Pulled a sample. Raisin and dark bread, a bit of warmth from the fermentation. Moving it to the cool corner for conditioning.', '1.022', undefined, undefined, 'raisin');
post(2, 15, 'Day 2 — full chaos', 'Airlock going about once a second. The whole kitchen smells like banana bread. This is the loudest your beer will ever be.', undefined, '21.1', '60 / min');

console.log('Seeded batch with code MALT-482');
