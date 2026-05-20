// 후보 공약 API(선거공약 정보 15040587) 응답 정규화 — api_contract §4.3
// 서비스 path/오퍼레이션·필드명은 키 발급 후 확정 (api_contract §6)
import { classifyPledge } from './category-classifier';
import type { Pledge } from '@/types/domain';

export interface RawPledgeItem {
  prmsId?: string;        // 공약 ID
  prmsOrd?: string;       // 공약 순번
  prmsTitle: string;      // 공약 제목
  prmsCn: string;         // 공약 내용(본문)
  prmsRealmName?: string; // 분야명 (응답에 있으면 분류 힌트로 사용)
  prmsUrl?: string;       // 원문 출처 링크 (F-15, 필드명 미확정)
}

export function normalizeCandidatePledge(raw: RawPledgeItem, huboid: string, index: number): Pledge {
  return {
    id: raw.prmsId ?? `${huboid}-${index}`,
    ownerType: 'candidate',
    ownerId: huboid,
    category: classifyPledge(`${raw.prmsTitle} ${raw.prmsCn} ${raw.prmsRealmName ?? ''}`),
    title: raw.prmsTitle,
    body: raw.prmsCn,
    sourceUrl: raw.prmsUrl || undefined,
  };
}

// 응답 순서(공약 순번) 유지 — 후보 내 공약 정렬은 중립성 규칙 대상 아님
export function normalizeCandidatePledges(raws: RawPledgeItem[], huboid: string): Pledge[] {
  return raws.map((raw, index) => normalizeCandidatePledge(raw, huboid, index));
}
