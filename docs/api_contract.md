# API 계약 정의서 — 한표투표

## 1. 문서 개요

| 항목 | 내용 |
|---|---|
| 문서명 | 한표투표 외부 API 계약 정의서 |
| 버전 | v0.2 (draft) |
| 작성일 | 2026-05-14 |
| 연관 문서 | [PRD §9](./PRD.md), [요구사항 §5](./requirements_doc.md), [ROADMAP §4](./ROADMAP.md), [domain_model.md](./domain_model.md) |
| 상태 | **초안** — 공공데이터포털 데이터셋 ID·엔드포인트는 확정. 각 API의 정확한 요청 파라미터/응답 필드는 키 발급 후 Swagger UI에서 보정 |

> **선결 조건 (ROADMAP §8)**: 공공데이터포털(data.go.kr)에서 8개 데이터셋 활용 신청. 발급은 자동승인이며 개발계정 트래픽 10,000건/일. 발급 지연 시 본 문서의 샘플 픽스처를 M3 mocking 시드로 사용.

---

## 2. 공통 규약

### 2.1 데이터 제공자

| 항목 | 값 |
|---|---|
| 운영 기관 | 중앙선거관리위원회 |
| 포털 | 공공데이터포털 (data.go.kr) |
| 서비스 베이스 URL | `http://apis.data.go.kr/9760000/{ServiceName}` |
| 인증 키 | `serviceKey` query 파라미터 (URL-encoded) |
| 응답 포맷 | `resultType=json` 권장 (기본 `xml`) |
| 페이지네이션 | `pageNo`, `numOfRows` (공공데이터포털 표준) |

### 2.2 환경 변수

| 키 | 위치 | 용도 |
|---|---|---|
| `NEC_API_KEY` | `.env.local` (서버 전용) | data.go.kr 인증키 (Decoding 키 사용 — URL-encoded 자동) |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | `.env.local` (클라이언트 노출) | Kakao Maps JS SDK 키 |

- `NEC_API_KEY`는 **Server Component / Route Handler에서만 사용** (CLAUDE.md 보안 규칙 + NF-03).
- `.env.local`은 커밋 금지.

### 2.3 호출 경로

브라우저 → **Next.js Route Handler (`app/api/...`)** → 공공데이터포털.

- 이유: 인증키 노출 방지 + 응답 정규화 + 캐싱 지점 확보.
- 모든 Route Handler는 외부 응답을 `docs/domain_model.md` 형태로 변환 후 클라이언트 반환.

### 2.4 응답 정규화 envelope

Route Handler는 외부 API의 raw 응답을 다음 형식으로 감싼다:

```ts
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; retryable: boolean } };
```

공공데이터포털 표준 응답의 `resultCode` 처리:

| 외부 resultCode | 정규화 처리 |
|---|---|
| `00` (NORMAL_SERVICE) | `ok: true, data` |
| `03` (NODATA_ERROR) | `ok: true, data: []` (비선거 기간 정상 케이스, F-02) |
| `04`/`05` (HTTP_ERROR / SERVICETIME_OUT) | `ok: false, retryable: true` |
| `12`~`32` (인증/키 오류) | `ok: false, retryable: false` |

### 2.5 TanStack Query 캐싱 가이드

| 데이터 변동성 | API | staleTime | gcTime |
|---|---|---|---|
| 거의 불변 | 코드정보 (시/도) | 24h | 7d |
| 일/주 단위 | 코드정보 (선거 목록, 선거구) | 1h | 24h |
| 선거기간 갱신 | 후보자, 공약, 정당정책 | 10m | 1h |
| 자주 변경 | 투표소 운영시간 | 30m | 6h |

`retry: 2`, `retryDelay: exponential backoff (1s/2s/4s)` (NF-02).

### 2.6 비선거 기간 동작

| 케이스 | 처리 |
|---|---|
| 선거 일정 빈 응답 (resultCode `03`) | "다음 예정 선거 없음" 안내 (F-02) |
| 후보자/공약/투표소 빈 응답 | 빈 목록 + 정상 안내 |

비선거 기간은 정상 케이스로 취급하며 오류 토스트를 띄우지 않는다.

### 2.7 공통 query 파라미터

```
serviceKey={NEC_API_KEY}       (필수)
pageNo={page}                  (선택, 1-based)
numOfRows={size}               (선택, 기본 10)
resultType=json                (선택, xml 기본 → json 권장)
```

---

## 3. 데이터셋 매핑 표

요구사항 EX-ID와 공공데이터포털 데이터셋의 대응:

| 우리 매핑 | 데이터셋 ID | 서비스명 | 비고 |
|---|---|---|---|
| EX-04 선거 일정 / EX-05 선거구 | **15000897** | `CommonCodeService` | 선거ID·선거명·선거종류·선거구 코드 |
| EX-01 후보자 정보 | **15000908** | `PofelcddInfoInqireService` | 등록 후보자 조회 |
| EX-02a 후보 공약 | **15040587** | (선거공약 정보 서비스) | 선거ID+선거종류+후보자ID |
| EX-02b 정당 정책 | **15040588** | `PartyPlcInfoInqireService` | 비례 정당 정책 |
| EX-03 투표소 | **15000836** | `PolplcInfoInqireService2` | 선거일 투표소 |
| EX-03b 사전투표 정보 | 15040586 | `ErVotingSttusInfoInqireService` | 보조 (사전투표 현황) |
| EX-06 지도 | — | Kakao Maps JS SDK | 별도 |

추가 미사용 데이터셋 (참고): 15000900 투·개표 정보, 15040584 개표소 정보, 15000864 당선인 정보, 15140045 후보자 통합검색, 15094967 선거인수현황.

---

## 4. 개별 API 명세

### 4.1 코드정보 (15000897) — 선거 일정 + 선거구

> 본 API는 **선거 식별자(sgId), 선거명, 선거종류코드(sgTypecode), 선거일, 선거구 코드** 등 모든 기초 코드를 단일 서비스로 제공한다. EX-04/EX-05 양쪽에서 동일 서비스를 호출하되 호출 오퍼레이션이 다르다.

| 항목 | 내용 |
|---|---|
| 서비스 URL | `http://apis.data.go.kr/9760000/CommonCodeService` |
| 주 오퍼레이션 | `getCommonSgCodeList` — 선거 코드 목록 (sgId, sgName, sgTypecode, electionDay) |
| 보조 오퍼레이션 | `getCommonSggCodeList` 등 — 선거구 코드 (sgId + sgTypecode 필터) |
| 내부 Route | `GET /api/elections` · `GET /api/districts/sigungu?sgId=&sgTypecode=` |

**선거종류코드 (sgTypecode)** — 핵심 매핑:

| code | 명칭 | 한표투표 ElectionType |
|---|---|---|
| `1` | 대통령선거 | `PRESIDENT` |
| `2` | 국회의원선거 | `PARLIAMENT` |
| `3` | 시·도지사선거 | `LOCAL` (광역단체장) |
| `4` | 구·시·군의장선거 | `LOCAL` (기초단체장) |
| `11` | 교육감선거 | `LOCAL` (교육감) |
| `5`/`6`/`7`/`8` | 광역·기초의원 (지역/비례) | `LOCAL` |

`sgTypecode`는 모의투표 7스텝(S-06) 분기의 1차 키이기도 하다.

**응답 (정규화 후 `Election`)**

```ts
type Election = {
  id: string;              // sgId
  name: string;            // sgName "제22대 대통령선거"
  electionType: 'PRESIDENT' | 'PARLIAMENT' | 'LOCAL';
  sgTypecode: string;      // raw "1" | "2" | "3" | "4" | "11" ...
  electionDay: string;     // ISO date
  earlyVotingStart?: string;
  earlyVotingEnd?: string;
};
```

> 사전투표 일자가 코드정보 응답에 포함되지 않을 경우 클라이언트에서 **선거일 - 5일 / -4일** 규칙으로 산출(공직선거법 §155). 키 발급 후 응답 필드 확인하여 본 가공 로직 유지/제거 결정.

**샘플 픽스처**

```json
{
  "ok": true,
  "data": [
    {
      "id": "20270303",
      "name": "제22대 대통령선거",
      "electionType": "PRESIDENT",
      "sgTypecode": "1",
      "electionDay": "2027-03-03",
      "earlyVotingStart": "2027-02-26",
      "earlyVotingEnd": "2027-02-27"
    }
  ]
}
```

---

### 4.2 후보자 정보 (15000908)

| 항목 | 내용 |
|---|---|
| 서비스 URL | `http://apis.data.go.kr/9760000/PofelcddInfoInqireService` |
| 오퍼레이션 | `getPoelpcddRegistSttusInfoInqire` — 등록 후보자 조회 |
| 내부 Route | `GET /api/candidates?sgId=&sgTypecode=&sggCityCode=` |

**필수 파라미터**: `sgId`, `sgTypecode`. 선거구 코드(`sggCityCode`)는 선택이지만 한표투표는 항상 선거구 단위로 조회.

**응답 (정규화 후 `Candidate`)**

```ts
type Candidate = {
  id: string;              // huboid
  electionId: string;      // sgId
  districtCode: string;    // sggCityCode
  number: number;          // gisuk (기호번호 — 정렬 키, NF-05)
  name: string;            // name
  partyId: string | null;  // jdName 매핑 후 partyId 부여, 무소속 null
  position: CandidatePosition;  // sgTypecode → 매핑
  photoUrl?: string;       // (응답 필드 존재 시)
};
```

**정렬 규칙**: 응답 결과를 Route Handler에서 `number asc`로 정렬 후 반환 (T-36 단위 테스트).

---

### 4.3 선거공약 정보 (15040587) — 후보 공약

| 항목 | 내용 |
|---|---|
| 서비스 URL | `http://apis.data.go.kr/9760000/PofelcddPldgeInfoInqireService` (※ 정확한 path는 키 발급 시 Swagger로 확정) |
| 내부 Route | `GET /api/pledges/candidate?sgId=&sgTypecode=&huboid=` |

**필수 파라미터**: `sgId`, `sgTypecode`, `huboid`.

**제공 선거종류** (sgTypecode):
- `1` 대통령선거 / `3` 시·도지사 / `4` 구·시·군의장 / `11` 교육감

위 외 선거(국회의원·지방의원)는 후보 공약 API 미제공 → S-04 후보자 탭은 해당 선거에서 "공약서 미제출" 안내. (요구사항 §3.3 F-11~F-12 영향)

**응답 (정규화 후 `Pledge`)**

```ts
type Pledge = {
  id: string;
  ownerType: 'candidate';
  ownerId: string;             // huboid
  category: PledgeCategory;    // body 자연어 → 카테고리 매핑(클라이언트)
  title: string;               // prmsTitle
  body: string;                // prmsCn
  sourceUrl?: string;          // 원문 PDF 링크 (F-15)
  order: number;               // 공약 순번
};
```

**카테고리 매핑**: 외부 API는 분야 태그를 제공하지 않을 가능성이 높다. 클라이언트가 `title + body`를 기반으로 `PledgeCategory`(`economy`/`housing`/...)에 매핑하는 키워드 사전을 사용한다. 사전은 `src/lib/pledge-category-classifier.ts`에 둔다 (T-24 범위). v0.2 보완 시 외부 API에 분야 필드가 있으면 키워드 매핑 제거.

---

### 4.4 정당정책 정보 (15040588) — 정당 정책

| 항목 | 내용 |
|---|---|
| 서비스 URL | `http://apis.data.go.kr/9760000/PartyPlcInfoInqireService` |
| 오퍼레이션 | `getPartyPlcInfoInqire` |
| 내부 Route | `GET /api/pledges/party?sgId=&sgTypecode=&partyName=` (※ 정당 식별자 파라미터 키는 키 발급 후 확정) |

**활성 조건**: 지방선거(`sgTypecode` 5~8 비례 종류) 또는 국회의원 비례선거 시. S-05 탭 활성화 판정(F-13)에 사용.

**응답 (정규화 후 `Pledge` with `ownerType='party'`)**

```ts
{
  id: string;
  ownerType: 'party';
  ownerId: string;          // partyId
  category: PledgeCategory; // 4.3과 동일 분류 로직 (jdPolicyRealmName이 있으면 우선 사용)
  title: string;
  body: string;
  sourceUrl?: string;
  order: number;
}
```

---

### 4.5 투표소 정보 (15000836)

| 항목 | 내용 |
|---|---|
| 서비스 URL | `http://apis.data.go.kr/9760000/PolplcInfoInqireService2` |
| 오퍼레이션 | `getPrePolplcOtlnmapTrnsportInfoInqire` — 사전투표소+선거일 투표소 통합 |
| 내부 Route | `GET /api/polling-stations?sgId=&sidoName=&sggName=&early=` |

**필수 파라미터**: `sgId`, `sidoName`, `sggName` (시/도명 + 구/시/군명, **코드가 아니라 명칭**임에 주의).

**응답 (정규화 후 `PollingStation`)**

```ts
type PollingStation = {
  id: string;
  name: string;            // pollPlaceName
  address: string;         // placeAddr
  lat: number;             // (응답 좌표 필드 — 키 발급 후 확정, 없으면 카카오 주소→좌표 Geocoder 사용)
  lng: number;
  hours: string;           // "06:00 ~ 18:00" 등
  isEarlyVoting: boolean;  // 사전투표소 여부 (응답 type 필드로 판정)
};
```

**좌표 누락 대응**: API 응답에 위경도가 없으면 Kakao Local API(주소→좌표)로 보강. 호출 폭증 방지 위해 Route Handler에서 24h 캐시.

---

### 4.6 사전투표 정보 (15040586) — 보조

| 항목 | 내용 |
|---|---|
| 서비스 URL | `http://apis.data.go.kr/9760000/ErVotingSttusInfoInqireService` |
| 오퍼레이션 | `getErVotingSttusInfoInqire` |
| 용도 | 사전투표 진행 현황(투표율 등). v1.0 직접 사용 안 함 — 비기능 모니터링/베타용으로만 검토. |

---

### 4.7 Kakao Maps (EX-06)

| 항목 | 내용 |
|---|---|
| SDK URL | `//dapi.kakao.com/v2/maps/sdk.js?appkey={NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services` |
| 로딩 | Next.js `<Script strategy="lazyOnload">` (S-03 진입 후 lazy load) |
| 사용 객체 | `kakao.maps.Map`, `kakao.maps.Marker`, `kakao.maps.LatLng`, `kakao.maps.services.Geocoder` (좌표 보강용) |
| 타입 | `lib/kakao-map.d.ts`로 자체 declare 또는 커뮤니티 패키지 |

SSR 비활성화: `<KakaoMap>` 컴포넌트는 `'use client'` + `next/dynamic` `{ ssr: false }`.

---

## 5. 에러 코드 표

Route Handler가 정규화하여 반환하는 표준 에러 코드:

| code | 의미 | retryable | UI 처리 |
|---|---|---|---|
| `UPSTREAM_TIMEOUT` | 외부 API 응답 지연 (외부 `04`/`05`) | true | 재시도 버튼 |
| `UPSTREAM_5XX` | 외부 API 서버 오류 | true | 재시도 버튼 |
| `UPSTREAM_INVALID_PARAM` | 외부 `10`~`11` | false | 안내 메시지 |
| `UPSTREAM_AUTH` | 외부 `12`~`32` (키 만료/등록 안 됨) | false | 운영자 알림 (사용자 노출 X) |
| `MISSING_API_KEY` | 서버 env 누락 | false | 운영자 알림 |
| `RATE_LIMIT` | 외부 `22`(일일 한도) | false | "잠시 후 다시 시도" 안내 |
| `EMPTY_RESULT` | 외부 `03` (NODATA_ERROR) | false | 정상 안내 |

---

## 6. 보완 필요 (실제 키 발급 후 v0.3)

- `15040587 선거공약 정보` 서비스의 정확한 path/오퍼레이션명 (Swagger UI 확인)
- 각 API 응답 필드의 정확한 카멜케이스/스네이크케이스
- 후보자 응답에 사진 URL 포함 여부 (없으면 placeholder 사용)
- 투표소 응답에 좌표 직접 포함 여부 (없으면 Kakao Geocoder fallback 확정)
- 사전투표 일정이 코드정보 응답에 포함되는지 (없으면 선거법 기반 계산식 유지)
- 페이지네이션이 실제로 필요한지 (선거구당 후보자 ≤ 20명이므로 단일 호출 충분 예상)
- 일일 트래픽 10,000건이 충분한지 → 캐싱 정책 §2.5로 절감 가능

Sources:
- [중앙선거관리위원회 코드정보 | 공공데이터포털](https://www.data.go.kr/data/15000897/openapi.do)
- [중앙선거관리위원회_후보자 정보 | 공공데이터포털](https://www.data.go.kr/data/15000908/openapi.do)
- [중앙선거관리위원회_선거공약 정보 | 공공데이터포털](https://www.data.go.kr/data/15040587/openapi.do)
- [중앙선거관리위원회_정당정책 정보 | 공공데이터포털](https://www.data.go.kr/data/15040588/openapi.do)
- [중앙선거관리위원회_투표소 정보 | 공공데이터포털](https://www.data.go.kr/data/15000836/openapi.do)
- [중앙선거관리위원회_사전투표 정보 | 공공데이터포털](https://www.data.go.kr/data/15040586/openapi.do)
