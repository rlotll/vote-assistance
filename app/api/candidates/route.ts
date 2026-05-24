import { fetchNec } from '@/lib/api/nec';
import { normalizeCandidates, type RawCandidateItem } from '@/lib/candidates/normalize';
import { toCandidateSggName } from '@/lib/districts/sgg-name';
import type { Candidate } from '@/types/domain';
import type { ApiResult } from '@/types/api';

export const revalidate = 600; // 10분 ISR 캐시 — api_contract §2.5 (선거기간 갱신)

export async function GET(request: Request): Promise<Response> {
  // 키 미발급 상태: 빈 응답으로 처리해 빌드/런타임 통과 (project_route_handler_pattern)
  if (!process.env.NEC_API_KEY) {
    return Response.json({ ok: true, data: [] } satisfies ApiResult<Candidate[]>);
  }

  const { searchParams } = new URL(request.url);
  const sgId = searchParams.get('sgId');
  const sgTypecode = searchParams.get('sgTypecode');
  const sidoName = searchParams.get('sidoName');  // NEC sdName
  // 행정구(예: 고양시덕양구)는 후보자 API가 시 단위로만 매칭 → 시까지로 보정
  const sggParam = searchParams.get('sggName');
  const sggName = sggParam ? toCandidateSggName(sggParam) : null;    // NEC sggName

  if (!sgId || !sgTypecode) {
    return Response.json({
      ok: false,
      error: { code: 'UPSTREAM_INVALID_PARAM', message: 'sgId, sgTypecode는 필수입니다.', retryable: false },
    } satisfies ApiResult<Candidate[]>);
  }

  // 선거구당 후보자 ≤ 20명이라 단일 호출 충분 예상이나, 안전하게 페이지 누적 (api_contract §6)
  const accumulated: RawCandidateItem[] = [];
  for (let pageNo = 1; pageNo <= 20; pageNo++) {
    const page = await fetchNec<RawCandidateItem>({
      service: 'PofelcddInfoInqireService',
      // getPofelcdd…(후보자) ≠ getPoelpcdd…(예비후보자, 후보자등록 개시 후 미제공)
      operation: 'getPofelcddRegistSttusInfoInqire',
      params: {
        sgId,
        sgTypecode,
        ...(sidoName ? { sdName: sidoName } : {}),
        ...(sggName ? { sggName } : {}),
        pageNo,
      },
    });

    if (!page.ok) {
      if (accumulated.length === 0) {
        return Response.json(page satisfies ApiResult<Candidate[]>);
      }
      break;
    }
    accumulated.push(...page.data);
    if (page.data.length < 100) break;
  }

  // 정규화 + 기호순 정렬 (NF-05) — Route Handler에서 정렬해 SSR/클라이언트 결과 일치
  const candidates = normalizeCandidates(accumulated);
  return Response.json({ ok: true, data: candidates } satisfies ApiResult<Candidate[]>);
}
