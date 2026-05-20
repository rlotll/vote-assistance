// 후보 공약 API(선거공약 정보 ElecPrmsInfoInqireService) 응답 정규화 — 명세 §4 + 실측
// 응답은 후보 1인당 단일 item에 공약이 prmsTitle1~N / prmmCont1~N 와이드 포맷으로 펼쳐짐.
import { expandWidePledges, type WidePledgeItem } from './wide-pledges';
import type { Pledge } from '@/types/domain';

export type RawCandidatePledgeItem = WidePledgeItem;

// 응답 순서(공약 순번) 유지 — 후보 내 공약 정렬은 중립성 규칙 대상 아님
export function normalizeCandidatePledges(raws: RawCandidatePledgeItem[], huboid: string): Pledge[] {
  return raws.flatMap((raw) => expandWidePledges(raw, 'candidate', huboid));
}
