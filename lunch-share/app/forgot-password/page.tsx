'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('メールアドレスを入力してください。');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage('パスワード再設定メールを送信しました。メール内のリンクを確認してください。');
  };

  return (
    <main style={styles.page}>
      <img src="/meating_logo.png" alt="みーてぃんぐ" style={styles.logo} />

      <section style={styles.content} aria-label="パスワード再設定メール送信">
        <h1 style={styles.title}>パスワード再設定</h1>

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

          {errorMessage && <p style={styles.errorText}>{errorMessage}</p>}
          {successMessage && <p style={styles.successText}>{successMessage}</p>}

          <button type="submit" style={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? '送信中...' : '送信'}
          </button>
        </form>

        <a href="/login" style={styles.backLink}>
          ログイン画面に戻る
        </a>
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
