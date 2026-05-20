import { fetchNec } from '@/lib/api/nec';
import { shiftDateKst } from '@/lib/elections/d-day';
import type { Election, ElectionType } from '@/types/domain';
import type { ApiResult } from '@/types/api';

export const revalidate = 3600; // 1시간 ISR 캐시 — api_contract §2.5

// sgTypecode → ElectionType 매핑 (api_contract §4.1)
function toElectionType(sgTypecode: string): ElectionType {
  if (sgTypecode === '1') return 'PRESIDENT';
  if (sgTypecode === '2') return 'PARLIAMENT';
  return 'LOCAL';
}

// earlyVoting 필드 미제공 시 선거법 기준 -5일/-4일 보정 (공직선거법 §155)
function fillEarlyVoting(election: Election): Election {
  if (election.earlyVotingStart && election.earlyVotingEnd) return election;
  return {
    ...election,
    earlyVotingStart: shiftDateKst(election.electionDay, -5),
    earlyVotingEnd: shiftDateKst(election.electionDay, -4),
  };
}

// 공공데이터포털 raw 응답 항목 타입 (실측 기반 — getCommonSgCodeList)
interface RawElectionItem {
  num?: string;
  sgId: string;
  sgName: string;
  sgTypecode: string;
  sgVotedate: string;         // "YYYYMMDD" 형식 (예: "19871216")
  earlyVotingStart?: string;
  earlyVotingEnd?: string;
}

// "20270303" → "2027-03-03" 형식 정규화
function normalizeDate(raw: string): string {
  if (raw.includes('-')) return raw;
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

function normalizeElection(raw: RawElectionItem): Election {
  const electionDay = normalizeDate(raw.sgVotedate);
  const base: Election = {
    id: raw.sgId,
    name: raw.sgName,
    electionType: toElectionType(raw.sgTypecode),
    sgTypecode: raw.sgTypecode,
    electionDay,
    earlyVotingStart: raw.earlyVotingStart ? normalizeDate(raw.earlyVotingStart) : undefined,
    earlyVotingEnd: raw.earlyVotingEnd ? normalizeDate(raw.earlyVotingEnd) : undefined,
  };
  return fillEarlyVoting(base);
}

export async function GET(): Promise<Response> {
  // 키 미발급 상태: 비선거 기간(빈 응답)으로 처리해 빌드/런타임 통과
  if (!process.env.NEC_API_KEY) {
    return Response.json({ ok: true, data: [] } satisfies ApiResult<Election[]>);
  }

  // NEC는 한 페이지에 최대 100건, 오래된 선거부터 시간순 반환 — 모든 페이지 누적해 미래 선거까지 포함
  const accumulated: RawElectionItem[] = [];
  for (let pageNo = 1; pageNo <= 20; pageNo++) {
    const page = await fetchNec<RawElectionItem>({
      service: 'CommonCodeService',
      operation: 'getCommonSgCodeList',
      params: { pageNo },
    });
    if (!page.ok) {
      // 첫 페이지 실패면 에러 그대로, 중간 페이지 실패면 누적분으로 응답
      if (accumulated.length === 0) {
        return Response.json(page satisfies ApiResult<Election[]>);
      }
      break;
    }
    accumulated.push(...page.data);
    if (page.data.length < 100) break; // 마지막 페이지
  }

  const elections = accumulated.map(normalizeElection);
  return Response.json({ ok: true, data: elections } satisfies ApiResult<Election[]>);
}
