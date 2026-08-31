import type { ReactNode } from 'react';

export default function Screen({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 460,
        height: 'calc(100dvh - 78px)',
        maxHeight: 900,
        borderRadius: 28,
        background: '#FBF6EC',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 30px 60px -20px rgba(40,26,10,.35)',
      }}
    >
      {children}
    </div>
  );
}
