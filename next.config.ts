import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // セキュリティレスポンスヘッダの設定
  async headers() {
    // 管理画面でも店舗画像等を表示するため、Supabaseのドメインを動的に生成
    const supabaseHostname = process.env.SUPABASE_NAME_DEV 
      ? `https://${process.env.SUPABASE_NAME_DEV}.supabase.co` 
      : 'https://*.supabase.co';

    return [
      {
        // 画面、APIを含むすべてのリクエストに適用
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // クリックジャッキング対策：他サイトのiframeへの埋め込みを禁止
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), camera=(), microphone=()', // 不要なブラウザ機能を禁止
          },
          {
            // UI崩れを防ぐため、「Report-Only（警告のみ）」で本適用します
            key: 'Content-Security-Policy-Report-Only',
            value: 
              "default-src 'self'; " +
              // 画像：自身、dataスキーム、およびSupabaseのドメインを許可
              `img-src 'self' data: ${supabaseHostname}; ` +
              // スクリプト：自身、Next.jsの内部インラインを許可
              "script-src 'self' 'unsafe-inline'; " +
              // スタイル：MUIなどのデザイン崩れを防ぐため 'unsafe-inline' を許可
              "style-src 'self' 'unsafe-inline'; " +
              "frame-ancestors 'none'; " +
              "base-uri 'self';"
          },
        ],
      },
    ];
  },
};

export default nextConfig;