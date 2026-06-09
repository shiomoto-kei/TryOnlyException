import type { CSSProperties } from "react";

export default function LoginPage() {
    return (
        <main style={styles.page}>
            <img src="/logo.png" alt="みーてぃんぐ" style={styles.logo} />

            <section style={styles.content} aria-label="ログイン">
                <form style={styles.form}>
                    <label style={styles.fieldLabel}>
                        ユーザーネーム
                        <input type="text" name="username" autoComplete="username" style={styles.input} />
                    </label>

                    <label style={styles.fieldLabel}>
                        パスワード
                        <input
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            style={styles.input}
                        />
                    </label>

                    <button type="submit" style={styles.loginButton}>
                        ログイン
                    </button>
                </form>

                <div style={styles.divider} />

                <a href="/signup" style={styles.signupLink}>
                    アカウントをお持ちでない方はこちら
                </a>
            </section>
        </main>
    );
}

const styles: Record<string, CSSProperties> = {
    page: {
        minHeight: "100vh",
        background: "#FCE8A8",
        display: "flex",
        flexDirection: "column",   // ← 追加
        alignItems: "center",      // ← 追加
        justifyContent: "flex-start", // ← centerからflex-startに変更
        fontFamily: '"Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif',
    },
    content: {
        width: "100%",
        maxWidth: 310,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 24px 48px",    // ← 上のpadding(142px)を削除
        boxSizing: "border-box",
    },
    logo: {
        width: 360,
        maxWidth: "calc(100vw - 48px)",  // ← 変更
        height: "auto",
        objectFit: "contain",
        marginTop: 142,            // ← paddingの代わりにmarginTopで位置調整
        marginBottom: 64,
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
        marginBottom: 11,
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
    loginButton: {
        width: 139,
        height: 39,
        marginTop: 28,
        border: "none",
        borderRadius: 4,
        background: "#F7992D",
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 0,
        cursor: "pointer",
    },
    divider: {
        width: "100%",
        height: 1,
        background: "#8F8F8F",
        marginTop: 52,
        marginBottom: 34,
    },
    signupLink: {
        color: "#1F1F1F",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: 0,
        textDecoration: "none",
    },
};
