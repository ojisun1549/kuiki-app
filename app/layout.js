import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata = {
  title: "抗血栓薬服用患者の区域麻酔・神経ブロック 判定ツール",
  description:
    "抗血栓療法中の患者に対する区域麻酔・神経ブロックの施行可否を判定する医療従事者向けツール（日本ペインクリニック学会・日本麻酔科学会・日本区域麻酔学会 合同ガイドライン 2016年9月 準拠）",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />

        {/* PWA / iPhoneでのオフライン・ホーム画面追加対応 */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f5f5c" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="区域麻酔判定" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
