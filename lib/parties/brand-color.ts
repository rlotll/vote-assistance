// 정당 식별 색상 — 외부 API가 색상을 제공하지 않아 정당명 키워드로 상징색 매핑
// 상징색은 사실 기반이라 중립성(NF-05)과 무관. 미매칭 정당은 중립 회색.
// 정당은 선거마다 변동하므로 키 발급/선거 확정 후 사전 갱신 필요.

const NEUTRAL = '#9CA3AF';

// 부분 문자열 매칭 — 정당명에 키워드가 포함되면 해당 색상
const PARTY_COLORS: { keyword: string; color: string }[] = [
  { keyword: '더불어민주', color: '#152484' },
  { keyword: '국민의힘', color: '#E61E2B' },
  { keyword: '정의', color: '#FFCC00' },
  { keyword: '개혁신당', color: '#FF7210' },
  { keyword: '조국혁신', color: '#0073CF' },
  { keyword: '진보', color: '#D6001C' },
  { keyword: '녹색', color: '#00A651' },
];

export function partyBrandColor(name: string): string {
  const hit = PARTY_COLORS.find((p) => name.includes(p.keyword));
  return hit ? hit.color : NEUTRAL;
}
