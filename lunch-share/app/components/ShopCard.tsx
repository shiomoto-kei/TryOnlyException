import Image from 'next/image';

type ShopCardProps = {
  name: string;
  postalCode: string;
  address: string;
  category: string;
  latitude?: number;
  longitude?: number;
  googleMapsApiKey?: string;
  imageUrl?: string;
  ownerName?: string;
  onSelect?: () => void;
  onDelete?: () => void;
};

function buildStaticMapUrl({
  latitude,
  longitude,
  apiKey,
}: {
  latitude?: number;
  longitude?: number;
  apiKey?: string;
}) {
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !apiKey
  ) {
    return null;
  }

  const center = `${latitude},${longitude}`;
  const params = new URLSearchParams({
    center,
    zoom: '16',
    size: '152x138',
    scale: '2',
    language: 'ja',
    region: 'JP',
    key: apiKey,
  });

  params.append('markers', `color:red|${center}`);

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

export default function ShopCard({
  name,
  postalCode,
  address,
  category,
  latitude,
  longitude,
  googleMapsApiKey,
  imageUrl,
  ownerName,
  onSelect,
  onDelete,
}: ShopCardProps) {
  const mapQuery = [name, address].filter(Boolean).join(' ');
  const mapUrl =
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  const staticMapUrl = buildStaticMapUrl({
    latitude,
    longitude,
    apiKey: googleMapsApiKey,
  });
  return (
    <article
      style={styles.card}
      onClick={onSelect}
      role={onSelect ? 'button' : undefined}
    >
      {onDelete && (
        <button
          type="button"
          aria-label={`${name}をリストから削除`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={styles.pinButton}
        >
          <Image
            src="/pushpin.png"
            alt=""
            width={29}
            height={35}
            style={styles.pinImage}
            aria-hidden="true"
          />
        </button>
      )}

      <div style={styles.headerRow}>
        <h2 style={styles.name}>{name}</h2>
        <span style={styles.category}>{category}</span>
      </div>

      {ownerName && <p style={styles.ownerBadge}>{ownerName}さんが追加</p>}

      <p style={styles.detail}>{postalCode}</p>
      <p style={styles.detail}>{address}</p>

      <div style={styles.photoRow}>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...styles.mapButton,
            ...(staticMapUrl
              ? {
                  backgroundImage: `url("${staticMapUrl}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : null),
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`${name}をGoogleマップで表示`}
        >
          {!staticMapUrl && 'タップして地図を表示'}
        </a>

        <div
          aria-label={imageUrl ? `${name}の写真` : undefined}
          role={imageUrl ? 'img' : undefined}
          style={{
            ...styles.photoPlaceholder,
            ...(imageUrl
              ? {
                  backgroundImage: `url("${imageUrl}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : null),
          }}
        />
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
    cursor: 'pointer',
  },
  pinButton: {
    position: 'absolute',
    top: -5,
    left: '57%',
    transform: 'translateX(-50%)',
    zIndex: 2,
    border: 'none',
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
  },
  pinImage: {
    width: 29,
    height: 35,
    objectFit: 'contain',
    display: 'block',
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
  ownerBadge: {
    margin: '4px 0 0',
    fontSize: 9,
    fontWeight: 700,
    color: '#3E8FBF',
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
  mapButton: {
    width: 76,
    height: 69,
    background: '#d9d9d9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    textDecoration: 'none',
    color: '#333',
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 2,
  },
};
