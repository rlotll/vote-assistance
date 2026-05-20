// 선거공약/정당정책 API의 와이드 포맷(prmsTitle1~10, prmmCont1~10 …) → Pledge[] 펼치기.
// 실측 필드명: prmsCnt, prmsOrd{i}, prmsRealmName{i}, prmsTitle{i}, prmmCont{i} (본문은 prm[m]Cont 표기)
import { classifyPledge } from './category-classifier';
import type { Pledge } from '@/types/domain';

export interface WidePledgeItem {
  prmsCnt?: string;
  [field: string]: string | undefined;
}

export function expandWidePledges(
  raw: WidePledgeItem,
  ownerType: Pledge['ownerType'],
  ownerId: string,
): Pledge[] {
  const count = parseInt(raw.prmsCnt ?? '0', 10) || 0;
  const pledges: Pledge[] = [];
  for (let i = 1; i <= count; i++) {
    const title = raw[`prmsTitle${i}`]?.trim();
    if (!title) continue;
    const body = raw[`prmmCont${i}`]?.trim() ?? '';
    const realm = raw[`prmsRealmName${i}`]?.trim() ?? '';
    pledges.push({
      id: `${ownerId}-${i}`,
      ownerType,
      ownerId,
      category: classifyPledge(`${title} ${body} ${realm}`),
      title,
      body,
    });
  }
  return pledges;
}
