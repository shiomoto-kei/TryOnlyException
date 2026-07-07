'use client';

import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

// 吹き出し（しっぽ付き）
const SpeechBubble = () => (
    <svg width="189" height="116" viewBox="0 0 189 116" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.75" y="0.75" width="187.5" height="78.5" rx="14.25" fill="white" stroke="black" strokeWidth="1.5" />
        <circle cx="65.5" cy="80.5" r="13.75" fill="white" stroke="black" strokeWidth="1.5" />
        <circle cx="39" cy="97" r="9.25" fill="white" stroke="black" strokeWidth="1.5" />
        <circle cx="13" cy="109" r="6.25" fill="white" stroke="black" strokeWidth="1.5" />
    </svg>
);

// 「ある」ボタン（ピンク、フォーク付き）
const YesButton = () => (
    <svg width="178" height="114" viewBox="0 0 178 114" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="177.962" height="113.105" rx="15" fill="#FF2DA1" />
        <circle cx="91.6698" cy="56.1569" r="49.3293" fill="#F0F0F0" stroke="black" />
        <circle cx="91.67" cy="56.1566" r="42.2108" fill="#F0F0F0" stroke="black" />
        <path d="M150.041 47.9704V40.4961C149.86 30.981 151.034 26.0387 155.207 19.1407C155.932 17.9374 156.066 18.5866 156.134 20.5644L157.16 90.3253C157.257 92.4964 157.105 93.437 156.448 94.5964C155.613 95.7525 155.147 95.711 154.312 94.5964C153.779 93.6286 153.598 92.7743 153.6 90.3253V57.9363C153.711 55.115 153.269 54.3378 151.821 54.0211C150.437 52.9302 149.963 51.7723 150.041 47.9704Z" fill="#F0F0F0" stroke="black" />
        <path d="M20.5045 18.8828C19.8812 20.1698 19.7958 20.8791 19.7734 22.1438V33.7382C19.9147 36.9514 20.1489 38.5569 20.8701 40.9847C21.6097 42.3156 22.1615 42.9069 23.4289 43.8833C24.2506 44.4806 24.4721 45.0591 24.5255 46.4196V92.0726C24.576 93.4058 24.7543 93.9487 25.2566 94.6089C26.2557 95.5939 26.8165 95.4871 27.8154 94.6089C28.3545 93.773 28.5019 93.2001 28.5465 92.0726V46.4196C28.6591 45.1705 28.8581 44.5808 29.6431 43.8833C30.8082 42.9877 31.3702 42.3508 32.2019 40.9847C33.0565 38.3402 33.2958 36.767 33.2985 33.7382V22.1438C33.2069 20.5721 33.055 19.833 32.5674 18.8828C31.88 18.2623 31.5662 18.2957 31.1053 18.8828C30.611 19.8623 30.4586 20.5871 30.3742 22.1438V32.2889C30.3937 33.368 30.3301 33.8566 30.0086 34.4628C29.4348 34.9766 29.12 34.975 28.5465 34.4628C28.2645 33.8708 28.1757 33.3967 28.1809 32.2889V22.1438C28.1298 20.5451 27.996 19.9034 27.4498 18.8828C26.8795 18.3669 26.5573 18.294 25.9877 18.8828C25.4028 19.7655 25.2519 20.4986 25.2566 22.1438V32.2889C25.2159 33.1288 25.1452 33.6226 24.891 34.4628C24.1676 35.0164 23.7867 35.0755 23.0633 34.4628C22.7586 33.6549 22.6686 33.1581 22.6978 32.2889V22.1438C22.6789 20.71 22.5465 19.9793 21.9667 18.8828C21.4518 18.3017 21.1327 18.2535 20.5045 18.8828Z" fill="#F0F0F0" stroke="black" />
        <rect x="1" y="1" width="175.962" height="111.105" rx="14" fill="white" fillOpacity="0.75" stroke="#7E7E7E" strokeWidth="2" />
    </svg>
);

// 「ない」ボタン（水色）
const NoButton = () => (
    <svg width="178" height="113" viewBox="0 0 178 113" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.787598" width="177.212" height="112.628" rx="15" fill="#16B9FF" />
        <circle cx="91.284" cy="55.9203" r="49.1195" fill="#F0F0F0" stroke="black" />
        <circle cx="91.2842" cy="55.9202" r="42.031" fill="#F0F0F0" stroke="black" />
        <path d="M149.41 47.7689V40.326C149.229 30.851 150.399 25.9294 154.553 19.0605C155.276 17.8622 155.409 18.5088 155.477 20.4782L156.498 89.9455C156.595 92.1074 156.444 93.0441 155.789 94.1986C154.958 95.3498 154.494 95.3085 153.663 94.1986C153.132 93.2348 152.952 92.3841 152.954 89.9455V57.6928C153.064 54.8834 152.624 54.1095 151.182 53.7941C149.804 52.7077 149.332 51.5547 149.41 47.7689Z" fill="#F0F0F0" stroke="black" />
        <path d="M20.4182 18.8033C19.7975 20.0848 19.7125 20.7911 19.6902 22.0505V33.5961C19.8309 36.7958 20.0641 38.3945 20.7822 40.8121C21.5187 42.1374 22.0682 42.7262 23.3302 43.6985C24.1485 44.2933 24.369 44.8694 24.4222 46.2241V91.6849C24.4726 93.0126 24.65 93.5531 25.1502 94.2105C26.1452 95.1914 26.7036 95.085 27.6983 94.2105C28.2351 93.3782 28.3819 92.8077 28.4263 91.6849V46.2241C28.5385 44.9803 28.7366 44.393 29.5183 43.6985C30.6785 42.8067 31.2381 42.1724 32.0663 40.8121C32.9173 38.1788 33.1556 36.6121 33.1583 33.5961V22.0505C33.0671 20.4854 32.9158 19.7494 32.4303 18.8033C31.7458 18.1854 31.4333 18.2187 30.9743 18.8033C30.4821 19.7786 30.3304 20.5004 30.2463 22.0505V32.1529C30.2657 33.2275 30.2024 33.714 29.8823 34.3177C29.3109 34.8293 28.9974 34.8277 28.4263 34.3177C28.1455 33.7282 28.0571 33.2561 28.0623 32.1529V22.0505C28.0114 20.4586 27.8782 19.8196 27.3343 18.8033C26.7664 18.2895 26.4455 18.2169 25.8783 18.8033C25.2958 19.6822 25.1456 20.4122 25.1502 22.0505V32.1529C25.1098 32.9892 25.0394 33.481 24.7862 34.3177C24.0659 34.8689 23.6866 34.9277 22.9662 34.3177C22.6628 33.5131 22.5732 33.0185 22.6022 32.1529V22.0505C22.5834 20.6228 22.4515 19.8951 21.8742 18.8033C21.3615 18.2246 21.0438 18.1766 20.4182 18.8033Z" fill="#F0F0F0" stroke="black" />
        <rect x="1" y="1" width="175.212" height="110.628" rx="14" fill="white" fillOpacity="0.75" stroke="#7E7E7E" strokeWidth="2" />
    </svg>
);

export default function QuestionPage() {
    const router = useRouter();

    const handleAnswer = () => {
        router.push('/main');
    };

    return (
        <div style={styles.page}>
            <Header />

            <main style={styles.main}>
                {/* 吹き出し + おにぎりキャラ */}
                <div style={styles.bubbleArea}>
                    <div style={styles.bubbleWrap}>
                        <SpeechBubble />
                        <span style={styles.bubbleText}>今日のお昼ご飯はある？</span>
                    </div>
                    <img
                        src="/rice-ball.png"
                        alt="おにぎりキャラクター"
                        style={styles.character}
                    />
                </div>

                {/* ボタン */}
                <div style={styles.buttonArea}>
                    <button onClick={handleAnswer} style={styles.answerButton}>
                        <YesButton />
                        <span style={styles.yesText}>あるよ♪</span>
                    </button>

                    <button onClick={handleAnswer} style={styles.answerButton}>
                        <NoButton />
                        <span style={styles.noText}>ないよ～</span>
                    </button>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    page: {
        height: '100vh',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily:'-apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
    },
    main: {
        flex: 1,
        minHeight: 0,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    bubbleArea: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        width: '100%',
    },
    bubbleWrap: {
        position: 'relative',
        width: 189,
        marginLeft: 70,
    },
    bubbleText: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '68%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 600,
        color: '#333',
        textAlign: 'center',
    },
    character: {
        width: 90,
        height: 'auto',
        marginTop: -4,
        marginLeft: -180,
    },
    buttonArea: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
        alignItems: 'center',
    },
    answerButton: {
        position: 'relative',
        width: 178,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'block',
    },
    yesText: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 20,
        fontWeight: 800,
        color: '#fff',
        letterSpacing: '0.05em',
        textShadow: `
    -1.5px -1.5px 0 #D4006E,
     1.5px -1.5px 0 #D4006E,
    -1.5px  1.5px 0 #D4006E,
     1.5px  1.5px 0 #D4006E,
     0px 4px 4px rgba(212, 0, 110, 0.35)
  `,

    },
    noText: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 20,
        fontWeight: 800,
        color: '#fff',
        letterSpacing: '0.05em',
        textShadow: `
    -1.5px -1.5px 0 #006ACD,
     1.5px -1.5px 0 #006ACD,
    -1.5px  1.5px 0 #006ACD,
     1.5px  1.5px 0 #006ACD,
     0px 4px 4px rgba(0, 106, 205, 0.35)
  `,
    },
};