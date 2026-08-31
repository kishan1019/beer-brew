import type { GuestBatch, JournalPost } from '../../lib/types';
import { formatShortDate } from '../../lib/format';

function Chip({ children, tone }: { children: React.ReactNode; tone: 'amber' | 'green' }) {
  return (
    <div
      style={{
        background: tone === 'amber' ? '#FDF0CF' : '#E7F0E4',
        color: tone === 'amber' ? '#8A5A08' : '#3D6B3B',
        borderRadius: 8,
        padding: '5px 9px',
        font: "600 11px 'IBM Plex Mono'",
      }}
    >
      {children}
    </div>
  );
}

export default function JournalTab({ batch, posts }: { batch: GuestBatch; posts: JournalPost[] }) {
  return (
    <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ font: "400 13px/1.5 'IBM Plex Sans'", color: '#8A7A63' }}>
        Posted from the kitchen by <b style={{ color: '#1B1512' }}>{batch.hostName}</b>, your host.
      </div>

      {posts.length === 0 && (
        <div style={{ background: '#F4EEE1', border: '1.5px dashed #CDBEA3', borderRadius: 22, padding: 16, textAlign: 'center', font: "400 13px/1.5 'IBM Plex Sans'", color: '#8A7A63' }}>
          No updates yet — {batch.hostName} will post here as your batch moves along.
        </div>
      )}

      {posts.map((post) => (
        <div key={post.id} style={{ background: '#fff', border: '1.5px solid #E7DCC6', borderRadius: 22, overflow: 'hidden' }}>
          {post.photo_url ? (
            <img src={post.photo_url} alt={post.title} style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
          ) : post.video_url ? (
            <video src={post.video_url} controls style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block', background: '#000' }} />
          ) : (
            <div
              style={{
                height: 150,
                background: 'repeating-linear-gradient(135deg,#EADFC8,#EADFC8 10px,#E3D6BB 10px,#E3D6BB 20px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                font: "500 11.5px 'IBM Plex Mono'",
                color: '#9A8B72',
                letterSpacing: '.08em',
              }}
            >
              NO PHOTO ON THIS UPDATE
            </div>
          )}
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ font: "700 15px 'Bricolage Grotesque'", color: '#1B1512' }}>{post.title}</div>
              <div style={{ font: "500 11px 'IBM Plex Mono'", color: '#B6A78D' }}>{formatShortDate(post.posted_at)}</div>
            </div>
            {post.body && <div style={{ font: "400 13.5px/1.55 'IBM Plex Sans'", color: '#5C4F3E', marginTop: 7 }}>{post.body}</div>}
            <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
              {post.sg && <Chip tone="amber">SG {post.sg}</Chip>}
              {post.temp_c && <Chip tone="amber">{post.temp_c} °C</Chip>}
              {post.bubbles_per_min && (
                <Chip tone="amber">{/[a-z/]/i.test(post.bubbles_per_min) ? post.bubbles_per_min : `${post.bubbles_per_min} / min`}</Chip>
              )}
              {post.taste_note && <Chip tone="amber">TASTE: {post.taste_note.toUpperCase()}</Chip>}
              {post.sg && <Chip tone="green">ON TRACK</Chip>}
            </div>
          </div>
        </div>
      ))}

      <div style={{ background: '#F4EEE1', border: '1.5px dashed #CDBEA3', borderRadius: 22, padding: 16, textAlign: 'center', font: "400 13px/1.5 'IBM Plex Sans'", color: '#8A7A63' }}>
        Day 1 · Brew day. <b style={{ color: '#1B1512' }}>You were there.</b>
      </div>
    </div>
  );
}
