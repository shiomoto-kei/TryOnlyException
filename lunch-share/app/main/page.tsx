'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import PushNotificationManager from '../components/PushNotificationManager';
import { createLunchPost, getMainPageData } from './action';
import type { MainPageData } from './action';

const sampleStatuses: { id: string; name: string; mealStatus: 'ある' | 'ない' }[] = [
  { id: '1', name: 'ささき しょうま', mealStatus: 'ある' },
  { id: '2', name: 'ささき しょうま', mealStatus: 'ない' },
  { id: '3', name: 'ささき しょうま', mealStatus: 'ない' },
  { id: '4', name: 'ささき しょうま', mealStatus: 'ある' },
  { id: '5', name: 'ささき しょうま', mealStatus: 'ある' },
];

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [shop, setShop] = useState('');
  const [menu, setMenu] = useState('');
  const [comment, setComment] = useState('');
  const [pageData, setPageData] = useState<MainPageData | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      const data = await getMainPageData();
      setPageData(data);
    }

    loadData();
  }, []);

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const result = await createLunchPost({ shop, menu, comment });
    setMessage(result.message);
    if (!result.ok) return;
    setShop('');
    setMenu('');
    setComment('');
    setIsModalOpen(false);
  };

  return (
    <div style={styles.page}>
      <Header />

      <button
        type="button"
        onClick={() => setIsStatusModalOpen(true)}
        style={styles.groupRow}
      >
        <div
          style={{
            ...styles.groupIcon,
            background: pageData?.group.iconColor ?? '#e0e0e0',
          }}
        />
        <span style={styles.groupName}>
          {pageData?.group.name ?? '読み込み中...'}
        </span>
      </button>

      <PushNotificationManager />

      <main style={styles.main}>
        <div style={styles.circleArea}>
          {pageData?.members.map((member) => {
            const radius = 110;
            const rad = (member.angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <div
                key={member.id}
                title={member.name}
                style={{
                  ...styles.memberAvatar,
                  background: member.avatarColor,
                  transform: `translate(${x}px, ${y}px)`,
                }}
              />
            );
          })}

          <button onClick={handleAdd} style={styles.addButton}>＋</button>
        </div>

        {isStatusModalOpen && (
          <div
            style={styles.modalBackdrop}
            role="presentation"
            onClick={() => setIsStatusModalOpen(false)}
          >
            <section
              aria-modal="true"
              role="dialog"
              aria-label="みんなのご飯状況"
              style={styles.statusModalCard}
              onClick={(event) => event.stopPropagation()}
            >
              <div style={styles.flagWrapper}>
                <img src="/flag.png" alt="" style={styles.flagImage} />
                <span style={styles.flagText}>みんなのご飯状況</span>
              </div>

              <ul style={styles.statusList}>
                {sampleStatuses.map((member) => (
                  <li key={member.id} style={styles.statusRow}>
                    <div
                      style={{
                        ...styles.statusAvatar,
                        background:
                          pageData?.members.find((m) => m.id === member.id)?.avatarColor ?? '#d4d4d4',
                      }}
                    />
                    <span style={styles.statusName}>{member.name}</span>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(member.mealStatus === 'ある'
                          ? styles.statusBadgeYes
                          : styles.statusBadgeNo),
                      }}
                    >
                      {member.mealStatus}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {isModalOpen && (
          <div
            style={styles.modalBackdrop}
            role="presentation"
            onClick={() => {
              setMessage('');
              setIsModalOpen(false);
            }}
          >
            <section
              aria-modal="true"
              role="dialog"
              aria-label="行きたいお店の投稿"
              style={styles.modalCard}
              onClick={(event) => event.stopPropagation()}
            >
              <label style={styles.field}>
                <span style={styles.label}>行きたいお店</span>
                <input
                  type="text"
                  value={shop}
                  onChange={(event) => setShop(event.target.value)}
                  style={styles.underlineInput}
                />
              </label>

              <label style={styles.field}>
                <span style={styles.label}>食べたいメニュー</span>
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

              {message && <p style={styles.message}>{message}</p>}

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

const styles: { [key: string]: CSSProperties } = {
  page: {
    minHeight: '100vh',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
    paddingTop: 72,
    paddingBottom: 72,
  },
  groupRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
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
  statusModalCard: {
    width: 'min(78vw, 320px)',
    padding: '0 18px 20px',
    border: '1px solid #888',
    borderRadius: 14,
    background: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  flagWrapper: {
    position: 'relative',
    margin: '16px 0 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  flagText: {
    position: 'absolute',
    color: '#D27000',
    fontSize: 20,
    fontWeight: 700,
  },
  statusList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statusAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#d4d4d4',
    flexShrink: 0,
  },
  statusName: {
    flex: 1,
    fontSize: 13,
    fontWeight: 700,
    color: '#333',
  },
  statusBadge: {
    minWidth: 44,
    textAlign: 'center',
    padding: '3px 10px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
  },
  statusBadgeYes: {
    background: '#FBD9E6',
    color: '#D6437A',
  },
  statusBadgeNo: {
    background: '#D7ECF7',
    color: '#3E8FBF',
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
    fontWeight: 700,
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
    fontWeight: 700,
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
    fontWeight: 700,
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
    fontWeight: 700,
    outlineColor: '#F5B042',
    boxSizing: 'border-box',
  },
  message: {
    margin: '2px 0 0',
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.5,
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