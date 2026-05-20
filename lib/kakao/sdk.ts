// Kakao Maps JS SDK 로더 — services 라이브러리(Geocoder) 포함, 1회만 로드해 Promise 캐시.
'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao: any;
  }
}

let sdkPromise: Promise<any> | null = null;

export function loadKakaoSdk(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR_NOT_SUPPORTED'));
  if (sdkPromise) return sdkPromise;

  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  if (!apiKey) return Promise.reject(new Error('MISSING_KAKAO_KEY'));

  sdkPromise = new Promise((resolve, reject) => {
    const ready = () => window.kakao.maps.load(() => resolve(window.kakao));

    if (window.kakao?.maps) {
      ready();
      return;
    }

    const existing = document.querySelector('script[data-kakao-map]');
    if (existing) {
      existing.addEventListener('load', ready);
      existing.addEventListener('error', () => reject(new Error('SDK_LOAD_FAILED')));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
    script.setAttribute('data-kakao-map', '');
    script.onload = ready;
    script.onerror = () => reject(new Error('SDK_LOAD_FAILED'));
    document.head.appendChild(script);
  });

  return sdkPromise;
}
