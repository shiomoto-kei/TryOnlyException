'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const PenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M13.198 1.22004L3.12001 11.298C2.96935 11.4483 2.87057 11.6428 2.83801 11.853L2.13301 16.447C2.10922 16.6022 2.12229 16.7608 2.17117 16.91C2.22005 17.0591 2.30336 17.1947 2.41435 17.3057C2.52535 17.4167 2.66092 17.5 2.81009 17.5489C2.95927 17.5978 3.11785 17.6108 3.27301 17.587L7.86801 16.882C8.07818 16.8498 8.27259 16.7513 8.42301 16.601L18.501 6.52304C18.6885 6.33552 18.7938 6.08121 18.7938 5.81604C18.7938 5.55088 18.6885 5.29657 18.501 5.10905L14.611 1.21904C14.4235 1.03188 14.1694 0.926758 13.9045 0.926758C13.6396 0.926758 13.3855 1.03188 13.198 1.21904M4.31701 15.404L4.76501 12.48L13.905 3.34004L16.38 5.81604L7.24001 14.956L4.31701 15.404Z" fill="#9B9B9B"/>
    <path d="M11.442 5.24752L12.502 4.18652L15.744 7.42652L14.683 8.48752L11.442 5.24752Z" fill="#9B9B9B"/>
  </svg>
);

export default function RegisterInfoPage() {
  const router = useRouter();
  const [name, setName] = useState('ささき しょうま');
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [email, setEmail] = useState('1234567@ecc.ac.jp');
  const [password, setPassword] = useState('password123');
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditStart = () => {
    setTempName(name);
    setEditing(true);
  };

  const handleEditDone = () => {
    setName(tempName);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleEditDone();
    if (e.key === 'Escape') setEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarSrc(url);
  };

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        {/* 戻るボタン */}
        <div style={styles.backRow}>
          <button
            onClick={() => router.push('/profile')}
            style={styles.backButton}
          >
            {'<'}
          </button>
        </div>

        {/* アバター */}
        <div style={styles.avatarWrap}>
          <div
            style={{
              ...styles.avatar,
              backgroundImage: avatarSrc ? `url(${avatarSrc})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <button
            style={styles.changeImgBtn}
            onClick={() => fileInputRef.current?.click()}
          >
            画像を変更
          </button>
        </div>

        {/* 名前 */}
        <div style={styles.nameRow}>
          {editing ? (
            <>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                style={styles.nameInput}
              />
              <button onClick={handleEditDone} style={styles.editDoneBtn}>
                完了
              </button>
            </>
          ) : (
            <>
              <span style={styles.nameText}>{name}</span>
              <button onClick={handleEditStart} style={styles.editBtn}>
                <PenIcon />
              </button>
            </>
          )}
        </div>

        {/* メールアドレス・パスワード */}
        <div style={styles.fieldList}>
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>メールアドレス</span>
            {editingEmail ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEditingEmail(false)}
                autoFocus
                style={styles.fieldEditInput}
              />
            ) : (
              <>
                <span style={styles.fieldValue}>{email}</span>
                <button
                  style={styles.arrowBtn}
                  onClick={() => setEditingEmail(true)}
                >
                  ›
                </button>
              </>
            )}
          </div>

          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>パスワード</span>
            {editingPassword ? (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setEditingPassword(false)}
                autoFocus
                style={styles.fieldEditInput}
              />
            ) : (
              <>
                <span style={styles.fieldValue}>{'•'.repeat(password.length)}</span>
                <button
                  style={styles.arrowBtn}
                  onClick={() => setEditingPassword(true)}
                >
                  ›
                </button>
              </>
            )}
          </div>
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
    padding: '12px 20px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  backRow: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  backButton: {
    width: 36,
    height: 36,
    border: '1px solid #ccc',
    borderRadius: 6,
    background: '#fff',
    fontSize: 16,
    fontWeight: 700,
    color: '#333',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderBottom: '1px solid #ddd',
    paddingBottom: 4,
    width: '47%',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
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
    cursor: 'pointer',
    padding: 2,
    display: 'flex',
    alignItems: 'center',
  },
  editDoneBtn: {
    background: '#F5B042',
    border: 'none',
    borderRadius: 4,
    padding: '2px 10px',
    fontSize: 13,
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  fieldList: {
    width: '100%',
    maxWidth: 320,
    display: 'flex',
    flexDirection: 'column',
    marginTop: 8,
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #F5B042',
    padding: '14px 4px',
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#555',
    whiteSpace: 'nowrap',
    minWidth: 100,
  },
  fieldValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
  },
  arrowBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: 20,
    color: '#aaa',
    cursor: 'pointer',
    padding: '0 2px',
    lineHeight: 1,
  },
  fieldEditInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 14,
    color: '#333',
    background: 'transparent',
    textAlign: 'right',
    boxSizing: 'border-box',
  },
};