'use client';

import { useRouter } from 'next/navigation';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import ShopCard from '../components/ShopCard';

const shops = [
  {
    name: 'MAREN',
    postalCode: '\u3012530-0015',
    address:
      '\u5927\u962a\u5e9c\u5927\u962a\u5e02\u5317\u533a\u4e2d\u5d0e\u897f1-4-22 \u6885\u7530\u6771\u30d3\u30eb1F',
    category: '\u307e\u305c\u305d\u3070',
  },
  {
    name: 'MAREN',
    postalCode: '\u3012530-0015',
    address:
      '\u5927\u962a\u5e9c\u5927\u962a\u5e02\u5317\u533a\u4e2d\u5d0e\u897f1-4-22 \u6885\u7530\u6771\u30d3\u30eb1F',
    category: '\u307e\u305c\u305d\u3070',
  },
  {
    name: 'MAREN',
    postalCode: '\u3012530-0015',
    address:
      '\u5927\u962a\u5e9c\u5927\u962a\u5e02\u5317\u533a\u4e2d\u5d0e\u897f1-4-22 \u6885\u7530\u6771\u30d3\u30eb1F',
    category: '\u307e\u305c\u305d\u3070',
  },
];

export default function ShopListPage() {
  const router = useRouter();

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        <div style={styles.actionRow}>
          <button
            type="button"
            onClick={() => router.push('/shops')}
            style={styles.addButton}
          >
            {'\u304a\u5e97\u306e\u8ffd\u52a0'}
          </button>
        </div>

        <section style={styles.cardList} aria-label={'\u304a\u5e97\u4e00\u89a7'}>
          {shops.map((shop, index) => (
            <ShopCard key={`${shop.name}-${index}`} {...shop} />
          ))}
        </section>
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
    letterSpacing: 0,
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
};
