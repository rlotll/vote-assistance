// 정당정책(PartyPlcInfoInqireService)은 partyName별 호출이 필요하다.
// 비례 후보자 조회에서 정당명+기호(giho)를 추출한 뒤, 정당별 정책(와이드 포맷)을 묶는다.
import { expandWidePledges, type WidePledgeItem } from '@/lib/pledges/wide-pledges';
import { partyBrandColor } from './brand-color';
import type { PartyWithPledges } from '@/types/domain';

// 비례 후보자 응답의 정당 식별 필드 (giho는 정당 내 추천순위라 정당 기호가 아님)
export interface RawProportionalCandidate {
  jdName?: string;
}

// 정당코드(getCommonPartyCodeList) — pOrder가 정당 투표용지 기호 순서
export interface RawPartyCode {
  jdName?: string;
  pOrder?: string;
}

// 비례 출마 정당(후보자 기준) ∩ 정당코드(pOrder=기호) → {name, number} 기호 오름차순 (NF-05 중립성)
export function extractParties(
  cands: RawProportionalCandidate[],
  partyCodes: RawPartyCode[],
): { name: string; number: number }[] {
  const orderMap = new Map<string, number>();
  for (const p of partyCodes) {
    const name = p.jdName?.trim();
    if (name && !orderMap.has(name)) orderMap.set(name, parseInt(p.pOrder ?? '', 10) || 0);
  }
  const names = new Set<string>();
  for (const c of cands) {
    const name = c.jdName?.trim();
    if (name && name !== '무소속') names.add(name);
  }
  return [...names]
    .map((name) => ({ name, number: orderMap.get(name) ?? 0 }))
    .sort((a, b) => a.number - b.number);
}

// 정당 1곳 + 정책 응답(와이드 포맷) → PartyWithPledges
export function buildPartyGroup(
  name: string,
  number: number,
  policyRaws: WidePledgeItem[],
): PartyWithPledges {
  return {
    party: { id: name, number, name, brandColor: partyBrandColor(name), isProportional: true },
    pledges: policyRaws.flatMap((raw) => expandWidePledges(raw, 'party', name)),
  };
}
