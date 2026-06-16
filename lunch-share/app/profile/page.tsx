'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('ささき しょうま');
  const [editing, setEditing] = useState(false);

  const handleLogout = () => {
    console.log('ログアウト');
    // TODO: Supabase signOut → router.push('/login')
  };

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        {/* アバター */}
        <div style={styles.avatarWrap}>
          <div style={styles.avatar} />
          <button style={styles.changeImgBtn}>画像を変更</button>
        </div>

        {/* 名前 */}
        <div style={styles.nameRow}>
          {editing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setEditing(false)}
              autoFocus
              style={styles.nameInput}
            />
          ) : (
            <span style={styles.nameText}>{name}</span>
          )}
          <button onClick={() => setEditing(true)} style={styles.editBtn}>
            ✎
          </button>
        </div>

        {/* メニューグリッド */}
        <div style={styles.grid}>
          <button onClick={handleLogout} style={styles.menuButton}>
            <span style={styles.menuIcon}>⎋</span>
            <span style={styles.menuLabel}>ログアウト</span>
          </button>

          <button
            onClick={() => router.push('/profile/info')}
            style={styles.menuButton}
          >
            <span style={styles.menuIcon}>📋</span>
            <span style={styles.menuLabel}>登録情報</span>
          </button>

          <button
            onClick={() => router.push('/friends/add')}
            style={styles.menuButton}
          >
            <span style={styles.menuIcon}>👤＋</span>
            <span style={styles.menuLabel}>フレンド追加</span>
          </button>

          <button
            onClick={() => router.push('/friends')}
            style={styles.menuButton}
          >
            <span style={styles.menuIcon}>👥</span>
            <span style={styles.menuLabel}>フレンド一覧</span>
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    fontFamily:
      '-apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
  },
  main: {
    flex: 1,
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  // アバター
  avatarWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: '#d4d4d4',
    border: '3px solid #5b9bd5',
  },
  changeImgBtn: {
    background: '#fff',
    border: '1px solid #999',
    borderRadius: 4,
    padding: '2px 8px',
    fontSize: 10,
    color: '#444',
    cursor: 'pointer',
  },
  // 名前
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderBottom: '1px solid #ddd',
    paddingBottom: 4,
    width: '70%',
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: 2,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: 600,
    border: 'none',
    outline: 'none',
    textAlign: 'center',
    background: 'transparent',
    flex: 1,
  },
  editBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
    color: '#888',
  },
  // メニューグリッド
  grid: {
    width: '100%',
    maxWidth: 320,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginTop: 20,
  },
  menuButton: {
    aspectRatio: '1 / 1',
    background: '#FCEBA9',
    border: 'none',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },
  menuIcon: {
    fontSize: 40,
    color: '#7a6230',
  },
  menuLabel: {
    fontSize: 13,
    color: '#5a4a2a',
    fontWeight: 600,
  },
};