import { useState } from 'react';
import type { AdminBatchSummary } from '../../lib/types';
import { api } from '../../lib/api';

function BatchCard({ batch, onPostUpdate, onBottled }: { batch: AdminBatchSummary; onPostUpdate: () => void; onBottled: () => void }) {
  const [bottling, setBottling] = useState(false);

  const markBottled = async () => {
    setBottling(true);
    try {
      await api.markBottled(batch.id);
      onBottled();
    } finally {
      setBottling(false);
    }
  };

  const isBottled = batch.status === 'bottled';

  return (
    <div style={{ background: '#221D19', border: '1px solid #33291F', borderRadius: 20, padding: 16, opacity: isBottled ? 0.85 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ font: "700 16px 'Bricolage Grotesque'", color: '#FBF6EC' }}>{batch.name}</div>
          <div style={{ font: "400 12.5px 'IBM Plex Sans'", color: '#8A7A63', marginTop: 2 }}>
            {batch.style || 'Style TBD'} · {batch.volumeL} L · brewed {new Date(batch.brewDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </div>
        </div>
        <div style={{ background: '#3B2E12', color: '#F0B429', borderRadius: 8, padding: '5px 8px', font: "600 11px 'IBM Plex Mono'", letterSpacing: '.08em' }}>{batch.code}</div>
      </div>

      {!isBottled ? (
        <>
          <div style={{ height: 7, borderRadius: 99, background: '#33291F', marginTop: 14, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${batch.stage.progressPct}%`, background: 'linear-gradient(90deg,#F0B429,#E2711D)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 9, font: "500 11.5px 'IBM Plex Mono'", color: '#8A7A63' }}>
            <span>
              DAY {batch.stage.currentDay} · {batch.stage.stage.toUpperCase()}
            </span>
            <span>{batch.guestCount} GUESTS</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={onPostUpdate} style={{ flex: 1, background: '#33291F', border: 'none', borderRadius: 12, padding: 11, color: '#FBF6EC', font: "600 12.5px 'IBM Plex Sans'", cursor: 'pointer' }}>
              Post update
            </button>
            <button
              onClick={markBottled}
              disabled={bottling}
              style={{ flex: 1, background: '#33291F', border: 'none', borderRadius: 12, padding: 11, color: '#7BC47F', font: "600 12.5px 'IBM Plex Sans'", cursor: 'pointer', opacity: bottling ? 0.7 : 1 }}
            >
              {bottling ? 'Bottling…' : 'Mark bottled'}
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, font: "500 11.5px 'IBM Plex Mono'", color: '#8A7A63' }}>
            <span>PICKUP · {batch.pickup ? `${batch.pickup.daysLeft} DAYS LEFT` : '—'}</span>
            <span>{batch.pickup ? `${batch.pickup.collected} / ${batch.pickup.total} COLLECTED` : ''}</span>
          </div>
          <div style={{ marginTop: 10, background: '#1D2A1C', borderRadius: 12, padding: 11, font: "500 12px 'IBM Plex Sans'", color: '#7BC47F' }}>
            Bottled {new Date(batch.bottledAt!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}. Pickup window open — {batch.guestCount} guests notified.
          </div>
        </>
      )}
    </div>
  );
}

export default function BatchList({
  batches,
  onNewBatch,
  onPostUpdate,
  onRefresh,
}: {
  batches: AdminBatchSummary[];
  onNewBatch: () => void;
  onPostUpdate: (batch: AdminBatchSummary) => void;
  onRefresh: () => void;
}) {
  const active = batches.filter((b) => b.status === 'active');
  const bottled = batches.filter((b) => b.status === 'bottled');

  return (
    <>
      <button onClick={onNewBatch} style={{ background: '#F0B429', border: 'none', borderRadius: 20, padding: 16, font: "800 15px 'Bricolage Grotesque'", color: '#1B1512', cursor: 'pointer' }}>
        + New batch &amp; access code
      </button>

      {active.length > 0 && (
        <>
          <div style={{ font: "700 12px 'Bricolage Grotesque'", color: 'rgba(251,246,236,.45)', letterSpacing: '.1em', marginTop: 4 }}>ACTIVE</div>
          {active.map((b) => (
            <BatchCard key={b.id} batch={b} onPostUpdate={() => onPostUpdate(b)} onBottled={onRefresh} />
          ))}
        </>
      )}

      {bottled.length > 0 && (
        <>
          <div style={{ font: "700 12px 'Bricolage Grotesque'", color: 'rgba(251,246,236,.45)', letterSpacing: '.1em', marginTop: 4 }}>BOTTLED</div>
          {bottled.map((b) => (
            <BatchCard key={b.id} batch={b} onPostUpdate={() => onPostUpdate(b)} onBottled={onRefresh} />
          ))}
        </>
      )}

      {batches.length === 0 && (
        <div style={{ font: "400 13px/1.5 'IBM Plex Sans'", color: '#8A7A63', textAlign: 'center', marginTop: 20 }}>
          No batches yet — create one above to get a guest access code.
        </div>
      )}
    </>
  );
}
