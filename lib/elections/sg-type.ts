// 선거종류코드(sgTypecode) 메타데이터 — 코드정보 API 명세 §1-3 기준
// scope: 후보자 조회 시 단위. 'sido'는 sggName 없이 sdName만으로 조회(시도지사·교육감 등),
//        'sigungu'는 sdName+sggName, 'nation'은 전국 단위(대통령 등).

export interface SgTypeMeta {
  label: string;
  scope: 'nation' | 'sido' | 'sigungu';
  isProportional: boolean;
}

const SG_TYPE_META: Record<string, SgTypeMeta> = {
  '0': { label: '대표선거', scope: 'nation', isProportional: false }, // 통합 코드 — 후보자 탭 제외
  '1': { label: '대통령', scope: 'nation', isProportional: false },
  '2': { label: '국회의원', scope: 'sigungu', isProportional: false },
  '3': { label: '시·도지사', scope: 'sido', isProportional: false },
  '4': { label: '구·시·군의장', scope: 'sigungu', isProportional: false },
  '5': { label: '구·시·군의원', scope: 'sigungu', isProportional: false },
  '6': { label: '구·시·군의원 비례대표', scope: 'sigungu', isProportional: true },
  '7': { label: '국회의원 비례대표', scope: 'nation', isProportional: true },
  '8': { label: '광역의원 비례대표', scope: 'sido', isProportional: true },
  '9': { label: '기초의원 비례대표', scope: 'sigungu', isProportional: true },
  '10': { label: '교육의원', scope: 'sido', isProportional: false },
  '11': { label: '교육감', scope: 'sido', isProportional: false },
};

const FALLBACK: SgTypeMeta = { label: '기타 선거', scope: 'sigungu', isProportional: false };

export function sgTypeMeta(sgTypecode: string): SgTypeMeta {
  return SG_TYPE_META[sgTypecode] ?? FALLBACK;
}

// 후보자(인물) 탭에 노출할 지역구 선거 종류인지 — 비례대표·통합코드(0) 제외
export function isCandidateType(sgTypecode: string): boolean {
  if (sgTypecode === '0') return false;
  return !sgTypeMeta(sgTypecode).isProportional;
}
