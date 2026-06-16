'use client';

import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  return (
    <header style={styles.header}>
      <button
        onClick={() => router.push('/main')}
        style={styles.logoButton}
        aria-label="ホームに戻る"
      >
        <img src="/logo.png" alt="みーてぃんぐ" style={styles.logoImg} />
      </button>

      <button
        onClick={() => router.push('/profile')}
        style={styles.profileAvatar}
        aria-label="プロフィール"
      />
    </header>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    background: '#F5B042',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
  },
  logoImg: {
    height: 36,
    width: 'auto',
    objectFit: 'contain',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#d4d4d4',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
};