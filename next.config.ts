import type { NextConfig } from "next";

// CSP 지시어 — 카카오맵 SDK(dapi.kakao.com)·지도 타일(*.daumcdn.net)만 외부 허용.
// NEC API는 서버 측(Route Handler)에서 호출하므로 브라우저 CSP 대상이 아니다.
// script/style에 'unsafe-inline'을 두는 호환 정책: Next 하이드레이션 인라인 스크립트가
// nonce 없이도 동작하도록 함(엄격 nonce CSP는 별도 작업 필요).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com https://*.daumcdn.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.daumcdn.net https://*.kakao.com",
  "font-src 'self' data:",
  "connect-src 'self' https://dapi.kakao.com https://*.daumcdn.net https://*.kakao.com",
].join('; ');

const nextConfig: NextConfig = {
  // 로컬 네트워크 IP(휴대폰·다른 기기)에서 dev 서버 접속 시 cross-origin 차단 해제
  // Next.js 16은 기본적으로 localhost 외 호스트의 dev 자산/HMR 요청을 막는다
  allowedDevOrigins: ['192.168.0.11', '192.168.0.*', '192.168.1.*'],

  // X-Powered-By: Next.js 노출 제거 (ZAP: Server Leaks Information)
  poweredByHeader: false,

  // 전 경로 공통 보안 응답 헤더 (ZAP 중간/낮음 위험 항목 대응)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
