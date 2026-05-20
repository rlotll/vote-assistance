import { fetchNec } from '@/lib/api/nec';
import { normalizeStation, type RawPollingStationItem } from '@/lib/polling-stations/normalize';
import type { PollingStation } from '@/types/domain';
import type { ApiResult } from '@/types/api';

export const revalidate = 1800; // 30분 ISR 캐시 — api_contract §2.5 "자주 변경"

export async function GET(request: Request): Promise<Response> {
  if (!process.env.NEC_API_KEY) {
    return Response.json({ ok: true, data: [] } satisfies ApiResult<PollingStation[]>);
  }

  const { searchParams } = new URL(request.url);
  const sgId = searchParams.get('sgId');
  const sgTypecode = searchParams.get('sgTypecode');
  const sidoName = searchParams.get('sidoName');
  const sggName = searchParams.get('sggName');

  if (!sgId || !sgTypecode || !sidoName || !sggName) {
    return Response.json({
      ok: false,
      error: { code: 'UPSTREAM_INVALID_PARAM', message: 'sgId, sgTypecode, sidoName, sggName은 필수입니다.', retryable: false },
    } satisfies ApiResult<PollingStation[]>);
  }

  const accumulated: RawPollingStationItem[] = [];
  for (let pageNo = 1; pageNo <= 20; pageNo++) {
    const page = await fetchNec<RawPollingStationItem>({
      service: 'PolplcInfoInqireService2',
      operation: 'getPrePolplcOtlnmapTrnsportInfoInqire',
      params: { sgId, sgTypecode, sidoName, sggName, pageNo },
    });

    if (!page.ok) {
      if (accumulated.length === 0) {
        return Response.json(page satisfies ApiResult<PollingStation[]>);
      }
      break;
    }
    accumulated.push(...page.data);
    if (page.data.length < 100) break;
  }

  const stations = accumulated.map(normalizeStation);
  return Response.json({ ok: true, data: stations } satisfies ApiResult<PollingStation[]>);
}
