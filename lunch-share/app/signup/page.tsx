import type { CSSProperties } from "react";

export default function SignupPage() {
  return (
    <main style={styles.page}>
      <img src="/logo.png" alt="みーてぃんぐ" style={styles.logo} />

      <section style={styles.content} aria-label="新規登録">
        <h1 style={styles.title}>新規登録</h1>

        <form style={styles.form}>
          <label style={styles.fieldLabel}>
            Gメールアドレス
            <input
              type="email"
              name="email"
              autoComplete="email"
              style={styles.input}
            />
          </label>

          <button type="submit" style={styles.submitButton}>
            送信
          </button>
        </form>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#FCE8A8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    fontFamily: '"Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif',
  },
  content: {
    width: "100%",
    maxWidth: 310,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 24px 48px",
    boxSizing: "border-box",
  },
  logo: {
    width: 360,
    maxWidth: "calc(100vw - 48px)",
    height: "auto",
    objectFit: "contain",
    marginTop: 142,
    marginBottom: 10,
  },
  title: {
    margin: "0 0 46px",
    color: "#1F1F1F",
    fontSize: 30,
    fontWeight: 700,
    letterSpacing: 0,
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  fieldLabel: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 7,
    marginBottom: 36,
    color: "#1F1F1F",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0,
  },
  input: {
    width: "100%",
    height: 31,
    padding: "4px 8px",
    boxSizing: "border-box",
    border: "1px solid #A8A8A8",
    borderRadius: 2,
    background: "#FFFFFF",
    color: "#1F1F1F",
    fontSize: 14,
    outlineColor: "#F7992D",
  },
  submitButton: {
    width: 139,
    height: 39,
    border: "none",
    borderRadius: 4,
    background: "#F7992D",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 0,
    cursor: "pointer",
  },
};