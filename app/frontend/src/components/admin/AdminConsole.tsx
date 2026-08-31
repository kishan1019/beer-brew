import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { AdminBatchSummary } from '../../lib/types';
import AdminLogin from './AdminLogin';
import BatchList from './BatchList';
import NewBatchForm from './NewBatchForm';
import PostUpdateForm from './PostUpdateForm';

type View = 'list' | 'new' | 'post';

export default function AdminConsole() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [view, setView] = useState<View>('list');
  const [batches, setBatches] = useState<AdminBatchSummary[]>([]);
  const [postTarget, setPostTarget] = useState<AdminBatchSummary | null>(null);

  useEffect(() => {
    api
      .adminSession()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  const refresh = useCallback(() => {
    api.adminBatches().then((res) => setBatches(res.batches));
  }, []);

  useEffect(() => {
    if (authed) refresh();
  }, [authed, refresh]);

  if (authed === null) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A7A63', background: '#14110F' }}>Loading…</div>;
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#14110F' }}>
      <div style={{ flex: 'none', padding: '22px 22px 14px', color: '#FBF6EC', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ font: "600 10.5px 'IBM Plex Mono'", letterSpacing: '.16em', color: '#7BC47F', textTransform: 'uppercase' }}>Host console</div>
          <div style={{ font: "800 25px 'Bricolage Grotesque'", letterSpacing: '-.03em', marginTop: 4 }}>Your batches</div>
        </div>
        <button
          onClick={() => api.adminLogout().then(() => setAuthed(false))}
          style={{ background: 'rgba(251,246,236,.12)', border: 'none', borderRadius: 12, padding: '8px 12px', color: '#FBF6EC', font: "600 11px 'IBM Plex Sans'", cursor: 'pointer' }}
        >
          Sign out
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 20px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {view === 'list' && (
          <BatchList batches={batches} onNewBatch={() => setView('new')} onPostUpdate={(b) => { setPostTarget(b); setView('post'); }} onRefresh={refresh} />
        )}
        {view === 'new' && (
          <NewBatchForm
            onCreated={() => {
              setView('list');
              refresh();
            }}
            onCancel={() => setView('list')}
          />
        )}
        {view === 'post' && postTarget && (
          <PostUpdateForm
            batch={postTarget}
            onDone={() => {
              setView('list');
              refresh();
            }}
            onCancel={() => setView('list')}
          />
        )}
      </div>
    </div>
  );
}
