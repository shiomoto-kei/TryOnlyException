'use client';

import { useState } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const memberPositions = [
  { angle: -90 }, { angle: -45 }, { angle: 0 }, { angle: 45 },
  { angle: 90 }, { angle: 135 }, { angle: 180 }, { angle: 225 },
];

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shop, setShop] = useState('');
  const [menu, setMenu] = useState('');
  const [comment, setComment] = useState('');

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    console.log({ shop, menu, comment });
    setIsModalOpen(false);
  };

  return (
    <div style={styles.page}>
      <Header />

      <div style={styles.groupRow}>
        <div style={styles.groupIcon} />
        <span style={styles.groupName}>ささき隊</span>
      </div>

      <main style={styles.main}>
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
          <button onClick={handleAdd} style={styles.addButton}>＋</button>
        </div>

        {isModalOpen && (
          <div
            style={styles.modalBackdrop}
            role="presentation"
            onClick={() => setIsModalOpen(false)}
          >
            <section
              aria-modal="true"
              role="dialog"
              aria-label="行きたいお店登録"
              style={styles.modalCard}
              onClick={(event) => event.stopPropagation()}
            >
              <label style={styles.field}>
                <span style={styles.label}>行きたいお店：</span>
                <input
                  type="text"
                  value={shop}
                  onChange={(event) => setShop(event.target.value)}
                  style={styles.underlineInput}
                />
              </label>

              <label style={styles.field}>
                <span style={styles.label}>美味しいメニュー：</span>
                <input
                  type="text"
                  value={menu}
                  onChange={(event) => setMenu(event.target.value)}
                  style={styles.underlineInput}
                />
              </label>

              <label style={styles.commentField}>
                <span style={styles.commentLabel}>ひとこと</span>
                <input
                  type="text"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  style={styles.commentInput}
                />
              </label>

              <button onClick={handleSubmit} style={styles.submitButton}>
                投稿
              </button>
            </section>
          </div>
        )}
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
    fontFamily: '-apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
  },
  groupRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  groupIcon: { width: 20, height: 20, borderRadius: '50%', background: '#e0e0e0' },
  groupName: { fontSize: 14, color: '#333' },
  main: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleArea: {
    width: 260,
    height: 260,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatar: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: '#d4d4d4',
  },
  addButton: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    background: '#FF5757',
    color: '#fff',
    fontSize: 32,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(255,87,87,0.4)',
  },
  modalBackdrop: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.55)',
    zIndex: 5,
  },
  modalCard: {
    width: 'min(72vw, 300px)',
    minHeight: 168,
    padding: '24px 18px 16px',
    border: '1px solid #888',
    borderRadius: 14,
    background: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    boxSizing: 'border-box',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  label: {
    color: '#555',
    fontSize: 10,
    lineHeight: 1.3,
  },
  underlineInput: {
    width: '100%',
    height: 20,
    padding: '2px 0',
    border: 'none',
    borderBottom: '1px solid #bcbcbc',
    borderRadius: 0,
    background: 'transparent',
    color: '#333',
    fontSize: 12,
    outlineColor: '#F5B042',
    boxSizing: 'border-box',
  },
  commentField: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  commentLabel: {
    color: '#555',
    fontSize: 10,
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
  },
  commentInput: {
    flex: 1,
    minWidth: 0,
    height: 22,
    padding: '2px 6px',
    border: '1px solid #aaa',
    borderRadius: 2,
    background: '#fff',
    color: '#333',
    fontSize: 12,
    outlineColor: '#F5B042',
    boxSizing: 'border-box',
  },
  submitButton: {
    alignSelf: 'center',
    minWidth: 58,
    height: 24,
    marginTop: 2,
    padding: '0 14px',
    border: 'none',
    borderRadius: 4,
    background: '#F5B042',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 0 #C98421',
  },
};
