'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  return (
    <nav style={styles.bottomNav}>
      <button
        onClick={() => router.push('/list')}
        style={{
          ...styles.navItem,
          color: isActive('/list') ? '#E8853B' : '#999',
        }}
      >
        ☰
      </button>
      <button onClick={() => router.push('/')} style={styles.navCenter}>
        <span style={styles.navCenterEmoji}>🍱</span>
      </button>
      <button
        onClick={() => router.push('/friends')}
        style={{
          ...styles.navItem,
          color: isActive('/friends') ? '#E8853B' : '#999',
        }}
      >
        👥
      </button>
    </nav>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  bottomNav: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 16px',
    borderTop: '1px solid #eee',
    background: '#fff',
    position: 'relative',
    height: 64,
  },
  navItem: {
    background: 'transparent',
    border: 'none',
    fontSize: 24,
    cursor: 'pointer',
    flex: 1,
  },
  navCenter: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#F5B042',
    border: '3px solid #fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    marginTop: -20,
  },
  navCenterEmoji: { fontSize: 24 },
};