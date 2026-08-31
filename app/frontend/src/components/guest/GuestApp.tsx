import { useEffect, useState, useCallback } from 'react';
import { api, getOrCreateGuestId } from '../../lib/api';
import type { GuestBatchResponse } from '../../lib/types';
import BrewTab from './BrewTab';
import JournalTab from './JournalTab';
import RecipeTab from './RecipeTab';
import PickupTab from './PickupTab';

type Tab = 'brew' | 'journal' | 'recipe' | 'pickup';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'brew', label: 'Brew', icon: '🫧' },
  { key: 'journal', label: 'Journal', icon: '📓' },
  { key: 'recipe', label: 'Recipe', icon: '🌾' },
  { key: 'pickup', label: 'Pickup', icon: '📦' },
];

function navStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    background: active ? 'rgba(240,180,41,.16)' : 'transparent',
    border: 'none',
    borderRadius: 18,
    padding: '9px 0',
    cursor: 'pointer',
    font: '600 10.5px "IBM Plex Sans"',
    color: active ? '#F0B429' : 'rgba(251,246,236,.5)',
  };
}

export default function GuestApp({ code, onLock }: { code: string; onLock: () => void }) {
  const [tab, setTab] = useState<Tab>('brew');
  const [data, setData] = useState<GuestBatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const guestId = getOrCreateGuestId();

  const load = useCallback(() => {
    api
      .guestBatch(code, guestId)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [code, guestId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center' }}>
        <div style={{ font: "700 16px 'Bricolage Grotesque'", color: '#1B1512' }}>Couldn't load your batch</div>
        <div style={{ font: "400 13px 'IBM Plex Sans'", color: '#8A7A63' }}>{error}</div>
        <button onClick={onLock} style={{ background: '#1B1512', color: '#FBF6EC', border: 'none', borderRadius: 12, padding: '10px 16px', cursor: 'pointer' }}>
          Try another code
        </button>
      </div>
    );
  }

  if (!data) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A7A63' }}>Loading…</div>;
  }

  const { batch, posts, slots, booking, stickers } = data;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 'none', padding: '22px 22px 16px', background: 'linear-gradient(160deg,#1B1512,#4A2A11)', color: '#FBF6EC' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ font: "600 10.5px 'IBM Plex Mono'", letterSpacing: '.16em', color: '#F0B429', textTransform: 'uppercase' }}>
              Batch {batch.code} · {batch.volumeL} L
            </div>
            <div style={{ font: "800 26px/1.1 'Bricolage Grotesque',sans-serif", letterSpacing: '-.03em', marginTop: 5 }}>{batch.name}</div>
          </div>
          <button onClick={onLock} title="Switch batch" style={{ background: 'rgba(251,246,236,.12)', border: 'none', borderRadius: 12, width: 34, height: 34, color: '#FBF6EC', fontSize: 14, cursor: 'pointer' }}>
            ⏻
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 88 }}>
        {tab === 'brew' && <BrewTab batch={batch} stickers={stickers} />}
        {tab === 'journal' && <JournalTab batch={batch} posts={posts} />}
        {tab === 'recipe' && <RecipeTab batch={batch} />}
        {tab === 'pickup' && (
          <PickupTab batch={batch} slots={slots} bookedSlotId={booking?.slotId ?? null} guestId={guestId} onChanged={load} />
        )}
      </div>

      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14, height: 66, background: 'rgba(27,21,18,.96)', backdropFilter: 'blur(12px)', borderRadius: 24, display: 'flex', alignItems: 'center', padding: '0 8px', zIndex: 7 }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={navStyle(tab === t.key)}>
            <span style={{ fontSize: 17 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
