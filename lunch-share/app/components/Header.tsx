export default function Header() {
  return (
    <header style={styles.header}>
      <img src="/logo.png" alt="みーてぃんぐ" style={styles.logoImg} />
      <div style={styles.profileAvatar} />
    </header>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    background: '#F5B042',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoImg: {
    height: 36,
    width: 'auto',
    objectFit: 'contain',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#d4d4d4',
  },
};