import { useState } from 'react';
import { api } from '../../lib/api';

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.adminLogin(password);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '30px 26px', background: '#14110F' }}>
      <div style={{ font: "600 10.5px 'IBM Plex Mono'", letterSpacing: '.16em', color: '#7BC47F', textTransform: 'uppercase' }}>Host console</div>
      <div style={{ font: "800 25px 'Bricolage Grotesque'", letterSpacing: '-.03em', color: '#FBF6EC' }}>Sign in to host</div>
      <input
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Host password"
        style={{ width: '100%', boxSizing: 'border-box', background: '#221D19', border: '1.5px solid #33291F', borderRadius: 14, padding: '13px 14px', font: "600 15px 'IBM Plex Sans'", color: '#FBF6EC', outline: 'none' }}
      />
      {error && <div style={{ font: "500 12.5px 'IBM Plex Sans'", color: '#F2856B' }}>{error}</div>}
      <button
        onClick={submit}
        disabled={loading}
        style={{ background: '#F0B429', border: 'none', borderRadius: 14, padding: 14, color: '#1B1512', font: "800 14px 'Bricolage Grotesque'", cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Checking…' : 'Enter kitchen'}
      </button>
    </div>
  );
}
