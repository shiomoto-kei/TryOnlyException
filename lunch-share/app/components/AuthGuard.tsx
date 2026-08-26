'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

const PUBLIC_PATHS = new Set([
  '/',
  '/loading',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
]);
const AUTH_CHECK_TIMEOUT_MS = 5000;

type AuthGuardProps = {
  children: ReactNode;
};

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.has(pathname);
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [canShowPage, setCanShowPage] = useState(() => isPublicPath(pathname));

  useEffect(() => {
    let isActive = true;

    const redirectToLogin = () => {
      const redirectTo = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
    };

    async function checkAuth() {
      if (isPublicPath(pathname)) {
        setCanShowPage(true);
        return;
      }

      setCanShowPage(false);

      const { user, error } = await Promise.race([
        supabase.auth
          .getUser()
          .then(({ data, error: authError }) => ({
            user: data.user,
            error: authError,
          })),
        new Promise<{ user: null; error: null }>((resolve) => {
          window.setTimeout(
            () =>
              resolve({
                user: null,
                error: null,
              }),
            AUTH_CHECK_TIMEOUT_MS,
          );
        }),
      ]);
      if (!isActive) return;

      if (error || !user) {
        redirectToLogin();
        return;
      }

      setCanShowPage(true);
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (isPublicPath(pathname)) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        redirectToLogin();
        return;
      }

      setCanShowPage(true);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (!canShowPage) {
    return (
      <main style={styles.page} aria-label="認証確認中">
        <p style={styles.text}>認証確認中...</p>
      </main>
    );
  }

  return <>{children}</>;
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FCE8A8',
    color: '#333',
    fontFamily:
      '-apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
  },
  text: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
  },
};
