'use client';

import { useState } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

type Friend = {
  id: number;
  name: string;
};

const initialFriends: Friend[] = [
  { id: 1, name: 'ささき　しょうま' },
  { id: 2, name: 'ささき　しょうま' },
  { id: 3, name: 'ささき　しょうま' },
  { id: 4, name: 'ささき　しょうま' },
  { id: 5, name: 'ささき　しょうま' },
];

export default function FriendListPage() {
  const [friends] = useState<Friend[]>(initialFriends);

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        <div style={styles.titleWrap}>
          <span style={styles.titleText}>フレンド一覧</span>
        </div>

        <div style={styles.friendList}>
          {friends.map((friend) => (
            <div key={friend.id} style={styles.friendRow}>
              <div style={styles.friendAvatar} />
              <span style={styles.friendName}>{friend.name}</span>
            </div>
          ))}
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
    gap: 24,
  },
  titleWrap: {
    background: '#FFF6C9',
    border: '3px solid #F5B042',
    padding: '10px 32px',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 700,
    color: '#4a4a4a',
  },
  friendList: {
    width: '100%',
    maxWidth: 280,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  friendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#d4d4d4',
    flexShrink: 0,
  },
  friendName: {
    fontSize: 15,
    color: '#333',
    fontWeight: 500,
  },
};