'use client';

import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import ShopCard from '../components/ShopCard';
import { createShop, getShops, type Shop } from './action';

const MagnifyingGlass = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 13 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <g clipPath="url(#clip0_292_559)">
      <path
        d="M10.5625 5.28125C10.5625 6.44668 10.1842 7.52324 9.54688 8.39668L12.7613 11.6137C13.0787 11.9311 13.0787 12.4465 12.7613 12.7639C12.4439 13.0813 11.9285 13.0813 11.6111 12.7639L8.39668 9.54688C7.52324 10.1867 6.44668 10.5625 5.28125 10.5625C2.36387 10.5625 0 8.19863 0 5.28125C0 2.36387 2.36387 0 5.28125 0C8.19863 0 10.5625 2.36387 10.5625 5.28125ZM5.28125 8.9375C5.7614 8.9375 6.23684 8.84293 6.68044 8.65918C7.12403 8.47544 7.52709 8.20612 7.86661 7.86661C8.20612 7.52709 8.47544 7.12403 8.65918 6.68044C8.84293 6.23684 8.9375 5.7614 8.9375 5.28125C8.9375 4.8011 8.84293 4.32566 8.65918 3.88206C8.47544 3.43847 8.20612 3.0354 7.86661 2.69589C7.52709 2.35638 7.12403 2.08706 6.68044 1.90332C6.23684 1.71957 5.7614 1.625 5.28125 1.625C4.8011 1.625 4.32566 1.71957 3.88206 1.90332C3.43847 2.08706 3.0354 2.35638 2.69589 2.69589C2.35638 3.0354 2.08706 3.43847 1.90332 3.88206C1.71957 4.32566 1.625 4.8011 1.625 5.28125C1.625 5.7614 1.71957 6.23684 1.90332 6.68044C2.08706 7.12403 2.35638 7.52709 2.69589 7.86661C3.0354 8.20612 3.43847 8.47544 3.88206 8.65918C4.32566 8.84293 4.8011 8.9375 5.28125 8.9375Z"
        fill="#878787"
      />
    </g>
    <defs>
      <clipPath id="clip0_292_559">
        <rect width="13" height="13" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default function ShopListPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadShops = async () => {
      const data = await getShops();
      setShops(data);
    };

    loadShops();
  }, []);

  const handleSubmit = async () => {
    if (!shopName.trim()) {
      setMessage('お店の名前を入力してください');
      return;
    }

    try {
      const createdShop = await createShop({
        name: shopName,
        category,
        address,
        comment,
      });

      setShops((prev) => [...prev, createdShop]);
      setShopName('');
      setCategory('');
      setAddress('');
      setComment('');
      setMessage('');
      setIsModalOpen(false);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '登録に失敗しました'
      );
    }
  };

  const filteredShops = shops.filter((shop) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      shop.name.toLowerCase().includes(q) ||
      (shop.category ?? '').toLowerCase().includes(q) ||
      (shop.address ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        {/* Search bar + Add button row */}
        <div style={styles.actionRow}>
          <div style={styles.searchBar}>
            <MagnifyingGlass />
            <input
              type="text"
              placeholder="検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              aria-label="お店を検索"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={styles.addButton}
          >
            お店の追加
          </button>
        </div>

        <section style={styles.cardList} aria-label="お店一覧">
          {filteredShops.map((shop) => (
            <ShopCard
              key={shop.id}
              name={shop.name}
              postalCode={shop.postalCode}
              address={shop.address}
              category={shop.category}
            />
          ))}
        </section>

        {isModalOpen && (
          <div
            style={styles.modalBackdrop}
            role="presentation"
            onClick={() => setIsModalOpen(false)}
          >
            <section
              aria-modal="true"
              role="dialog"
              aria-label="お店を追加"
              style={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.row}>
                <span style={styles.label}>お気に入りのお店：</span>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  style={styles.underlineInput}
                />
              </div>

              <div style={styles.row}>
                <span style={styles.label}>カテゴリ：</span>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.underlineInput}
                />
              </div>

              <div style={styles.row}>
                <span style={styles.label}>住所：</span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={styles.underlineInput}
                />
              </div>

              <div style={styles.row}>
                <span style={styles.label}>画像：</span>
                <button type="button" style={styles.photoButton}>
                  写真を追加
                </button>
              </div>

              <div style={styles.commentRow}>
                <span
                  style={{
                    ...styles.label,
                    alignSelf: 'flex-start',
                    paddingTop: 4,
                  }}
                >
                  コメント：
                </span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={styles.textarea}
                />
              </div>

              {message && <p style={styles.message}>{message}</p>}

              <button type="button" onClick={handleSubmit} style={styles.submitButton}>
                追加
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
    fontFamily:
      '-apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 18px 96px',
    boxSizing: 'border-box',
    position: 'relative',
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  searchBar: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 32,
    padding: '0 10px',
    background: '#F2F2F2',
    border: '1px solid #DEDEDE',
    boxSizing: 'border-box',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    background: 'transparent',
    fontSize: 13,
    color: '#333',
    outline: 'none',
  },
  addButton: {
    flexShrink: 0,
    height: 35,
    padding: '0 12px',
    background: '#9EC9FF',
    border: '1px solid #1F1F1F',
    borderRadius: 1,
    color: '#111',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '3px 3px 0 #264A7A',
    whiteSpace: 'nowrap',
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 33,
    maxWidth: 270,
    margin: '0 auto',
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.55)',
    zIndex: 5,
  },
  modalCard: {
    width: 'min(80vw, 320px)',
    padding: '20px 18px 16px',
    border: '1px solid #888',
    borderRadius: 14,
    background: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    boxSizing: 'border-box',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderBottom: '1px solid #ddd',
    paddingBottom: 6,
  },
  label: {
    color: '#555',
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  underlineInput: {
    flex: 1,
    minWidth: 0,
    height: 20,
    padding: '2px 0',
    border: 'none',
    background: 'transparent',
    color: '#333',
    fontSize: 12,
    fontWeight: 700,
    outline: 'none',
    boxSizing: 'border-box',
  },
  photoButton: {
    padding: '3px 10px',
    background: '#fff',
    border: '1px solid #bbb',
    borderRadius: 4,
    fontSize: 11,
    color: '#444',
    cursor: 'pointer',
  },
  commentRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
  },
  textarea: {
    flex: 1,
    minWidth: 0,
    height: 72,
    padding: '4px 6px',
    border: '1px solid #bbb',
    borderRadius: 4,
    background: '#fff',
    color: '#333',
    fontSize: 12,
    fontWeight: 700,
    resize: 'none',
    outlineColor: '#F5B042',
    boxSizing: 'border-box',
  },
  message: {
    color: '#e00',
    fontSize: 11,
    margin: 0,
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
