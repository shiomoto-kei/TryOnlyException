'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import PushNotificationManager from '../components/PushNotificationManager';
import { supabase } from '../lib/supabaseClient';
import { createLunchPost, getMainPageData } from './action';
import type { MainPageData } from './action';

const BubbleSvg = () => (
  <svg width="172" height="95" viewBox="0 0 172 95" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M86.426 93.3945C86.2298 93.7051 85.7766 93.7051 85.5803 93.3945L75.4788 77.4072C75.2685 77.0744 75.507 76.6399 75.9006 76.6396L96.1057 76.6396C96.4995 76.6397 96.7389 77.0743 96.5286 77.4072L86.426 93.3945Z" fill="white" stroke="black" />
    <rect x="0.5" y="0.5" width="171.008" height="78.6324" rx="4.5" fill="white" stroke="black" />
    <rect width="2.46583" height="2.78384" transform="matrix(0.924318 -0.381623 0.530522 0.847671 76.7155 78.3989)" fill="white" />
    <rect width="2.41037" height="2.60783" transform="matrix(0.921484 0.388417 -0.53843 0.84267 93.0873 77.501)" fill="white" />
    <rect x="79.0985" y="78" width="13.8102" height="2" fill="white" />
  </svg>
);

export default function HomePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [shop, setShop] = useState('');
  const [menu, setMenu] = useState('');
  const [comment, setComment] = useState('');
  const [pageData, setPageData] = useState<MainPageData | null>(null);
  const [message, setMessage] = useState('');
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const data = await getMainPageData(sessionData.session?.access_token);
    setPageData(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    if (pageData?.group.id === 'no-group') {
      router.push('/group');
      return;
    }

    setMessage('');
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const result = await createLunchPost({ shop, menu, comment }, accessToken);
      setMessage(result.message);
      if (!result.ok) return;

      const data = await getMainPageData(accessToken);
      setPageData(data);
      setShop('');
      setMenu('');
      setComment('');
      setMessage('');
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarClick = (id: string) => {
    setActiveBubbleId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={styles.page}>
      <Header />

      <button
        type="button"
        onClick={() => {
          if (pageData?.group.id === 'no-group') {
            router.push('/group');
            return;
          }

          setIsStatusModalOpen(true);
        }}
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

      <main style={styles.main} onClick={() => setActiveBubbleId(null)}>
        <div style={styles.circleArea}>
          {pageData?.group.id !== 'no-group' && pageData?.members.map((member) => {
            const radius = 110;
            const rad = (member.angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            const isActive = activeBubbleId === member.id;

            return (
              <div
                key={member.id}
                style={{
                  ...styles.memberWrapper,
                  transform: `translate(${x}px, ${y}px)`,
                }}
              >
                {isActive && (
                  <div style={styles.bubbleWrapper}>
                    <BubbleSvg />
                    <p style={styles.bubbleText}>
                      <span style={styles.bubbleShop}>
                        {member.shop ?? '未投稿'}
                      </span>
                      {member.shop && member.menu && (
                        <>
                          {' の '}
                          <span style={styles.bubbleMenu}>{member.menu}</span>
                          {' が食べたい！'}
                        </>
                      )}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  title={member.name}
                  aria-label={`${member.name}の投稿を見る`}
                  style={{
                    ...styles.memberAvatar,
                    background: member.avatarColor,
                    border: member.shop && member.menu ? '3px solid #FF5757' : '3px solid #B9D7FF',
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAvatarClick(member.id);
                  }}
                />
              </div>
            );
          })}

          {pageData?.group.id === 'no-group' && (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>
                グループに参加すると、メンバーの投稿が表示されます。
              </p>
              <button
                type="button"
                onClick={() => router.push('/group')}
                style={styles.groupCreateButton}
              >
                グループを作成
              </button>
            </div>
          )}

          {pageData?.group.id !== 'no-group' && (
            <button type="button" onClick={handleAdd} style={styles.addButton}>
              +
            </button>
          )}
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
              aria-label="みんなの投稿状況"
              style={styles.statusModalCard}
              onClick={(event) => event.stopPropagation()}
            >
              <div style={styles.flagWrapper}>
                <img src="/flag.png" alt="" style={styles.flagImage} />
                <span style={styles.flagText}>みんなの投稿状況</span>
              </div>

              <ul style={styles.statusList}>
                {(pageData?.members ?? []).map((member) => {
                  const hasPost = Boolean(member.shop && member.menu);

                  return (
                    <li key={member.id} style={styles.statusRow}>
                      <div
                        style={{
                          ...styles.statusAvatar,
                          background: member.avatarColor,
                        }}
                      />
                      <span style={styles.statusName}>{member.name}</span>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(hasPost ? styles.statusBadgeYes : styles.statusBadgeNo),
                        }}
                      >
                        {hasPost ? 'あり' : 'なし'}
                      </span>
                    </li>
                  );
                })}
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

              <button
                type="button"
                onClick={handleSubmit}
                style={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? '投稿中...' : '投稿'}
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
  memberWrapper: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: '#d4d4d4',
    cursor: 'pointer',
    padding: 0,
  },
  emptyText: {
    width: 220,
    margin: 0,
    color: '#777',
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.6,
    textAlign: 'center',
  },
  bubbleWrapper: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: 4,
    width: 172,
    zIndex: 10,
  },
  bubbleText: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 79,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 12px',
    margin: 0,
    fontSize: 11,
    fontWeight: 700,
    color: '#333',
    lineHeight: 1.5,
    textAlign: 'center',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  },
  emptyState: {
    width: 220,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  groupCreateButton: {
    height: 34,
    padding: '0 16px',
    border: 'none',
    borderRadius: 6,
    background: '#F5B042',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 0 #C98421',
  },
  bubbleShop: {
    color: '#D27000',
  },
  bubbleMenu: {
    color: '#D6437A',
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
