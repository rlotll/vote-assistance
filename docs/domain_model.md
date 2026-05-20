# 도메인 모델 정의서 — 한표투표

## 1. 문서 개요

| 항목 | 내용 |
|---|---|
| 문서명 | 한표투표 클라이언트 도메인 모델 정의서 |
| 버전 | v0.1 |
| 작성일 | 2026-05-14 |
| 연관 문서 | [api_contract.md](./api_contract.md), [PRD §7](./PRD.md), [ROADMAP §4](./ROADMAP.md) |

본 문서는 클라이언트에서 사용할 TypeScript 타입의 **단일 진실 공급원(SSOT)** 이다. M3 T-04(API 클라이언트)·T-06(Zustand 스토어)·각 화면 컴포넌트는 모두 이 정의를 import하여 사용한다.

---

## 2. 배치 위치 (M3 적용 시)

```
src/
├─ types/
│  └─ domain.ts            ← 본 문서의 모든 인터페이스
├─ lib/
│  └─ api/                 ← Route Handler 응답 → domain.ts 매핑
└─ stores/
   └─ userStore.ts         ← UserPreference 영속화
```

---

## 3. 핵심 엔티티

### 3.1 Election (선거)

```ts
export type ElectionType = 'PRESIDENT' | 'PARLIAMENT' | 'LOCAL';

export interface Election {
  id: string;
  electionType: ElectionType;
  name: string;                  // "제22대 대통령 선거"
  electionDay: string;           // ISO date
  earlyVotingStart: string;      // ISO date
  earlyVotingEnd: string;        // ISO date
}
```

**유도 값** (도메인 함수로 별도 제공):

```ts
function daysUntil(election: Election, today: Date): number;
function isEarlyVotingPeriod(election: Election, today: Date): boolean;
function hasProportionalRepresentation(election: Election): boolean; // LOCAL일 때 true
```

### 3.2 District (선거구)

```ts
export interface Sido {
  code: string;                  // "11"
  name: string;                  // "서울특별시"
}

export interface Sigungu {
  code: string;                  // "11680"
  name: string;                  // "강남구"
  sidoCode: string;
  districtCode: string;          // 지역구 코드 — 후보자/공약 조회 키
}

export interface District {
  sido: Sido;
  sigungu: Sigungu;
}
```

### 3.3 Party (정당)

```ts
export interface Party {
  id: string;
  number: number;                // 기호 번호 (정렬 키)
  name: string;
  brandColor: string;            // 정당 식별 컬러 (hex)
  isProportional: boolean;       // 비례대표 정당 여부
}
```

### 3.4 Candidate (후보자)

```ts
export interface Candidate {
  id: string;
  electionId: string;
  districtCode: string;
  number: number;                // 기호 번호 (정렬 키)
  name: string;
  partyId: string | null;        // 무소속 = null
  position: CandidatePosition;
  photoUrl?: string;
}

export type CandidatePosition =
  | 'PRESIDENT'                  // 대통령
  | 'PARLIAMENT_MEMBER'          // 국회의원
  | 'EDUCATION_SUPERINTENDENT'   // 교육감
  | 'METRO_HEAD'                 // 광역단체장
  | 'LOCAL_HEAD'                 // 기초단체장
  | 'METRO_COUNCIL'              // 광역의원
  | 'LOCAL_COUNCIL';             // 기초의원
```

### 3.5 Pledge (공약/정책)

```ts
export type PledgeCategory =
  | 'economy'
  | 'housing'
  | 'environment'
  | 'education'
  | 'welfare';

export interface Pledge {
  id: string;
  ownerType: 'candidate' | 'party';
  ownerId: string;               // candidateId 또는 partyId
  category: PledgeCategory;
  title: string;
  body: string;
  sourceUrl?: string;            // F-15 원문 출처
}
```

**확장 정책**: 카테고리는 코드 enum이 아니라 union 리터럴로 유지 (런타임 변경 가능성 최소). 신규 카테고리 추가 시:
1. `PledgeCategory`에 리터럴 추가
2. `docs/design_tokens.md`의 카테고리 컬러 매핑 갱신
3. `components/PledgeFilter`의 라벨 매핑 갱신

### 3.6 PollingStation (투표소)

```ts
export interface PollingStation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  hours: string;                 // 자유 형식 "06:00 ~ 18:00"
  isEarlyVoting: boolean;
}
```

---

## 4. 정렬 규칙 (중립성 — NF-05)

후보자·정당을 화면에 노출할 때는 **항상 `number asc`** 로 정렬한다. 다른 정렬 키는 어떤 화면에서도 허용되지 않는다.

```ts
// src/lib/sort.ts
export function bySymbolNumber<T extends { number: number }>(a: T, b: T): number {
  return a.number - b.number;
}
```

- T-36에서 본 함수와 모든 사용처에 대한 단위 테스트를 작성한다.
- API Route Handler에서도 동일 정렬을 적용하여 SSR/클라이언트 결과 일치 보장.

---

## 5. 분야 태그 매핑

| code | 라벨 | 설명 |
|---|---|---|
| `economy` | 경제 | 일자리, 산업, 세제 |
| `housing` | 주거 | 부동산, 임대, 청년 주택 |
| `environment` | 환경 | 기후, 에너지 |
| `education` | 교육 | 교육 정책 (교육감 선거 포함) |
| `welfare` | 복지 | 보건, 돌봄, 연금 |

라벨/순서는 `src/lib/pledge-category.ts`에 단일 정의하여 모든 화면(S-04, S-05)이 import.

---

## 6. 클라이언트 상태 (Zustand persist)

### 6.1 UserPreference 스토어

```ts
// src/stores/userStore.ts
export interface UserPreference {
  district: District | null;             // 설정된 선거구 (F-03~F-04)
  residenceDiffersFromRegistration: boolean; // F-05 체크박스 상태
  selectedCategories: PledgeCategory[];  // 분야 태그 다중 선택 (F-11)
}

interface UserStore extends UserPreference {
  setDistrict(district: District): void;
  setResidenceDifferent(value: boolean): void;
  toggleCategory(category: PledgeCategory): void;
  reset(): void;
}
```

- **persist 키**: `vote-assistant:user:v1` (스키마 변경 시 v2로 마이그레이션)
- **저장소**: `localStorage` (NF-03 — 서버 미전송)
- **하이드레이션 가드**: SSR 시 `null` 처리, 클라이언트 마운트 후 복원

### 6.2 MockVote 임시 상태 (메모리 전용)

```ts
// src/stores/mockVoteStore.ts
export interface MockVoteSelection {
  step: number;                          // 1~7
  position: CandidatePosition;
  candidateId?: string;
  partyId?: string;                      // 비례 선거 시
}

interface MockVoteStore {
  selections: MockVoteSelection[];
  setSelection(s: MockVoteSelection): void;
  reset(): void;                         // F-19 "다시 해보기"
}
```

- **persist 사용 금지** (F-18, NF-03 — 결과 저장/전송 금지)
- 페이지 새로고침 시 자동 초기화

---

## 7. 가드 규칙

선거구 미설정 상태(`UserPreference.district === null`)에서 S-03/S-04/S-05/S-06 진입 시 S-02로 리다이렉트 (제약 §10, T-07).

```ts
// src/lib/guards/require-district.ts
export function requireDistrict(district: District | null): asserts district is District {
  if (!district) {
    throw new RedirectError('/district-setup');
  }
}
```

---

## 8. 엔티티 관계 (요약)

```
Election ──── has many ──── Candidate ──── has many ──── Pledge
   │                            │
   │                            └── belongs to ── Party (or null)
   │
   └── has many ──── PollingStation

District (Sido + Sigungu) ── filters ──> Candidate · PollingStation
```

UserPreference는 District 1건을 보관하며, 이 District가 모든 데이터 조회의 기준 좌표가 된다.

---

## 9. 보완 필요

- API 키 발급 후 실제 응답 필드명을 본 인터페이스에 1:1 매핑 (Route Handler 변환 레이어에서 흡수)
- Election 식별자 체계가 외부 API에서 안정적인지 확인 — 불안정 시 `electionDay + electionType`을 합성 키로 사용
