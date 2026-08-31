import { useState } from 'react';
import type { GuestBatch } from '../../lib/types';

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ background: '#1B1512', borderRadius: 16, padding: '12px 8px', textAlign: 'center' }}>
      <div style={{ font: "700 17px 'Bricolage Grotesque'", color: '#F0B429' }}>{value || '—'}</div>
      <div style={{ font: "600 9px 'IBM Plex Mono'", color: 'rgba(251,246,236,.5)', letterSpacing: '.06em' }}>{label}</div>
    </div>
  );
}

export default function RecipeTab({ batch }: { batch: GuestBatch }) {
  const [deep, setDeep] = useState(false);

  return (
    <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        <StatTile value={batch.og} label="OG" />
        <StatTile value={batch.fg} label="FG" />
        <StatTile value={batch.abv} label="ABV" />
        <StatTile value={batch.ibu} label="IBU" />
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #E7DCC6', borderRadius: 22, padding: 18 }}>
        <div style={{ font: "700 13px 'Bricolage Grotesque'", color: '#1B1512', letterSpacing: '.02em' }}>GRAIN BILL · {batch.volumeL} L</div>
        {batch.grainBill.length === 0 && (
          <div style={{ font: "400 13px 'IBM Plex Sans'", color: '#8A7A63', padding: '10px 0' }}>Your host hasn't added the grain bill yet.</div>
        )}
        {batch.grainBill.map((line, i) => (
          <div
            key={i}
            style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < batch.grainBill.length - 1 ? '1px solid #F1E9D9' : 'none', font: "500 13.5px 'IBM Plex Sans'", color: '#5C4F3E' }}
          >
            <span>{line.name}</span>
            <b style={{ color: '#1B1512' }}>{line.amount}</b>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, background: '#fff', border: '1.5px solid #E7DCC6', borderRadius: 22, padding: 16 }}>
          <div style={{ font: "700 12px 'Bricolage Grotesque'", color: '#1B1512' }}>HOPS</div>
          <div style={{ font: "500 13px/1.6 'IBM Plex Sans'", color: '#5C4F3E', marginTop: 6 }}>
            {batch.hops.length === 0 && <span style={{ color: '#B6A78D' }}>Not added yet</span>}
            {batch.hops.map((h, i) => (
              <span key={i}>
                {h.name}
                <br />
                <span style={{ color: '#B6A78D' }}>
                  {h.amount} · {h.time}
                </span>
                {i < batch.hops.length - 1 && <br />}
              </span>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, background: '#fff', border: '1.5px solid #E7DCC6', borderRadius: 22, padding: 16 }}>
          <div style={{ font: "700 12px 'Bricolage Grotesque'", color: '#1B1512' }}>YEAST</div>
          <div style={{ font: "500 13px/1.6 'IBM Plex Sans'", color: '#5C4F3E', marginTop: 6 }}>
            {batch.yeast?.name ? (
              <>
                {batch.yeast.name}
                <br />
                <span style={{ color: '#B6A78D' }}>{batch.yeast.style}</span>
                <br />
                {batch.yeast.temp}
                <br />
                <span style={{ color: '#B6A78D' }}>{batch.yeast.pitchedNote}</span>
              </>
            ) : (
              <span style={{ color: '#B6A78D' }}>Not added yet</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: '#FDF0CF', borderRadius: 22, padding: 18 }}>
        <div style={{ font: "700 13px 'Bricolage Grotesque'", color: '#8A5A08', letterSpacing: '.02em' }}>WHAT'S HAPPENING IN THERE</div>
        <div style={{ font: "400 13.5px/1.6 'IBM Plex Sans'", color: '#6B4A11', marginTop: 8 }}>{batch.whatsHappening}</div>
        <button
          onClick={() => setDeep((d) => !d)}
          style={{ marginTop: 12, background: '#8A5A08', border: 'none', borderRadius: 12, padding: '10px 14px', color: '#FDF0CF', font: "600 12.5px 'IBM Plex Sans'", cursor: 'pointer' }}
        >
          {deep ? 'Less detail' : 'Explain the whole process'}
        </button>
        {deep && (
          <div style={{ font: "400 13px/1.6 'IBM Plex Sans'", color: '#6B4A11', marginTop: 12, borderTop: '1px solid rgba(138,90,8,.2)', paddingTop: 12 }}>
            Mash at 66 °C for 60 min converts starch to sugar. The 60-minute boil sterilises the wort and pulls bitterness from the hops.
            Cooling fast to 20 °C protects the beer from infection before the yeast takes over. Then it's just patience — about three
            weeks of it.
          </div>
        )}
      </div>
    </div>
  );
}
