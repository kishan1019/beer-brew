import type { GuestBatch, Sticker } from '../../lib/types';

const STEPS = [
  { key: 'brew', label: 'Brew day', detail: (b: GuestBatch) => `${new Date(b.brewDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · you mashed, boiled and pitched` },
  { key: 'primary', label: 'Primary fermentation', detail: () => 'Airlock went wild, then calmed' },
  { key: 'conditioning', label: 'Conditioning', detail: () => 'Flavours rounding out' },
  { key: 'bottling', label: 'Bottling', detail: (b: GuestBatch) => (b.status === 'bottled' ? 'Sugar in, caps on' : 'Sugar in, caps on — coming up') },
  { key: 'pickup', label: 'Your 5 bottles', detail: () => '20-day pickup window opens after bottling' },
] as const;

function stepState(stepKey: string, stage: GuestBatch['stage'], status: GuestBatch['status']): 'done' | 'now' | 'upcoming' {
  const order = ['brew', 'primary', 'conditioning', 'bottling', 'pickup'];
  const stageOrder = ['brew', 'primary', 'conditioning', 'bottled'];
  const currentIdx = status === 'bottled' ? 3 : stageOrder.indexOf(stage.stage);
  const stepIdx = order.indexOf(stepKey);
  if (stepKey === 'pickup') return status === 'bottled' ? 'now' : 'upcoming';
  if (stepKey === 'bottling') return status === 'bottled' ? 'done' : 'upcoming';
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'now';
  return 'upcoming';
}

export default function BrewTab({ batch, stickers }: { batch: GuestBatch; stickers: Sticker[] }) {
  const { stage } = batch;
  const stageLabel =
    stage.stage === 'brew'
      ? 'Brew day — mash, boil, pitch'
      : stage.stage === 'primary'
        ? 'Primary fermentation — the yeast is hard at work'
        : stage.stage === 'conditioning'
          ? 'Conditioning — the yeast is cleaning up after itself'
          : 'Bottled — carbonating in the bottle';

  const earnedCount = stickers.filter((s) => s.earned).length;

  return (
    <div style={{ padding: '18px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#1B1512', borderRadius: 26, padding: 22, color: '#FBF6EC', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle,rgba(240,180,41,.28),transparent 70%)' }} />
        <div style={{ font: "600 10.5px 'IBM Plex Mono'", letterSpacing: '.16em', color: 'rgba(251,246,236,.5)', textTransform: 'uppercase' }}>Right now</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
          <div style={{ font: "800 46px 'Bricolage Grotesque',sans-serif", letterSpacing: '-.04em', color: '#F0B429' }}>Day {stage.currentDay}</div>
          <div style={{ font: "500 13px 'IBM Plex Sans'", color: 'rgba(251,246,236,.65)' }}>of ~{stage.estBottlingDay} to bottling</div>
        </div>
        <div style={{ font: "700 17px 'Bricolage Grotesque',sans-serif", marginTop: 6 }}>{stageLabel}</div>
        <div style={{ height: 9, borderRadius: 99, background: 'rgba(251,246,236,.14)', marginTop: 16, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${stage.progressPct}%`, borderRadius: 99, background: 'linear-gradient(90deg,#F0B429,#E2711D)' }} />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          <div>
            <div style={{ font: "700 19px 'Bricolage Grotesque'", color: '#FBF6EC' }}>{batch.fg || '—'}</div>
            <div style={{ font: "500 10.5px 'IBM Plex Mono'", color: 'rgba(251,246,236,.45)', letterSpacing: '.08em' }}>GRAVITY</div>
          </div>
          <div>
            <div style={{ font: "700 19px 'Bricolage Grotesque'", color: '#FBF6EC' }}>{batch.abv || '—'}</div>
            <div style={{ font: "500 10.5px 'IBM Plex Mono'", color: 'rgba(251,246,236,.45)', letterSpacing: '.08em' }}>EST. ABV</div>
          </div>
          <div>
            <div style={{ font: "700 19px 'Bricolage Grotesque'", color: '#FBF6EC' }}>{batch.volumeL} L</div>
            <div style={{ font: "500 10.5px 'IBM Plex Mono'", color: 'rgba(251,246,236,.45)', letterSpacing: '.08em' }}>BATCH SIZE</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ font: "700 13px 'Bricolage Grotesque'", color: '#1B1512', letterSpacing: '.02em' }}>THE ROAD TO THE CRATE</div>
        <div style={{ background: '#fff', border: '1.5px solid #E7DCC6', borderRadius: 22, padding: '6px 16px' }}>
          {STEPS.map((step, i) => {
            const state = stepState(step.key, stage, batch.status);
            return (
              <div
                key={step.key}
                style={{ display: 'flex', gap: 14, padding: '13px 0', borderBottom: i < STEPS.length - 1 ? '1px solid #F1E9D9' : 'none', opacity: state === 'upcoming' ? 0.45 : 1 }}
              >
                {state === 'done' ? (
                  <div style={{ width: 26, height: 26, flex: 'none', borderRadius: '50%', background: '#4C7C4A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "700 13px 'IBM Plex Sans'" }}>✓</div>
                ) : state === 'now' ? (
                  <div className="animate-pop" style={{ width: 26, height: 26, flex: 'none', borderRadius: '50%', background: '#F0B429', color: '#1B1512', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "700 12px 'IBM Plex Sans'" }}>●</div>
                ) : (
                  <div style={{ width: 26, height: 26, flex: 'none', borderRadius: '50%', border: '1.5px dashed #B6A78D' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ font: "700 14px 'Bricolage Grotesque'", color: '#1B1512' }}>
                    {step.label}
                    {state === 'now' && (
                      <span style={{ font: "600 10px 'IBM Plex Mono'", background: '#FDF0CF', color: '#8A5A08', padding: '3px 6px', borderRadius: 6, letterSpacing: '.08em', marginLeft: 8 }}>NOW</span>
                    )}
                  </div>
                  <div style={{ font: "400 12.5px 'IBM Plex Sans'", color: '#8A7A63' }}>{step.detail(batch)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20 }}>
        <div style={{ font: "700 13px 'Bricolage Grotesque'", color: '#1B1512', letterSpacing: '.02em' }}>
          STICKERS EARNED <span style={{ color: '#B6A78D' }}>{earnedCount} / {stickers.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {stickers.map((s) => (
            <div
              key={s.key}
              style={{
                width: 74,
                height: 82,
                borderRadius: 18,
                background: s.earned ? '#FDF0CF' : '#F4EEE1',
                border: s.earned ? '1.5px solid #F0B429' : '1.5px dashed #CDBEA3',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                opacity: s.earned ? 1 : 0.6,
              }}
            >
              <div style={{ fontSize: 24 }}>{s.emoji}</div>
              <div style={{ font: "700 9.5px 'IBM Plex Mono'", color: s.earned ? '#8A5A08' : '#8A7A63', textAlign: 'center', letterSpacing: '.04em' }}>
                {s.label.split(' ').map((w, i) => (
                  <span key={i}>
                    {w}
                    {i === 0 ? <br /> : null}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
