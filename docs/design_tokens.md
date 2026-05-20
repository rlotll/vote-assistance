# 디자인 토큰 정의서 — 한표투표

## 1. 문서 개요

| 항목 | 내용 |
|---|---|
| 문서명 | 한표투표 디자인 토큰 정의서 |
| 버전 | v0.1 |
| 작성일 | 2026-05-14 |
| 연관 문서 | [wireframe_doc.md §3](./wireframe_doc.md), [ROADMAP T-02](./ROADMAP.md) |

본 문서는 Tailwind CSS v4 `@theme` 블록과 CSS 변수에 그대로 옮길 수 있는 토큰 표다. M3 T-02에서 `app/globals.css`에 적용한다.

---

## 2. 토큰 명명 규칙

- 모든 토큰은 `kebab-case` CSS 변수로 정의.
- `@theme inline`에 매핑하여 Tailwind 유틸리티(예: `bg-brand`, `text-early-voting-fg`) 자동 생성.
- 색상은 두 종류로 구분:
  - **고정 색상** (브랜드, 사전투표, 투표용지 색)
  - **시맨틱 색상** (텍스트, 배경)
- **라이트모드 전용** — 시스템 다크모드를 무시하고 `:root`에 `color-scheme: light`를 지정한다 (2026-05-20 결정).

---

## 3. 컬러 토큰

### 3.1 브랜드 (고정)

| 토큰 | 값 | 용도 (와이어프레임 §3.2) |
|---|---|---|
| `--color-brand` | `#1D9E75` | 테두리·아이콘·hover 등 (작은 텍스트/텍스트 배경에는 명도비 부족) |
| `--color-brand-strong` | `#157A5A` | 흰 배경 위 작은 텍스트·흰 텍스트 배경 (WCAG AA 4.5:1 충족) — 버튼·활성탭·배지·링크 |
| `--color-brand-light` | `#E1F5EE` | 배경 강조, 안내 박스, 완료 투표용지 |
| `--color-brand-medium` | `#5DCAA5` | 완료 스텝 표시 |

### 3.2 사전투표 (고정)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--color-early-voting-bg` | `#FAEEDA` | 사전투표 배지 배경, 안내 박스 |
| `--color-early-voting-fg` | `#633806` | 사전투표 배지 텍스트 |

> 일반 안내(브랜드 계열)와 사전투표 안내(주황 계열)는 색상으로만 구분하지 않고 아이콘+텍스트로도 명시 (접근성 §6.2).

### 3.3 모의투표 용지 배경 (고정)

S-06의 7단계 투표용지 배경색. wireframe §4 S-06 표를 그대로 옮긴다.

| 토큰 | 값 | 사용 스텝 |
|---|---|---|
| `--color-ballot-green` | `#E1F5EE` | 1, 2, 4, 6 (교육감/광역단체장/광역의원/기초의원) |
| `--color-ballot-peach` | `#FAECE7` | 3 (기초자치단체장) |
| `--color-ballot-blue` | `#E6F1FB` | 5, 7 (비례대표) |

### 3.4 시맨틱 색상 (라이트 전용)

| 토큰 | 값 |
|---|---|
| `--color-text-primary` | `#0F172A` |
| `--color-text-secondary` | `#64748B` |
| `--color-background-primary` | `#FFFFFF` |
| `--color-background-secondary` | `#F8FAFC` |
| `--color-border-default` | `rgba(15, 23, 42, 0.08)` |
| `--color-focus-ring` | `#1D9E75` |

> 라이트모드 전용이므로 시맨틱 색상은 단일 값으로 고정한다. 시스템 다크모드는 `color-scheme: light`로 무시.

---

## 4. 타이포그래피

와이어프레임 §3.3 기준 + 실제 구현 권장값 매핑.

| 역할 | 와이어프레임 | 실제 구현 | weight |
|---|---|---|---|
| 화면 제목 | 12px | `18px` | 500 |
| 섹션 레이블 | 8px / 대문자 / 보조색 | `12px` / 대문자 / 보조색 | 500 |
| 본문 | 10~11px | `15px` | 400 |
| 보조 설명 | 8~9px | `12px` | 400 |

토큰:

| 토큰 | 값 |
|---|---|
| `--font-size-title` | `1.125rem` (18px) |
| `--font-size-body` | `0.9375rem` (15px) |
| `--font-size-label` | `0.75rem` (12px) |
| `--font-size-caption` | `0.75rem` (12px) |
| `--font-weight-medium` | `500` |
| `--font-weight-regular` | `400` |
| `--letter-spacing-label` | `0.08em` (대문자 라벨용) |

> 와이어프레임의 8~12px는 모바일 실제 사용 시 가독성이 낮으므로 최소 12px 이상으로 끌어올린다 (wireframe §6 접근성 원칙과 일치).

---

## 5. 레이아웃 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `--radius-card` | `0.5rem` (8px) | 카드 |
| `--radius-button` | `0.5rem` (8px) | 버튼 |
| `--radius-pill` | `9999px` | 배지, 태그 pill |
| `--border-width-card` | `0.5px` | 카드 테두리 |
| `--space-touch-min` | `2.75rem` (44px) | 최소 터치 영역 |
| `--bottom-tab-height` | `3.5rem` (56px) | 하단 탭 바 |
| `--safe-area-bottom` | `env(safe-area-inset-bottom)` | iOS 노치 |

---

## 6. Tailwind v4 `@theme` 적용 예시

> 참고용 스니펫 (M3 T-02 적용 시점에 `app/globals.css`로 이식).

```css
@import "tailwindcss";

:root {
  color-scheme: light; /* 라이트모드 강제 — 시스템 다크모드 무시 */

  --color-brand: #1D9E75;
  --color-brand-light: #E1F5EE;
  --color-brand-medium: #5DCAA5;
  --color-early-voting-bg: #FAEEDA;
  --color-early-voting-fg: #633806;
  --color-ballot-green: #E1F5EE;
  --color-ballot-peach: #FAECE7;
  --color-ballot-blue: #E6F1FB;

  --color-text-primary: #0F172A;
  --color-text-secondary: #64748B;
  --color-background-primary: #FFFFFF;
  --color-background-secondary: #F8FAFC;
  --color-border-default: rgba(15, 23, 42, 0.08);
  --color-focus-ring: #1D9E75;

  --radius-card: 0.5rem;
  --radius-button: 0.5rem;
  --space-touch-min: 2.75rem;
}

@theme inline {
  --color-brand: var(--color-brand);
  --color-brand-light: var(--color-brand-light);
  --color-brand-medium: var(--color-brand-medium);
  --color-early-voting-bg: var(--color-early-voting-bg);
  --color-early-voting-fg: var(--color-early-voting-fg);
  --color-ballot-green: var(--color-ballot-green);
  --color-ballot-peach: var(--color-ballot-peach);
  --color-ballot-blue: var(--color-ballot-blue);

  --color-text-primary: var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  --color-background-primary: var(--color-background-primary);
  --color-background-secondary: var(--color-background-secondary);

  --radius-card: var(--radius-card);
  --radius-button: var(--radius-button);
}
```

위 적용 후 Tailwind 유틸리티 자동 생성: `bg-brand`, `bg-brand-light`, `bg-early-voting-bg`, `text-early-voting-fg`, `bg-ballot-green`, `rounded-card`, `rounded-button`, `text-text-primary` 등.

---

## 7. 사용 매트릭스 (화면 × 토큰)

| 화면 | 주요 사용 토큰 |
|---|---|
| S-01 메인 | `--color-brand` (D-day 배너 배경), `--color-brand-light` (사전투표 카드) |
| S-02 선거구 설정 | `--color-brand` (CTA 버튼), `--color-early-voting-*` (배지·안내) |
| S-03 투표소 안내 | `--color-brand` (활성 탭/마커), `--color-early-voting-*` (배지) |
| S-04 후보자 비교 | `--color-brand` (활성 탭/태그), `--color-background-secondary` (배경) |
| S-05 정당 비교 | `--color-brand` + 정당별 `Party.brandColor` (도메인 데이터) |
| S-06 모의투표 | `--color-ballot-*` (스텝별), `--color-brand` (현재), `--color-brand-medium` (완료) |

---

## 8. 보완 필요

- 모션 토큰 (전환 duration/easing) — 베타 단계에서 일관성 검수 시 추가
- 그림자 토큰 — 와이어프레임에 명시되지 않아 현재 단계에서 정의하지 않음 (필요 시 v0.2)
