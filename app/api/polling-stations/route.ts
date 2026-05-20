import { fetchNec } from '@/lib/api/nec';
import { normalizeStation, type RawPollingStationItem } from '@/lib/polling-stations/normalize';
import type { PollingStation } from '@/types/domain';
import type { ApiResult } from '@/types/api';

export const revalidate = 1800; // 30분 ISR 캐시 — api_contract §2.5 "자주 변경"

// 투표소 API는 sgTypecode 없이 sgId + sdName + wiwName(구시군명)으로 조회 (명세 §2)
const SERVICE = 'PolplcInfoInqireService2';

async function fetchStations(
  operation: string,
  params: { sgId: string; sdName: string; wiwName: string },
  isEarlyVoting: boolean,
): Promise<{ ok: false; error: ApiResult<PollingStation[]> } | { ok: true; data: PollingStation[] }> {
  const accumulated: RawPollingStationItem[] = [];
  for (let pageNo = 1; pageNo <= 20; pageNo++) {
    const page = await fetchNec<RawPollingStationItem>({ service: SERVICE, operation, params: { ...params, pageNo } });
    if (!page.ok) {
      // 첫 페이지부터 실패면 에러 전파, 중간 실패면 누적분 사용
      if (accumulated.length === 0) return { ok: false, error: page as ApiResult<PollingStation[]> };
      break;
    }
    accumulated.push(...page.data);
    if (page.data.length < 100) break;
  }
  return { ok: true, data: accumulated.map((raw, i) => normalizeStation(raw, i, isEarlyVoting)) };
}

export async function GET(request: Request): Promise<Response> {
  if (!process.env.NEC_API_KEY) {
    return Response.json({ ok: true, data: [] } satisfies ApiResult<PollingStation[]>);
  }

  const { searchParams } = new URL(request.url);
  const sgId = searchParams.get('sgId');
  const sidoName = searchParams.get('sidoName');
  const sggName = searchParams.get('sggName');

  if (!sgId || !sidoName || !sggName) {
    return Response.json({
      ok: false,
      error: { code: 'UPSTREAM_INVALID_PARAM', message: 'sgId, sidoName, sggName은 필수입니다.', retryable: false },
    } satisfies ApiResult<PollingStation[]>);
  }

  const params = { sgId, sdName: sidoName, wiwName: sggName };
  // 사전투표소 + 선거일투표소 모두 조회해 합침
  const [early, day] = await Promise.all([
    fetchStations('getPrePolplcOtlnmapTrnsportInfoInqire', params, true),
    fetchStations('getPolplcOtlnmapTrnsportInfoInqire', params, false),
  ]);

  // 둘 다 실패(첫 페이지 에러)면 에러 전파, 하나라도 성공하면 합쳐서 반환
  if (!early.ok && !day.ok) {
    return Response.json(early.error satisfies ApiResult<PollingStation[]>);
  }

  const data = [
    ...(early.ok ? early.data : []),
    ...(day.ok ? day.data : []),
  ];
  return Response.json({ ok: true, data } satisfies ApiResult<PollingStation[]>);
}
