type AuthErrorContext = 'login' | 'signup' | 'passwordResetEmail' | 'passwordUpdate';

function collectErrorText(error: unknown): string {
  if (!error) return '';
  if (typeof error === 'string') return error;

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const values = [
      record.message,
      record.error,
      record.error_description,
      record.code,
      record.status,
      record.name,
    ]
      .filter((value): value is string | number => {
        return typeof value === 'string' || typeof value === 'number';
      })
      .map(String);

    if (values.length > 0) return values.join(' ');

    try {
      const json = JSON.stringify(error);
      return json === '{}' ? '' : json;
    } catch {
      return '';
    }
  }

  return '';
}

export function getAuthErrorMessage(
  error: unknown,
  context: AuthErrorContext,
): string {
  const rawMessage = collectErrorText(error).trim();
  const normalized = rawMessage.toLowerCase();

  if (
    normalized.includes('rate') ||
    normalized.includes('too many') ||
    normalized.includes('429') ||
    normalized.includes('over_email_send_rate_limit')
  ) {
    return '短時間に何度も送信されています。しばらく時間をおいてから再度お試しください。';
  }

  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('network') ||
    normalized.includes('fetch failed')
  ) {
    return '通信に失敗しました。ネットワーク接続を確認してから再度お試しください。';
  }

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid credentials')
  ) {
    return 'メールアドレスまたはパスワードが正しくありません。';
  }

  if (
    normalized.includes('email not confirmed') ||
    normalized.includes('email_not_confirmed')
  ) {
    return 'メールアドレスの確認が完了していません。確認メールのリンクを開いてからログインしてください。';
  }

  if (
    normalized.includes('already registered') ||
    normalized.includes('user already registered') ||
    normalized.includes('already exists')
  ) {
    return 'このメールアドレスはすでに登録されています。ログイン画面からログインしてください。';
  }

  if (
    normalized.includes('weak password') ||
    normalized.includes('password should be') ||
    normalized.includes('password must') ||
    normalized.includes('password is too short')
  ) {
    return 'パスワードの条件を満たしていません。6文字以上で入力してください。';
  }

  if (
    normalized.includes('smtp') ||
    normalized.includes('mailer') ||
    normalized.includes('email') ||
    normalized.includes('500') ||
    normalized.includes('internal server error')
  ) {
    if (context === 'signup') {
      return '登録確認メールの送信に失敗しました。時間をおいて再度お試しください。';
    }
    if (context === 'passwordResetEmail') {
      return 'パスワード再設定メールの送信に失敗しました。時間をおいて再度お試しください。';
    }
  }

  if (context === 'login') {
    return 'ログインに失敗しました。入力内容を確認して再度お試しください。';
  }
  if (context === 'signup') {
    return '新規登録に失敗しました。時間をおいて再度お試しください。';
  }
  if (context === 'passwordResetEmail') {
    return 'パスワード再設定メールの送信に失敗しました。時間をおいて再度お試しください。';
  }

  return 'パスワードの更新に失敗しました。時間をおいて再度お試しください。';
}
