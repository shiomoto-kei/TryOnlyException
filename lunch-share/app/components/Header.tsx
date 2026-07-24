'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  loadStoredProfile,
  loadUserProfile,
  PROFILE_UPDATED_EVENT,
} from '../lib/profileStorage';

export default function Header() {
  const router = useRouter();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  useEffect(() => {
    const syncProfile = () => {
      setAvatarSrc(loadStoredProfile().avatarSrc);
    };
    const syncUserProfile = async () => {
      const profile = await loadUserProfile();
      setAvatarSrc(profile.avatarSrc);
    };

    syncProfile();
    syncUserProfile();
    window.addEventListener(PROFILE_UPDATED_EVENT, syncProfile);
    window.addEventListener('storage', syncProfile);

    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, syncProfile);
      window.removeEventListener('storage', syncProfile);
    };
  }, []);

  return (
    <header style={styles.header}>
      <button
        onClick={() => router.push('/main')}
        style={styles.logoButton}
        aria-label="ホームに戻る"
      >
        <img src="/meating_logo.png" alt="みーてぃんぐ" style={styles.logoImg} />
      </button>

      <button
        onClick={() => router.push('/profile')}
        style={{
          ...styles.profileAvatar,
          backgroundImage: avatarSrc ? `url(${avatarSrc})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
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
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  logoButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
  },
  logoImg: {
    height: 48,
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
