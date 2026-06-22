'use client';

import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const LogoutIcon = () => (
  <svg width="48" height="48" viewBox="0 0 81 81" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M67.5 40.5H35.4375M60.75 50.625L70.875 40.5L60.75 30.375M43.875 23.625V20.25C43.875 18.4598 43.1638 16.7429 41.898 15.477C40.6321 14.2112 38.9152 13.5 37.125 13.5H20.25C18.4598 13.5 16.7429 14.2112 15.477 15.477C14.2112 16.7429 13.5 18.4598 13.5 20.25V60.75C13.5 62.5402 14.2112 64.2571 15.477 65.523C16.7429 66.7888 18.4598 67.5 20.25 67.5H37.125C38.9152 67.5 40.6321 66.7888 41.898 65.523C43.1638 64.2571 43.875 62.5402 43.875 60.75V57.375" stroke="#535353" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RegisterInfoIcon = () => (
  <svg width="48" height="48" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.3333 6.16699H46.25L61.6667 21.5837V67.8337H12.3333V6.16699Z" stroke="#535353" strokeWidth="4" strokeLinecap="square"/>
    <path d="M52.4167 58.5837C52.4167 56.1304 51.4421 53.7776 49.7074 52.0429C47.9727 50.3082 45.6199 49.3337 43.1667 49.3337H30.8333C28.3801 49.3337 26.0273 50.3082 24.2926 52.0429C22.5579 53.7776 21.5833 56.1304 21.5833 58.5837M44.7083 32.3753C44.7083 34.4197 43.8962 36.3803 42.4506 37.8259C41.005 39.2715 39.0444 40.0837 37 40.0837C34.9556 40.0837 32.995 39.2715 31.5494 37.8259C30.1038 36.3803 29.2917 34.4197 29.2917 32.3753C29.2917 30.3309 30.1038 28.3703 31.5494 26.9247C32.995 25.4791 34.9556 24.667 37 24.667C39.0444 24.667 41.005 25.4791 42.4506 26.9247C43.8962 28.3703 44.7083 30.3309 44.7083 32.3753Z" stroke="#535353" strokeWidth="4" strokeLinecap="square"/>
  </svg>
);

const AddFriendIcon = () => (
  <svg width="48" height="48" viewBox="0 0 66 66" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M49.5 49.5H49.0811C48.5869 47.0938 47.7168 44.8809 46.4707 42.8613C45.2246 40.8418 43.71 39.1016 41.9268 37.6406C40.1436 36.1797 38.1348 35.041 35.9004 34.2246C33.666 33.4082 31.3242 33 28.875 33C26.9844 33 25.1582 33.2471 23.3965 33.7412C21.6348 34.2354 19.9912 34.9229 18.4658 35.8037C16.9404 36.6846 15.5547 37.7588 14.3086 39.0264C13.0625 40.2939 11.9883 41.6904 11.0859 43.2158C10.1836 44.7412 9.48535 46.3848 8.99121 48.1465C8.49707 49.9082 8.25 51.7344 8.25 53.625H4.125C4.125 51.0469 4.50098 48.5654 5.25293 46.1807C6.00488 43.7959 7.08984 41.5938 8.50781 39.5742C9.92578 37.5547 11.6016 35.7607 13.5352 34.1924C15.4688 32.624 17.6602 31.3887 20.1094 30.4863C17.6816 28.8965 15.791 26.8984 14.4375 24.4922C13.084 22.0859 12.3965 19.4219 12.375 16.5C12.375 14.2227 12.8047 12.085 13.6641 10.0869C14.5234 8.08887 15.6943 6.33789 17.1768 4.83398C18.6592 3.33008 20.4102 2.14844 22.4297 1.28906C24.4492 0.429688 26.5977 0 28.875 0C31.1523 0 33.29 0.429688 35.2881 1.28906C37.2861 2.14844 39.0371 3.31934 40.541 4.80176C42.0449 6.28418 43.2266 8.03516 44.0859 10.0547C44.9453 12.0742 45.375 14.2227 45.375 16.5C45.375 17.918 45.2031 19.3037 44.8594 20.6572C44.5156 22.0107 44 23.2891 43.3125 24.4922C42.625 25.6953 41.8193 26.8018 40.8955 27.8115C39.9717 28.8213 38.8867 29.7129 37.6406 30.4863C40.0469 31.4102 42.2598 32.6777 44.2793 34.2891C46.2988 35.9004 48.0391 37.791 49.5 39.9609V49.5ZM16.5 16.5C16.5 18.2188 16.8223 19.8193 17.4668 21.3018C18.1113 22.7842 18.9922 24.0947 20.1094 25.2334C21.2266 26.3721 22.5371 27.2637 24.041 27.9082C25.5449 28.5527 27.1562 28.875 28.875 28.875C30.5723 28.875 32.1729 28.5527 33.6768 27.9082C35.1807 27.2637 36.4912 26.3828 37.6084 25.2656C38.7256 24.1484 39.6172 22.8379 40.2832 21.334C40.9492 19.8301 41.2715 18.2188 41.25 16.5C41.25 14.8027 40.9277 13.2021 40.2832 11.6982C39.6387 10.1943 38.7578 8.88379 37.6406 7.7666C36.5234 6.64941 35.2021 5.75781 33.6768 5.0918C32.1514 4.42578 30.5508 4.10352 28.875 4.125C27.1562 4.125 25.5557 4.44727 24.0732 5.0918C22.5908 5.73633 21.2803 6.61719 20.1416 7.73438C19.0029 8.85156 18.1113 10.1729 17.4668 11.6982C16.8223 13.2236 16.5 14.8242 16.5 16.5ZM57.75 53.625H66V57.75H57.75V66H53.625V57.75H45.375V53.625H53.625V45.375H57.75V53.625Z" fill="#535353"/>
  </svg>
);

const FriendListIcon = () => (
  <svg width="48" height="48" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M27.75 9.25C30.0368 9.25 32.2723 9.92813 34.1738 11.1986C36.0752 12.4691 37.5572 14.275 38.4324 16.3877C39.3075 18.5005 39.5365 20.8253 39.0903 23.0682C38.6442 25.3111 37.543 27.3714 35.9259 28.9884C34.3089 30.6055 32.2486 31.7067 30.0057 32.1528C27.7628 32.599 25.438 32.37 23.3252 31.4949C21.2125 30.6197 19.4066 29.1377 18.1361 27.2363C16.8656 25.3348 16.1875 23.0993 16.1875 20.8125C16.1875 17.7459 17.4057 14.805 19.5741 12.6366C21.7425 10.4682 24.6834 9.25 27.75 9.25ZM27.75 4.625C24.5484 4.625 21.4187 5.57438 18.7567 7.35309C16.0947 9.13179 14.0199 11.6599 12.7947 14.6178C11.5695 17.5757 11.2489 20.8305 11.8735 23.9705C12.4981 27.1106 14.0398 29.9949 16.3037 32.2588C18.5676 34.5227 21.4519 36.0644 24.592 36.689C27.732 37.3136 30.9868 36.993 33.9447 35.7678C36.9026 34.5426 39.4307 32.4678 41.2094 29.8058C42.9881 27.1438 43.9375 24.0141 43.9375 20.8125C43.9375 16.5193 42.232 12.402 39.1963 9.36621C36.1605 6.33046 32.0432 4.625 27.75 4.625ZM50.875 69.375H46.25V57.8125C46.25 54.7459 45.0318 51.805 42.8634 49.6366C40.695 47.4682 37.7541 46.25 34.6875 46.25H20.8125C17.7459 46.25 14.805 47.4682 12.6366 49.6366C10.4682 51.805 9.25 54.7459 9.25 57.8125V69.375H4.625V57.8125C4.625 53.5193 6.33046 49.402 9.36621 46.3662C12.402 43.3305 16.5193 41.625 20.8125 41.625H34.6875C38.9807 41.625 43.098 43.3305 46.1338 46.3662C49.1695 49.402 50.875 53.5193 50.875 57.8125V69.375ZM50.875 9.25H74V13.875H50.875V9.25ZM50.875 20.8125H74V25.4375H50.875V20.8125ZM50.875 32.375H67.0625V37H50.875V32.375Z" fill="#535353"/>
  </svg>
);

export default function ProfilePage() {
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const name = 'ささき しょうま';

 const handleLogoutConfirm = async () => {
  await supabase.auth.signOut();
  setIsLogoutModalOpen(false);
  router.push('/login');
};

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        {/* アバター（表示のみ） */}
        <div style={styles.avatarWrap}>
          <div style={styles.avatar} />
        </div>

        {/* 名前（表示のみ） */}
        <div style={styles.nameRow}>
          <span style={styles.nameText}>{name}</span>
        </div>

        {/* メニューグリッド */}
        <div style={styles.grid}>
          <button onClick={() => setIsLogoutModalOpen(true)} style={styles.menuButton}>
            <LogoutIcon />
            <span style={styles.menuLabel}>ログアウト</span>
          </button>

          <button
            onClick={() => router.push('/register-info')}
            style={styles.menuButton}
          >
            <RegisterInfoIcon />
            <span style={styles.menuLabel}>登録情報</span>
          </button>

          <button
            onClick={() => setIsQRModalOpen(true)}
            style={styles.menuButton}
          >
            <AddFriendIcon />
            <span style={styles.menuLabel}>フレンド追加</span>
          </button>

          <button
            onClick={() => router.push('/friendlist')}
            style={styles.menuButton}
          >
            <FriendListIcon />
            <span style={styles.menuLabel}>フレンド一覧</span>
          </button>
        </div>

        {/* ログアウト確認モーダル */}
        {isLogoutModalOpen && (
          <div
            style={styles.modalBackdrop}
            role="presentation"
            onClick={() => setIsLogoutModalOpen(false)}
          >
            <section
              aria-modal="true"
              role="dialog"
              style={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <p style={styles.modalTitle}>ログアウト</p>
              <p style={styles.modalBody}>ログアウトしてよろしいですか？</p>
              <div style={styles.modalButtons}>
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  style={styles.cancelButton}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  style={styles.okButton}
                >
                  OK
                </button>
              </div>
            </section>
          </div>
        )}

        {/* QRコードモーダル */}
        {isQRModalOpen && (
          <div
            style={styles.modalBackdrop}
            role="presentation"
            onClick={() => setIsQRModalOpen(false)}
          >
            <section
              aria-modal="true"
              role="dialog"
              style={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <p style={styles.modalTitle}>マイQRコード</p>
              <div style={styles.qrPlaceholder} />
              <div style={styles.modalButtons}>
                <button
                  onClick={() => setIsQRModalOpen(false)}
                  style={styles.cancelButton}
                >
                  閉じる
                </button>
                <button
                  onClick={() => router.push('/friendlist')}
                  style={styles.okButton}
                >
                  読み取る
                </button>
              </div>
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
    position: 'relative',
  },
  avatarWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: '#d4d4d4',
    border: '3px solid #5b9bd5',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #ddd',
    paddingBottom: 4,
    width: '47%',
    whiteSpace: 'nowrap',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: 2,
  },
  grid: {
    width: '100%',
    maxWidth: 260,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
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
  menuLabel: {
    fontSize: 13,
    color: '#5a4a2a',
    fontWeight: 600,
  },
  // モーダル共通
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.55)',
    zIndex: 10,
  },
  modalCard: {
    width: 'min(72vw, 300px)',
    padding: '24px 18px 16px',
    border: '1px solid #888',
    borderRadius: 14,
    background: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    boxSizing: 'border-box',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#333',
    margin: 0,
  },
  modalBody: {
    fontSize: 14,
    color: '#555',
    margin: 0,
    textAlign: 'center',
  },
  modalButtons: {
    display: 'flex',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    minWidth: 90,
    height: 36,
    border: '1px solid #ccc',
    borderRadius: 20,
    background: '#e0e0e0',
    color: '#333',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  okButton: {
    minWidth: 90,
    height: 36,
    border: 'none',
    borderRadius: 20,
    background: '#FF6B6B',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  // QRコード
  qrPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 8,
    background: '#d4d4d4',
  },
};