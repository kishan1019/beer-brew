import type { AdminBatchDetail, AdminBatchSummary, GuestBatchResponse, JournalPost } from './types';

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: opts.body && !(opts.body instanceof FormData) ? { 'Content-Type': 'application/json' } : undefined,
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  redeem: (code: string) => request<{ code: string }>('/api/redeem', { method: 'POST', body: JSON.stringify({ code }) }),

  guestBatch: (code: string, guestId: string) =>
    request<GuestBatchResponse>(`/api/batches/${encodeURIComponent(code)}?guestId=${encodeURIComponent(guestId)}`),

  bookSlot: (code: string, guestId: string, slotId: string) =>
    request<{ ok: true }>(`/api/batches/${encodeURIComponent(code)}/pickup/book`, {
      method: 'POST',
      body: JSON.stringify({ guestId, slotId }),
    }),

  unbookSlot: (code: string, guestId: string) =>
    request<{ ok: true }>(`/api/batches/${encodeURIComponent(code)}/pickup/unbook`, {
      method: 'POST',
      body: JSON.stringify({ guestId }),
    }),

  adminLogin: (password: string) =>
    request<{ ok: true }>('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),

  adminLogout: () => request<{ ok: true }>('/api/admin/logout', { method: 'POST' }),

  adminSession: () => request<{ ok: true }>('/api/admin/session'),

  adminBatches: () => request<{ batches: AdminBatchSummary[] }>('/api/admin/batches'),

  adminBatch: (id: string) => request<{ batch: AdminBatchDetail; posts: JournalPost[] }>(`/api/admin/batches/${id}`),

  createBatch: (payload: Record<string, unknown>) =>
    request<{ batch: AdminBatchSummary }>('/api/admin/batches', { method: 'POST', body: JSON.stringify(payload) }),

  markBottled: (id: string) => request<{ batch: AdminBatchSummary }>(`/api/admin/batches/${id}/bottle`, { method: 'POST' }),

  postJournal: (id: string, formData: FormData) =>
    request<{ post: JournalPost }>(`/api/admin/batches/${id}/journal`, { method: 'POST', body: formData }),
};

export function getOrCreateGuestId(): string {
  const key = 'bb_guest_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
