'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const LOADING_SEEN_KEY = 'lunch-share-loading-seen';

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const hasSeenLoading = sessionStorage.getItem(LOADING_SEEN_KEY) === 'true';

    if (hasSeenLoading) {
      router.replace('/login');
      return;
    }

    sessionStorage.setItem(LOADING_SEEN_KEY, 'true');

    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="page">
      <div className="background" />

      <div className="logo">
        <Image
          src="/meating_logo.png"
          alt="みーてぃんぐ"
          width={380}
          height={95}
          priority
        />
      </div>

      <style jsx>{`
        .page {
          position: fixed;
          inset: 0;
          overflow: hidden;
          background-color: #fbe36a;
        }

        .background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;

          background-image: url('/orabge_check.jpg');
          background-repeat: repeat;

          /* チェック柄を大きく表示 */
          background-size: 600px auto;
          background-position: 0 0;

          animation: slideBackground 8s linear infinite;
        }

        .logo {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
        }

        @keyframes slideBackground {
          from {
            background-position: 0 0;
          }
          to {
            background-position: -600px 0;
          }
        }
      `}</style>
    </div>
  );
}
