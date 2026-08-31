import { useState } from 'react';
import { api } from '../../lib/api';

export default function Gate({ onUnlock }: { onUnlock: (code: string) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const unlock = async () => {
    const trimmed = code.trim().toUpperCase().replace(/\s/g, '');
    if (!trimmed) return;
    setLoading(true);
    setError(false);
    try {
      const res = await api.redeem(trimmed);
      onUnlock(res.code);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(175deg,#1B1512 0%,#3A2412 55%,#7A3F0C 100%)',
        padding: '74px 26px 30px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="animate-bub" style={{ position: 'absolute', left: 34, bottom: 170, width: 12, height: 12, borderRadius: '50%', background: 'rgba(240,180,41,.5)' }} />
      <div className="animate-bub" style={{ position: 'absolute', left: 76, bottom: 150, width: 8, height: 8, borderRadius: '50%', background: 'rgba(240,180,41,.35)', animationDelay: '.8s' }} />
      <div className="animate-bub" style={{ position: 'absolute', right: 52, bottom: 190, width: 14, height: 14, borderRadius: '50%', background: 'rgba(240,180,41,.28)', animationDelay: '1.6s' }} />

      <div style={{ font: "600 11px 'IBM Plex Mono'", letterSpacing: '.18em', color: '#F0B429', textTransform: 'uppercase' }}>
        Kitchen Brewery · Amsterdam
      </div>
      <div style={{ font: "800 42px/1.02 'Bricolage Grotesque',sans-serif", color: '#FBF6EC', letterSpacing: '-.035em', margin: '14px 0 10px' }}>
        You brewed
        <br />
        something.
        <br />
        Let's watch it
        <br />
        wake up.
      </div>
      <div style={{ font: "400 14px/1.5 'IBM Plex Sans'", color: 'rgba(251,246,236,.62)', maxWidth: 280 }}>
        Type the code from your brew day card to follow your batch — every bubble, every sample, all the way to the crate.
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ font: "600 11px 'IBM Plex Mono'", letterSpacing: '.16em', color: 'rgba(251,246,236,.5)', textTransform: 'uppercase' }}>
          Batch code
        </div>
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && unlock()}
          placeholder="MALT-482"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'rgba(251,246,236,.08)',
            border: '1.5px solid rgba(240,180,41,.4)',
            borderRadius: 18,
            padding: '18px 20px',
            font: "600 22px 'IBM Plex Mono'",
            letterSpacing: '.14em',
            color: '#FBF6EC',
            outline: 'none',
            textTransform: 'uppercase',
          }}
        />
        {error && (
          <div style={{ font: "500 12.5px 'IBM Plex Sans'", color: '#F2856B' }}>
            That code isn't pouring. Check the card from your brew day, or ask your host.
          </div>
        )}
        <button
          onClick={unlock}
          disabled={loading}
          style={{
            width: '100%',
            background: '#F0B429',
            border: 'none',
            borderRadius: 18,
            padding: 18,
            font: "800 16px 'Bricolage Grotesque',sans-serif",
            color: '#1B1512',
            cursor: 'pointer',
            letterSpacing: '-.01em',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Checking…' : 'Open my batch →'}
        </button>
        <div style={{ textAlign: 'center', font: "400 12px 'IBM Plex Sans'", color: 'rgba(251,246,236,.4)' }}>
          Booked via Airbnb Experiences or GetYourGuide? Your code is on the confirmation email.
        </div>
      </div>
    </div>
  );
}
