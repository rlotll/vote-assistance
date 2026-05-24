import { fetchNec } from '@/lib/api/nec';
import {
  extractParties,
  buildPartyGroup,
  type RawProportionalCandidate,
  type RawPartyCode,
} from '@/lib/parties/normalize';
import { sgTypeMeta } from '@/lib/elections/sg-type';
import { toCandidateSggName } from '@/lib/districts/sgg-name';
import type { WidePledgeItem } from '@/lib/pledges/wide-pledges';
import type { PartyWithPledges } from '@/types/domain';
import type { ApiResult } from '@/types/api';

export const revalidate = 600; // 10분 ISR 캐시 — api_contract §2.5

export async function GET(request: Request): Promise<Response> {
  if (!process.env.NEC_API_KEY) {
    return Response.json({ ok: true, data: [] } satisfies ApiResult<PartyWithPledges[]>);
  }

  const { searchParams } = new URL(request.url);
  const sgId = searchParams.get('sgId');
  const sgTypecode = searchParams.get('sgTypecode'); // 비례 선거 종류
  const sidoName = searchParams.get('sidoName');
  const sggName = searchParams.get('sggName');

  if (!sgId || !sgTypecode) {
    return Response.json({
      ok: false,
      error: { code: 'UPSTREAM_INVALID_PARAM', message: 'sgId, sgTypecode는 필수입니다.', retryable: false },
    } satisfies ApiResult<PartyWithPledges[]>);
  }

  // 1) 비례 후보자 조회로 정당명+기호 확보 (정당정책 API가 partyName 필수이기 때문)
  const scope = sgTypeMeta(sgTypecode).scope;
  const candParams: Record<string, string | number> = { sgId, sgTypecode };
  if (sidoName) candParams.sdName = sidoName;
  if (scope === 'sigungu' && sggName) candParams.sggName = toCandidateSggName(sggName);

  const candidates: RawProportionalCandidate[] = [];
  for (let pageNo = 1; pageNo <= 20; pageNo++) {
    const page = await fetchNec<RawProportionalCandidate>({
      service: 'PofelcddInfoInqireService',
      operation: 'getPofelcddRegistSttusInfoInqire',
      params: { ...candParams, pageNo },
    });
    if (!page.ok) {
      if (candidates.length === 0) return Response.json(page as ApiResult<PartyWithPledges[]>);
      break;
    }
    candidates.push(...page.data);
    if (page.data.length < 100) break;
  }

  // 정당 기호(pOrder)는 정당코드 API에서 — 비례 후보 giho는 추천순위라 사용 불가
  const partyCodeResult = await fetchNec<RawPartyCode>({
    service: 'CommonCodeService',
    operation: 'getCommonPartyCodeList',
    params: { sgId, sgTypecode },
  });
  const partyCodes = partyCodeResult.ok ? partyCodeResult.data : [];

  const parties = extractParties(candidates, partyCodes);

  // 2) 정당별 정책(와이드 포맷)을 병렬 조회 — 정책 미제출 정당은 빈 pledges
  const groups = await Promise.all(
    parties.map(async ({ name, number }) => {
      const pol = await fetchNec<WidePledgeItem>({
        service: 'PartyPlcInfoInqireService',
        operation: 'getPartyPlcInfoInqire',
        params: { sgId, partyName: name },
      });
      return buildPartyGroup(name, number, pol.ok ? pol.data : []);
    }),
  );

  return Response.json({ ok: true, data: groups } satisfies ApiResult<PartyWithPledges[]>);
}
