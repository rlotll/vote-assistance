// D-day 배너 로딩 상태 — 회색 스켈레톤 대신 실제 배너와 같은 크기·색상의 브랜드 placeholder.
// DdayBanner와 동일한 3줄 구조(text-sm / text-5xl / text-sm)로 높이를 맞춰 실제 배너로 swap 시 점프(CLS)를 막는다.
export function DdayBannerLoading() {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="다가오는 선거를 확인하고 있어요"
      className="bg-brand-strong rounded-card p-6 text-white flex flex-col gap-2"
    >
      <span className="text-sm font-medium opacity-90" aria-hidden="true">
        다가오는 선거
      </span>
      {/* 큰 슬롯에 옅은 펄스로 로딩 단서 — 정적 텍스트가 완성 화면처럼 보이는 것을 방지 */}
      <span className="text-5xl font-bold animate-pulse" aria-hidden="true">
        D-…
      </span>
      <span className="text-sm">다가오는 선거를 확인하고 있어요</span>
    </section>
  );
}
