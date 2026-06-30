'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [canResetPassword, setCanResetPassword] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      setCanResetPassword(Boolean(data.session));
      setIsCheckingSession(false);
    }

    checkSession();

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setCanResetPassword(true);
        setIsCheckingSession(false);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('パスワードが一致しません。');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('パスワードは6文字以上で入力してください。');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage('パスワードを更新しました。ログイン画面に戻ります。');
    setTimeout(() => router.push('/login'), 1600);
  };

  return (
    <main style={styles.page}>
      <img src="/meating_logo.png" alt="みーてぃんぐ" style={styles.logo} />

      <section style={styles.content} aria-label="新しいパスワード設定">
        <h1 style={styles.title}>新しいパスワード</h1>

        {isCheckingSession ? (
          <p style={styles.infoText}>確認中...</p>
        ) : canResetPassword ? (
          <form style={styles.form} onSubmit={handleSubmit}>
            <label style={styles.fieldLabel}>
              新しいパスワード
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </label>

            <label style={styles.fieldLabel}>
              新しいパスワード(確認)
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
              />
            </label>

            {errorMessage && <p style={styles.errorText}>{errorMessage}</p>}
            {successMessage && <p style={styles.successText}>{successMessage}</p>}

            <button type="submit" style={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? '更新中...' : '更新'}
            </button>
          </form>
        ) : (
          <>
            <p style={styles.infoText}>
              パスワード再設定メールのリンクから開いてください。
            </p>
            <a href="/forgot-password" style={styles.backLink}>
              再設定メールを送る
            </a>
          </>
        )}
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#FCE8A8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontFamily: '"Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif',
  },
  content: {
    width: '100%',
    maxWidth: 310,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 24px 48px',
    boxSizing: 'border-box',
  },
  logo: {
    width: 360,
    maxWidth: 'calc(100vw - 48px)',
    height: 'auto',
    objectFit: 'contain',
    marginTop: 142,
    marginBottom: 10,
  },
  title: {
    margin: '0 0 46px',
    color: '#1F1F1F',
    fontSize: 30,
    fontWeight: 700,
    letterSpacing: 0,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  fieldLabel: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    marginBottom: 20,
    color: '#1F1F1F',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0,
  },
  input: {
    width: '100%',
    height: 31,
    padding: '4px 8px',
    boxSizing: 'border-box',
    border: '1px solid #A8A8A8',
    borderRadius: 2,
    background: '#FFFFFF',
    color: '#1F1F1F',
    fontSize: 14,
    outlineColor: '#F7992D',
  },
  errorText: {
    width: '100%',
    margin: '-8px 0 12px',
    color: '#D14343',
    fontSize: 12,
    fontWeight: 600,
    textAlign: 'left',
  },
  successText: {
    width: '100%',
    margin: '-8px 0 12px',
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: 600,
    textAlign: 'left',
  },
  infoText: {
    width: '100%',
    margin: 0,
    color: '#1F1F1F',
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.6,
    textAlign: 'center',
  },
  submitButton: {
    width: 139,
    height: 39,
    border: 'none',
    borderRadius: 4,
    background: '#F7992D',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 0,
    cursor: 'pointer',
  },
  backLink: {
    marginTop: 28,
    color: '#1F1F1F',
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: 0,
    textDecoration: 'none',
  },
};
