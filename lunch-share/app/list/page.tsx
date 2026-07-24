'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import ShopCard from '../components/ShopCard';
import { createShop, getShops, type Shop } from './action';
import {
  APIProvider,
  Map,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";

export default function ShopListPage() {
  const [shops, setShops] = useState<Shop[]>([]);
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

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        <div style={styles.actionRow}>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={styles.addButton}
          >
            お店を追加
          </button>
        </div>

        <section style={styles.cardList} aria-label="お店一覧">
          {shops.map((shop) => (
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

              <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                <Map
                  style={{
                    width: "100%",
                    height: "250px",
                    marginTop: "12px",
                    borderRadius: "8px",
                  }}
                  defaultCenter={{
                    lat: 35.681236,
                    lng: 139.767125,
                  }}
                  defaultZoom={16}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                >
                  <AdvancedMarker
                    position={{
                      lat: 34.702485,
                      lng: 135.495951,
                    }}
                  />
                </Map>
              </APIProvider>

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
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  addButton: {
    minWidth: 86,
    height: 35,
    padding: '0 10px',
    background: '#9EC9FF',
    border: '1px solid #1F1F1F',
    borderRadius: 1,
    color: '#111',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '3px 3px 0 #264A7A',
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