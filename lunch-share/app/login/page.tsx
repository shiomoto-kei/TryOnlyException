'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { getAuthErrorMessage } from '../lib/authErrorMessage';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (error) {
                setErrorMessage(getAuthErrorMessage(error, 'login'));
                return;
            }
        } catch (error) {
            setErrorMessage(getAuthErrorMessage(error, 'login'));
            return;
        } finally {
            setIsSubmitting(false);
        }

        const redirectTo = new URLSearchParams(window.location.search).get('redirectTo');
        const safeRedirectTo =
            redirectTo?.startsWith('/') && !redirectTo.startsWith('//')
                ? redirectTo
                : '/question';
        router.push(safeRedirectTo);
    };

    return (
        <main style={styles.page}>
            <img src="/meating_logo.png" alt="みーてぃんぐ" style={styles.logo} />

            <section style={styles.content} aria-label="ログイン">
                <form style={styles.form} onSubmit={handleSubmit}>
                    <label style={styles.fieldLabel}>
                        メールアドレス
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                        />
                    </label>

                    <label style={styles.fieldLabel}>
                        パスワード
                        <input
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                        />
                    </label>

                    {errorMessage && <p style={styles.errorText}>{errorMessage}</p>}

                    <button type="submit" style={styles.loginButton} disabled={isSubmitting}>
                        {isSubmitting ? 'ログイン中...' : 'ログイン'}
                    </button>

                    <a href="/forgot-password" style={styles.forgotPasswordLink}>
                        パスワードをお忘れの場合
                    </a>
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
    errorText: {
        width: "100%",
        margin: "4px 0 0",
        color: "#D14343",
        fontSize: 12,
        fontWeight: 600,
        textAlign: "left",
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
    forgotPasswordLink: {
        marginTop: 18,
        color: "#1F1F1F",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: 0,
        textDecoration: "none",
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
