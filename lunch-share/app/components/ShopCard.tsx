import Image from 'next/image';

type ShopCardProps = {
  name: string;
  postalCode: string;
  address: string;
  category: string;
};

export default function ShopCard({
  name,
  postalCode,
  address,
  category,
}: ShopCardProps) {
  return (
    <article style={styles.card}>
      <Image
        src="/pushpin.png"
        alt=""
        width={29}
        height={35}
        style={styles.pinImage}
        aria-hidden="true"
      />

      <div style={styles.headerRow}>
        <h2 style={styles.name}>{name}</h2>
        <span style={styles.category}>{category}</span>
      </div>

      <p style={styles.detail}>{postalCode}</p>
      <p style={styles.detail}>{address}</p>

      <div style={styles.photoRow} aria-hidden="true">
        <div style={styles.photoPlaceholder} />
        <div style={styles.photoPlaceholder} />
      </div>
    </article>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    position: 'relative',
    width: '100%',
    minHeight: 158,
    padding: '18px 28px 14px 32px',
    boxSizing: 'border-box',
    background: '#fff',
    border: '1px solid #333',
    boxShadow: '1px 2px 2px rgba(0,0,0,0.16)',
    transform: 'rotate(2.8deg)',
  },
  pinImage: {
    position: 'absolute',
    top: -5,
    left: '57%',
    width: 29,
    height: 35,
    objectFit: 'contain',
    transform: 'translateX(-50%)',
    zIndex: 2,
    pointerEvents: 'none',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.2,
    fontWeight: 700,
    color: '#111',
    letterSpacing: 0,
  },
  category: {
    paddingTop: 9,
    fontSize: 11,
    color: '#777',
    whiteSpace: 'nowrap',
  },
  detail: {
    margin: '4px 0 0',
    fontSize: 8,
    lineHeight: 1.2,
    color: '#222',
  },
  photoRow: {
    display: 'flex',
    gap: 36,
    marginTop: 17,
    paddingLeft: 9,
  },
  photoPlaceholder: {
    width: 76,
    height: 69,
    background: '#d9d9d9',
  },
};
