# 컴포넌트 카탈로그 — 한표투표

## 1. 문서 개요

| 항목 | 내용 |
|---|---|
| 문서명 | 한표투표 공통 컴포넌트 카탈로그 |
| 버전 | v0.1 |
| 작성일 | 2026-05-14 |
| 연관 문서 | [wireframe_doc.md §3.4](./wireframe_doc.md), [design_tokens.md](./design_tokens.md), [ROADMAP T-05, T-08](./ROADMAP.md) |

본 문서는 M3 T-08(공통 UI 컴포넌트)·T-05(오류/재시도 UI)에서 만들 컴포넌트의 props 시그니처와 variant를 정의한다. 실제 구현 코드는 본 단계에서 작성하지 않는다.

배치 위치: `src/components/ui/`.

---

## 2. 공통 원칙

- 모든 인터랙티브 컴포넌트는 **최소 터치 영역 44×44px** 확보 (`--space-touch-min`, 와이어프레임 §6).
- 키보드 포커스 시 `outline: 2px solid var(--color-focus-ring)` 일관 적용.
- 아이콘은 `lucide-react`만 사용. 장식용 아이콘에는 `aria-hidden="true"`.
- 라이트모드 전용 — 시맨틱 토큰은 단일 값 고정(`color-scheme: light`).
- `'use client'` 지시문은 인터랙션이 필요한 컴포넌트에만 부착.

---

## 3. 컴포넌트 명세

### 3.1 `Button`

```ts
type ButtonProps = {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
  asChild?: boolean;                     // Slot 패턴 (Link로 변신 가능)
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;
```

- **primary**: `bg-brand text-white`
- **outline**: 투명 배경 + 브랜드 컬러 테두리·텍스트
- **ghost**: 배경 없음, 텍스트만 (탭/링크용)
- `lg` size는 모의투표/설정 완료 등 메인 CTA에서 사용 (높이 ≥ 48px)

**사용 화면**: 모든 화면.

---

### 3.2 `Card`

```ts
type CardProps = {
  variant?: 'default' | 'info' | 'ballot-green' | 'ballot-peach' | 'ballot-blue';
  padding?: 'sm' | 'md';
  as?: ElementType;                      // 기본 'div', 'article' 등으로 교체
  children: ReactNode;
};
```

- **default**: `bg-background-primary` + `border-card`
- **info**: `bg-brand-light` (사전투표 안내, 빠른 메뉴 등)
- **ballot-***: S-06 투표용지 배경. `Pledge.position`에 따라 매핑 함수로 자동 선택.

**사용 화면**: S-01~S-06 전반.

---

### 3.3 `Tabs`

```ts
type TabsProps<T extends string> = {
  value: T;
  onChange: (next: T) => void;
  items: { value: T; label: string; disabled?: boolean }[];
  syncWithRoute?: boolean;               // true면 URL ?tab= 동기화
  ariaLabel: string;
};
```

- 활성 항목은 `--color-brand` 강조.
- `syncWithRoute=true`: Next.js `useSearchParams` 기반 양방향 동기화 (S-04 ↔ S-05 탭).
- 비활성화된 탭(예: 비지방선거 시 정당 탭)은 `disabled=true` + 라벨 옆 보조 텍스트 노출.

**사용 화면**: S-03 (지도/목록), S-04·S-05 (후보자/정당).

---

### 3.4 `Dropdown`

```ts
type DropdownProps<T> = {
  value: T | null;
  onChange: (next: T) => void;
  options: { value: T; label: string }[];
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  ariaLabel: string;
};
```

S-02의 2단계 cascade는 단일 `Dropdown` 두 개를 조합 (cascade 로직은 컴포넌트가 아닌 페이지에서 관리):

```tsx
<Dropdown value={sido} onChange={setSido} options={sidoOptions} placeholder="시/도" />
<Dropdown
  value={sigungu}
  onChange={setSigungu}
  options={sigunguOptions}
  placeholder="구/시/군"
  disabled={!sido}
  loading={isSigunguLoading}
/>
```

**사용 화면**: S-02.

---

### 3.5 `Badge`

```ts
type BadgeProps = {
  variant?: 'default' | 'early-voting' | 'd-day';
  icon?: LucideIcon;
  children: ReactNode;
};
```

- **early-voting**: `bg-early-voting-bg text-early-voting-fg` + 아이콘 (사전투표 대상 표시, T-15)
- **d-day**: 브랜드 컬러 + 큰 폰트 (D-day 배너용)
- pill 형태 (`rounded-pill`)

**사용 화면**: S-01 (D-day), S-02·S-03 (사전투표).

---

### 3.6 `Skeleton`

```ts
type SkeletonProps = {
  preset?: 'candidate-card' | 'polling-station' | 'pledge-card' | 'list-item';
  count?: number;
};
```

- 데이터 로딩 시 레이아웃 시프트 방지.
- `preset`별 고정 형태로 일관성 유지 (NF-06 초기 로딩 ≤ 3초 인지 개선).

**사용 화면**: S-03, S-04, S-05.

---

### 3.7 `BottomTabBar`

```ts
type BottomTabBarProps = {
  active: 'home' | 'polling' | 'pledges' | 'mock-vote';
};
```

- 4개 탭 고정 (홈/투표소/공약비교/모의투표).
- 활성 탭은 `text-brand` + 아이콘 채움.
- 위치: `fixed bottom-0` + `pb-[var(--safe-area-bottom)]`.
- 라우팅: Next.js `<Link>` 사용, `usePathname()`으로 자동 active 판단도 허용 (active prop 옵션화 검토).

**사용 화면**: 전 화면 (S-01~S-06).

---

### 3.8 `InfoBox`

```ts
type InfoBoxProps = {
  tone?: 'brand' | 'early-voting';
  icon?: LucideIcon;
  title?: string;
  children: ReactNode;
};
```

- 와이어프레임 §3.4 "안내 박스" 규칙 (브랜드 라이트 배경 + 아이콘 + 텍스트).
- `tone='early-voting'`: 사전투표 분기 안내 (F-06).

**사용 화면**: S-02 (사전투표 안내), S-04/S-05 (스크롤 힌트), S-06 (결과 저장 안내).

---

### 3.9 `ProgressSteps`

```ts
type ProgressStepsProps = {
  total: number;                         // 7 (지방선거) 또는 동적
  current: number;                       // 1-based
  ariaLabel: string;
};
```

- 완료: `bg-brand-medium`
- 현재: `bg-brand`
- 미완료: `bg-background-secondary` + 점선 테두리
- 와이어프레임 §4 S-06 진행 스텝바 규칙 그대로.

**사용 화면**: S-06.

---

### 3.10 `ErrorBanner` (T-05)

```ts
type ErrorBannerProps = {
  message: string;
  retryable?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
};
```

- 인라인 배너 형태 (페이지 상단 또는 카드 내부).
- `retryable=true`인 경우 "다시 시도" 버튼 표시 (NF-02).
- `ApiResult.error` envelope의 `retryable` 필드와 1:1 매핑.

**사용 화면**: API 호출이 있는 모든 화면.

---

### 3.11 `Toast` (T-05)

```ts
type ToastOptions = {
  message: string;
  tone?: 'info' | 'error' | 'success';
  duration?: number;                     // ms, 기본 3000
};

// 전역 함수형 API
toast.info(message, opts?)
toast.error(message, opts?)
toast.success(message, opts?)
```

- ARIA `role="status"` + `aria-live="polite"`.
- 화면 하단 (하단 탭 바 위) 표시, `safe-area-bottom` 고려.

---

## 4. 화면 × 컴포넌트 매트릭스

| 화면 | 주요 사용 컴포넌트 |
|---|---|
| S-01 메인 | `Card(info)`, `Badge(d-day)`, `Badge(early-voting)`, `BottomTabBar` |
| S-02 선거구 설정 | `Dropdown` ×2, `InfoBox(early-voting)`, `Badge(early-voting)`, `Button(primary, lg)`, `BottomTabBar` |
| S-03 투표소 안내 | `Tabs`, `Card(default)`, `Skeleton(polling-station)`, `Badge(early-voting)`, `ErrorBanner`, `BottomTabBar` |
| S-04 후보자 비교 | `Tabs(syncWithRoute)`, `Badge(default)` ×N (분야 태그), `Card(default)`, `Skeleton(candidate-card)`, `BottomTabBar` |
| S-05 정당 비교 | `Tabs(syncWithRoute)`, `Card(default)`, `Skeleton(pledge-card)`, `BottomTabBar` |
| S-06 모의투표 | `ProgressSteps`, `Card(ballot-*)`, `Button(primary)`, `Button(outline)`, `InfoBox`, `BottomTabBar` |

---

## 5. 검수 체크포인트

T-08 완료 기준:

- [ ] 모든 컴포넌트가 44px 터치 영역 충족 (`qa_checklist.md` 접근성 항목)
- [ ] 라이트모드 단일 테마로 모든 variant 시각 확인 (다크모드 미지원)
- [ ] Storybook 또는 `app/_dev/` 라우트에서 모든 variant 한 페이지 확인 가능
- [ ] 모든 인터랙티브 컴포넌트가 키보드만으로 조작 가능
- [ ] 모든 컴포넌트가 외부 라이브러리(Radix 등) 도입 없이 React 19 + Tailwind만으로 구현 (의존성 최소화)

---

## 6. 보완 필요

- 디자인 시안 확정 후 그림자/모션 스펙 추가
- `Tabs`에 swipe 제스처 필요 여부 — 와이어프레임 명시 없음, 베타 피드백 후 결정
