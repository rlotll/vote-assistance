// 정당정책 API(15040588 PartyPlcInfoInqireService) 응답 정규화 — api_contract §4.4
// 응답을 정당별로 그룹핑해 PartyWithPledges[]로 변환. 필드명은 키 발급 후 확정 (§6).
import { bySymbolNumber } from '@/types/domain';
import { classifyPledge } from '@/lib/pledges/category-classifier';
import { partyBrandColor } from './brand-color';
import type { PartyWithPledges } from '@/types/domain';

export interface RawPartyPledgeItem {
  jdName: string;         // 정당명
  jdSym?: string;         // 정당 기호번호
  prmsId?: string;        // 정책 ID
  prmsRealmName?: string; // 정책 분야명 (분류 힌트)
  prmsTitle: string;      // 정책 제목
  prmsCn: string;         // 정책 내용
  prmsUrl?: string;       // 원문 출처 (F-15)
}

// 정당별 그룹핑 + 기호번호 오름차순 정렬 (NF-05 중립성)
export function normalizePartyPledges(raws: RawPartyPledgeItem[]): PartyWithPledges[] {
  const groups = new Map<string, PartyWithPledges>();

  raws.forEach((raw, index) => {
    const name = raw.jdName;
    if (!groups.has(name)) {
      groups.set(name, {
        party: {
          id: name,
          number: parseInt(raw.jdSym ?? '', 10) || 0,
          name,
          brandColor: partyBrandColor(name),
          isProportional: true,
        },
        pledges: [],
      });
    }
    groups.get(name)!.pledges.push({
      id: raw.prmsId ?? `${name}-${index}`,
      ownerType: 'party',
      ownerId: name,
      category: classifyPledge(`${raw.prmsTitle} ${raw.prmsCn} ${raw.prmsRealmName ?? ''}`),
      title: raw.prmsTitle,
      body: raw.prmsCn,
      sourceUrl: raw.prmsUrl || undefined,
    });
  });

  return [...groups.values()].sort((a, b) => bySymbolNumber(a.party, b.party));
}
