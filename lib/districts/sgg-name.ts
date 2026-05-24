// 후보자/공약 조회용 선거구명(sggName) 보정.
// 일반시의 행정구(예: "고양시덕양구", "창원시의창구")는 단체장·지방의원 선거가 '시' 단위로 치러져,
// NEC 후보자 API는 시 단위(예: "고양시")로만 매칭된다(실측). 반면 광역시 자치구("해운대구")와
// 자치시·군("진주시", "양평군")은 자체 단위라 그대로 둔다.
// getCommonGusigunCodeList는 행정구를 "시+구" 결합 형태로, 자치구는 "구" 단독으로 반환하므로
// "<…>시<…>구" 패턴일 때만 시까지로 축약한다.
export function toCandidateSggName(sggName: string): string {
  const m = /^(.+?시)(.+구)$/.exec(sggName);
  return m ? m[1] : sggName;
}
