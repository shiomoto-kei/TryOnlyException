'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    loadStoredProfile,
    loadUserProfile,
    saveUserProfile,
    uploadProfileAvatar,
} from '../lib/profileStorage';

export default function AccountSetupPage() {
    const router = useRouter();
    const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
    const [nickname, setNickname] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setAvatarSrc(loadStoredProfile().avatarSrc);

        async function syncProfile() {
            const storedProfile = await loadUserProfile();
            setAvatarSrc(storedProfile.avatarSrc);
            setNickname(storedProfile.name === 'ささき しょうま' ? '' : storedProfile.name);
        }

        syncProfile();
    }, []);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const avatarUrl = await uploadProfileAvatar(file);
        setAvatarSrc(avatarUrl);
    };

    const handleStart = async () => {
        if (nickname.trim()) {
            await saveUserProfile({ name: nickname.trim(), avatarSrc });
        }

        router.push('/main');
    };

    return (
        <div style={styles.page}>
            {/* ヘッダー（ロゴのみ） */}
            <header style={styles.header}>
                <img src="/meating_logo.png" alt="みーてぃんぐ" style={styles.logoImg} />
            </header>

            <main style={styles.main}>
                {/* アバター */}
                <div style={styles.avatarWrap}>
                    <div
                        style={{
                            ...styles.avatar,
                            backgroundImage: avatarSrc ? `url(${avatarSrc})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    <button
                        style={styles.setImgBtn}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        画像を設定
                    </button>
                </div>

                {/* ニックネーム入力 */}
                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="ニックネーム"
                    style={styles.nicknameInput}
                />

                {/* 始めるボタン */}
                <button onClick={handleStart} style={styles.startButton}>
                    始める！
                </button>
            </main>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    page: {
        minHeight: '100vh',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily:
            '-apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
    },
    header: {
        background: '#F5B042',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
    },
    logoImg: {
        height: 48,
        width: 'auto',
        objectFit: 'contain',
    },
    main: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        padding: '32px 24px',
    },
    avatarWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: '50%',
        background: '#d4d4d4',
    },
    setImgBtn: {
        background: '#fff',
        border: '1px solid #999',
        borderRadius: 4,
        padding: '4px 14px',
        fontSize: 12,
        color: '#444',
        cursor: 'pointer',
    },
    nicknameInput: {
        width: '100%',
        maxWidth: 240,
        height: 44,
        border: '1px solid #ccc',
        borderRadius: 6,
        padding: '0 14px',
        fontSize: 15,
        color: '#333',
        outline: 'none',
        boxSizing: 'border-box',
    },
    startButton: {
        width: 140,
        height: 40,
        background: '#F5B042',
        border: 'none',
        borderRadius: 8,
        color: '#fff',
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
    },
};
