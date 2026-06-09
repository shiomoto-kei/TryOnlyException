'use client';

import { useState } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const memberPositions = [
  { angle: -90 }, { angle: -45 }, { angle: 0 }, { angle: 45 },
  { angle: 90 }, { angle: 135 }, { angle: 180 }, { angle: 225 },
];

export default function TenpoPage() {
  const [shop, setShop] = useState('');
  const [menu, setMenu] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    console.log({ shop, menu, comment });
    // TODO: Supabase などに保存
  };

  return (
    <div style={styles.page}>
      <Header />

      <div style={styles.groupRow}>
        <div style={styles.groupIcon} />
        <span style={styles.groupName}>ささき隊</span>
      </div>

      <main style={styles.main}>
        {/* 背景の円形メンバー（薄く表示） */}
        <div style={styles.circleArea}>
          {memberPositions.map((m, i) => {
            const radius = 110;
            const rad = (m.angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            return (
              <div
                key={i}
                style={{
                  ...styles.memberAvatar,
                  transform: `translate(${x}px, ${y}px)`,
                }}
              />
            );
          })}
        </div>

        {/* 投稿フォームカード */}
        <div style={styles.card}>
          <div style={styles.field}>
            <label style={styles.label}>行きたいお店：</label>
            <input
              type="text"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>美味しいメニュー：</label>
            <input
              type="text"
              value={menu}
              onChange={(e) => setMenu(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.commentField}>
            <label style={styles.commentLabel}>ひとこと</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={styles.commentInput}
            />
          </div>

          <button onClick={handleSubmit} style={styles.submitButton}>
            投稿
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
  groupRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  groupIcon: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#e0e0e0',
  },
  groupName: { fontSize: 14, color: '#bbb' },
  main: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleArea: {
    position: 'absolute',
    width: 260,
    height: 260,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
  },
  memberAvatar: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: '#e0e0e0',
  },
  card: {
    position: 'relative',
    width: 'min(85%, 320px)',
    background: '#fff',
    borderRadius: 8,
    padding: '24px 20px',
    border: '1px solid #999',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, color: '#444' },
  input: {
    border: 'none',
    borderBottom: '1px solid #999',
    padding: '6px 4px',
    fontSize: 14,
    outline: 'none',
    background: 'transparent',
  },
  commentField: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  commentLabel: { fontSize: 13, color: '#444', whiteSpace: 'nowrap' },
  commentInput: {
    flex: 1,
    border: '1px solid #999',
    borderRadius: 4,
    padding: '6px 8px',
    fontSize: 14,
    outline: 'none',
    background: '#fff',
  },
  submitButton: {
    alignSelf: 'center',
    background: '#F5B042',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '8px 28px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 8,
    boxShadow: '0 2px 0 #C97D20',
  },
};