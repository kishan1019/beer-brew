import { useState } from 'react';
import type { GuestBatch, PickupSlot } from '../../lib/types';
import { formatDateTimeRange } from '../../lib/format';
import { api } from '../../lib/api';

export default function PickupTab({
  batch,
  slots,
  bookedSlotId,
  guestId,
  onChanged,
}: {
  batch: GuestBatch;
  slots: PickupSlot[];
  bookedSlotId: string | null;
  guestId: string;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const bookedSlot = slots.find((s) => s.id === bookedSlotId);

  const book = async (slotId: string) => {
    setBusy(true);
    try {
      await api.bookSlot(batch.code, guestId, slotId);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const unbook = async () => {
    setBusy(true);
    try {
      await api.unbookSlot(batch.code, guestId);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'linear-gradient(150deg,#7A3F0C,#C2600F)', borderRadius: 26, padding: 22, color: '#FBF6EC' }}>
        <div style={{ font: "600 10.5px 'IBM Plex Mono'", letterSpacing: '.16em', color: 'rgba(251,246,236,.7)', textTransform: 'uppercase' }}>Pickup window</div>
        {batch.pickupWindow ? (
          <div style={{ font: "800 30px/1.1 'Bricolage Grotesque'", letterSpacing: '-.03em', marginTop: 8 }}>
            Opens {new Date(batch.pickupWindow.opensAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })},
            <br />
            closes {new Date(batch.pickupWindow.closesAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </div>
        ) : (
          <div style={{ font: "800 24px/1.2 'Bricolage Grotesque'", letterSpacing: '-.03em', marginTop: 8 }}>
            Opens once your batch is bottled
          </div>
        )}
        <div style={{ font: "400 13.5px/1.5 'IBM Plex Sans'", color: 'rgba(251,246,236,.78)', marginTop: 10 }}>
          Once your batch is bottled you get 20 days to come by and collect <b>5 bottles</b> — your share of the {batch.volumeL} litres.
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 44, borderRadius: 10, background: 'rgba(251,246,236,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>
              🍺
            </div>
          ))}
        </div>
      </div>

      {batch.status !== 'bottled' ? (
        <div style={{ background: '#F4EEE1', border: '1.5px dashed #CDBEA3', borderRadius: 22, padding: 18, textAlign: 'center', font: "400 13px/1.5 'IBM Plex Sans'", color: '#8A7A63' }}>
          Slots open up as soon as {batch.hostName} marks this batch bottled.
        </div>
      ) : bookedSlot ? (
        <div className="animate-pop" style={{ background: '#E7F0E4', border: '1.5px solid #A9C6A4', borderRadius: 22, padding: 18 }}>
          <div style={{ font: "700 15px 'Bricolage Grotesque'", color: '#2F5A2D' }}>Slot held — {formatDateTimeRange(bookedSlot.starts_at, bookedSlot.ends_at)}</div>
          <div style={{ font: "400 13.5px/1.55 'IBM Plex Sans'", color: '#3D6B3B', marginTop: 6 }}>
            Bring a bag. Ring the bell marked <b>{batch.hostName}</b>. Empty bottles back next time gets you a free extra.
          </div>
          <button
            onClick={unbook}
            disabled={busy}
            style={{ marginTop: 12, background: 'none', border: '1.5px solid #A9C6A4', borderRadius: 12, padding: '9px 13px', color: '#2F5A2D', font: "600 12.5px 'IBM Plex Sans'", cursor: 'pointer' }}
          >
            Change slot
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ font: "700 13px 'Bricolage Grotesque'", color: '#1B1512', letterSpacing: '.02em' }}>RESERVE A COLLECTION SLOT</div>
          <div style={{ font: "400 12.5px 'IBM Plex Sans'", color: '#8A7A63', marginTop: -4 }}>Provisional — confirmed the day the caps go on.</div>
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => book(slot.id)}
              disabled={busy}
              style={{ textAlign: 'left', background: '#fff', border: '1.5px solid #E7DCC6', borderRadius: 18, padding: '15px 16px', cursor: 'pointer' }}
            >
              <div style={{ font: "700 14.5px 'Bricolage Grotesque'", color: '#1B1512' }}>{formatDateTimeRange(slot.starts_at, slot.ends_at)}</div>
              <div style={{ font: "400 12.5px 'IBM Plex Sans'", color: '#8A7A63', marginTop: 3 }}>{slot.label} · {slot.note}</div>
            </button>
          ))}
        </div>
      )}

      <div style={{ background: '#F4EEE1', borderRadius: 18, padding: 15, font: "400 12.5px/1.55 'IBM Plex Sans'", color: '#8A7A63' }}>
        Can't make any of them? Message {batch.hostName} and he'll keep your crate in the cellar a little longer.
      </div>
    </div>
  );
}
