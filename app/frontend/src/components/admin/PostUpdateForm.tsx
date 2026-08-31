import { useState } from 'react';
import { api } from '../../lib/api';
import type { AdminBatchSummary } from '../../lib/types';

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#14110F',
  border: '1.5px solid #33291F',
  borderRadius: 14,
  padding: '12px 14px',
  font: "600 14px 'IBM Plex Mono'",
  color: '#FBF6EC',
  outline: 'none',
};

export default function PostUpdateForm({ batch, onDone, onCancel }: { batch: AdminBatchSummary; onDone: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sg, setSg] = useState('');
  const [tempC, setTempC] = useState('');
  const [bubbles, setBubbles] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim() && !body.trim()) {
      setError('Add a title or a note first.');
      return;
    }
    setSaving(true);
    setError(null);
    const form = new FormData();
    form.set('title', title || `Day ${batch.stage.currentDay} update`);
    form.set('body', body);
    if (sg) form.set('sg', sg);
    if (tempC) form.set('tempC', tempC);
    if (bubbles) form.set('bubblesPerMin', bubbles);
    if (file) form.set(file.type.startsWith('video/') ? 'video' : 'photo', file);
    try {
      await api.postJournal(batch.id, form);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not publish this update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#221D19', border: '1px solid #33291F', borderRadius: 20, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ font: "700 16px 'Bricolage Grotesque'", color: '#FBF6EC' }}>
        Day {batch.stage.currentDay} update · {batch.name}
      </div>

      <label
        style={{
          height: 110,
          border: '1.5px dashed #453728',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          color: '#8A7A63',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 22 }}>📷</div>
        <div style={{ font: "500 12px 'IBM Plex Sans'" }}>{file ? file.name : 'Add photo or video of the airlock'}</div>
        <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
      </label>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What does it look, smell and taste like today?"
        style={{ width: '100%', boxSizing: 'border-box', height: 86, background: '#14110F', border: '1.5px solid #33291F', borderRadius: 14, padding: '13px 14px', font: "400 13.5px/1.5 'IBM Plex Sans'", color: '#FBF6EC', outline: 'none', resize: 'none' }}
      />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Day ${batch.stage.currentDay} — headline (optional)`} style={{ ...inputStyle, font: "600 13.5px 'IBM Plex Sans'" }} />

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ font: "600 10.5px 'IBM Plex Mono'", color: '#8A7A63', letterSpacing: '.1em', marginBottom: 6 }}>GRAVITY</div>
          <input value={sg} onChange={(e) => setSg(e.target.value)} placeholder="1.016" style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ font: "600 10.5px 'IBM Plex Mono'", color: '#8A7A63', letterSpacing: '.1em', marginBottom: 6 }}>TEMP °C</div>
          <input value={tempC} onChange={(e) => setTempC(e.target.value)} placeholder="19.4" style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ font: "600 10.5px 'IBM Plex Mono'", color: '#8A7A63', letterSpacing: '.1em', marginBottom: 6 }}>BUB/MIN</div>
          <input value={bubbles} onChange={(e) => setBubbles(e.target.value)} placeholder="3" style={inputStyle} />
        </div>
      </div>

      {error && <div style={{ font: "500 12.5px 'IBM Plex Sans'", color: '#F2856B' }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{ background: '#33291F', border: 'none', borderRadius: 14, padding: '14px 16px', color: '#8A7A63', font: "600 13px 'IBM Plex Sans'", cursor: 'pointer' }}>
          Back
        </button>
        <button
          onClick={submit}
          disabled={saving}
          style={{ flex: 1, background: '#F0B429', border: 'none', borderRadius: 14, padding: 14, color: '#1B1512', font: "800 14px 'Bricolage Grotesque'", cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Publishing…' : `Publish to ${batch.seats} guests`}
        </button>
      </div>
    </div>
  );
}
