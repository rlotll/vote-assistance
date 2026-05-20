import type { Page } from '@playwright/test';

// 결정적 E2E를 위해 내부 /api/* 응답(ApiResult 형태)을 fixtures로 모킹한다.
export const SEOUL = { code: '11', name: '서울특별시' };
export const JONGNO = { code: '11110', name: '종로구', sidoCode: '11', districtCode: '종로구' };

export const fixtures = {
  // pickActiveElection은 미래 선거 중 최소일을 고른다. type=0(대표)+실제 종류들
  elections: [
    { id: '20260603', electionType: 'LOCAL', sgTypecode: '0', name: '제9회 전국동시지방선거', electionDay: '2099-06-03', earlyVotingStart: '2099-05-29', earlyVotingEnd: '2099-05-30' },
    { id: '20260603', electionType: 'LOCAL', sgTypecode: '11', name: '교육감선거', electionDay: '2099-06-03' },
    { id: '20260603', electionType: 'LOCAL', sgTypecode: '3', name: '시·도지사선거', electionDay: '2099-06-03' },
    { id: '20260603', electionType: 'LOCAL', sgTypecode: '4', name: '구·시·군의장선거', electionDay: '2099-06-03' },
    { id: '20260603', electionType: 'LOCAL', sgTypecode: '8', name: '광역의원비례', electionDay: '2099-06-03' },
  ],
  sigungu: [
    JONGNO,
    { code: '11140', name: '중구', sidoCode: '11', districtCode: '중구' },
  ],
  candidates: [
    { id: 'C1', electionId: '20260603', districtCode: '종로구', number: 1, name: '김후보', partyId: '가나다당', partyName: '가나다당', position: 'LOCAL_HEAD' },
    { id: 'C2', electionId: '20260603', districtCode: '종로구', number: 2, name: '이후보', partyId: '라마바당', partyName: '라마바당', position: 'LOCAL_HEAD' },
  ],
  pollingStations: [
    { id: 'pre-1', name: '청운효자동 사전투표소', address: '서울특별시 종로구 자하문로 92', floor: '1층', lat: 37.585, lng: 126.969, hours: '06:00 ~ 18:00', isEarlyVoting: true },
    { id: 'day-1', name: '청운효자동 제1투표소', address: '서울특별시 종로구 청운동 1', lat: 37.586, lng: 126.97, hours: '06:00 ~ 18:00', isEarlyVoting: false },
  ],
  candidatePledges: [
    { id: 'C1-1', ownerType: 'candidate', ownerId: 'C1', category: 'economy', title: '청년 일자리 확대', body: '창업 지원' },
    { id: 'C1-2', ownerType: 'candidate', ownerId: 'C1', category: 'housing', title: '주거 안정', body: '공공임대 확대' },
  ],
  partyGroups: [
    {
      party: { id: '가나다당', number: 1, name: '가나다당', brandColor: '#123456', isProportional: true },
      pledges: [{ id: 'P1-1', ownerType: 'party', ownerId: '가나다당', category: 'welfare', title: '복지 확대', body: '돌봄 강화' }],
    },
  ],
} as const;

type RouteOverrides = Partial<Record<string, { ok: boolean; data?: unknown; error?: unknown }>>;

// 내부 API 모킹. overrides로 특정 경로 응답을 바꿔 장애/빈 데이터 시나리오도 검증 가능.
export async function mockApi(page: Page, overrides: RouteOverrides = {}) {
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (overrides[path]) {
      await route.fulfill({ json: overrides[path] });
      return;
    }
    const map: Record<string, unknown> = {
      '/api/elections': fixtures.elections,
      '/api/districts/sigungu': fixtures.sigungu,
      '/api/candidates': fixtures.candidates,
      '/api/polling-stations': fixtures.pollingStations,
      '/api/pledges/candidate': fixtures.candidatePledges,
      '/api/pledges/party': fixtures.partyGroups,
    };
    await route.fulfill({ json: { ok: true, data: map[path] ?? [] } });
  });
}

// 선거구가 설정된 상태로 시작 (localStorage 주입, 페이지 로드 전)
export async function presetDistrict(page: Page) {
  await page.addInitScript(
    ([sido, sigungu]) => {
      localStorage.setItem(
        'vote-assistant:user:v1',
        JSON.stringify({
          state: { district: { sido, sigungu }, residenceDiffersFromRegistration: false, selectedCategories: [] },
          version: 0,
        }),
      );
    },
    [SEOUL, JONGNO],
  );
}
