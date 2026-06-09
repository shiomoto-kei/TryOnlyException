'use client';

import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const memberPositions = [
  { angle: -90 }, { angle: -45 }, { angle: 0 }, { angle: 45 },
  { angle: 90 }, { angle: 135 }, { angle: 180 }, { angle: 225 },
];

export default function HomePage() {
  const router = useRouter();
  const handleAdd = () => {
    console.log('追加ボタン押下');
    router.push('/shops');
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
};