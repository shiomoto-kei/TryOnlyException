'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FriendScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    const start = async () => {
      try {
        // カメラ起動（背面カメラ優先）
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // BarcodeDetector 対応端末のみ（Android Chrome など。iOS Safari は未対応）
        const Detector = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
        if (!Detector) {
          setError('この端末はQR読み取りに未対応です（iPhoneはjsQR対応が必要）。');
          return;
        }
        const detector = new Detector({ formats: ['qr_code'] });

        const scan = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0) {
              const userId = codes[0].rawValue;
              stopped = true;
              router.push(`/friend-add?userId=${encodeURIComponent(userId)}`);
              return;
            }
          } catch {
            // 1フレームの検出失敗は無視して次フレームへ
          }
          raf = requestAnimationFrame(scan);
        };
        raf = requestAnimationFrame(scan);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError('カメラを起動できませんでした: ' + msg);
      }
    };

    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [router]);

  return (
    <main style={styles.page}>
      <p style={styles.title}>フレンドのQRコードを読み取ってください</p>
      <video ref={videoRef} playsInline muted style={styles.video} />
      {error && <p style={styles.error}>{error}</p>}
      <button onClick={() => router.push('/profile')} style={styles.back}>
        戻る
      </button>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    background: '#000',
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    textAlign: 'center',
  },
  video: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    background: '#111',
  },
  error: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  back: {
    marginTop: 8,
    padding: '10px 24px',
    borderRadius: 8,
    border: 'none',
    background: '#fff',
    color: '#333',
    fontWeight: 700,
  },
};
