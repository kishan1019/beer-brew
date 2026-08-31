import { useState } from 'react';
import Screen from './components/Screen';
import Gate from './components/guest/Gate';
import GuestApp from './components/guest/GuestApp';
import AdminConsole from './components/admin/AdminConsole';

type Mode = 'guest' | 'host';

const CODE_KEY = 'bb_code';

function segStyle(active: boolean): React.CSSProperties {
  return {
    border: 'none',
    borderRadius: 999,
    padding: '6px 14px',
    cursor: 'pointer',
    font: '600 12px "IBM Plex Sans"',
    background: active ? '#F0B429' : 'transparent',
    color: active ? '#1B1512' : 'rgba(251,246,236,.6)',
  };
}

export default function App() {
  const [mode, setMode] = useState<Mode>('guest');
  const [code, setCode] = useState<string | null>(() => localStorage.getItem(CODE_KEY));

  const handleUnlock = (unlockedCode: string) => {
    localStorage.setItem(CODE_KEY, unlockedCode);
    setCode(unlockedCode);
  };

  const handleLock = () => {
    localStorage.removeItem(CODE_KEY);
    setCode(null);
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'radial-gradient(120% 80% at 50% 0%, #F7F0E1 0%, #E7DAC2 60%, #DCCBAC 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        padding: '28px 16px 56px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: '#1B1512',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F0B429',
            font: "800 15px 'Bricolage Grotesque', sans-serif",
          }}
        >
          B
        </div>
        <div style={{ font: "800 17px 'Bricolage Grotesque', sans-serif", color: '#1B1512', letterSpacing: '-.02em' }}>
          Bubble &amp; Bottle
        </div>
        <div style={{ display: 'flex', background: '#1B1512', borderRadius: 999, padding: 3, gap: 2, marginLeft: 6 }}>
          <button onClick={() => setMode('guest')} style={segStyle(mode === 'guest')}>
            Guest
          </button>
          <button onClick={() => setMode('host')} style={segStyle(mode === 'host')}>
            Host
          </button>
        </div>
      </div>

      <Screen>
        {mode === 'guest' ? (
          code ? (
            <GuestApp code={code} onLock={handleLock} />
          ) : (
            <Gate onUnlock={handleUnlock} />
          )
        ) : (
          <AdminConsole />
        )}
      </Screen>

      <div style={{ font: "400 12px 'IBM Plex Sans'", color: '#8A7A63', maxWidth: 420, textAlign: 'center' }}>
        Booked via Airbnb Experiences or GetYourGuide? Your code is on the confirmation email. Hosting? Switch to{' '}
        <b style={{ color: '#1B1512' }}>Host</b> to create a batch and generate a code.
      </div>
    </div>
  );
}
