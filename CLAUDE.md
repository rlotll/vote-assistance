@AGENTS.md

## 기술 스택
- Framework: Next.js 16.2 (App Router)
- Language: TypeScript 5
- UI: React 19 + Tailwind CSS v4 + lucide-react
- 상태관리: Zustand (client) / TanStack Query (server)
- 배포: Vercel

## 외부 API
- 선거관리위원회 OpenAPI: http://data.nec.go.kr/
- 카카오맵 API: https://apis.map.kakao.com/
- 인증키 신청/문서/엔드포인트 참고

## 명령어
- 개발 서버: `npm run dev`
- 빌드: `npm run build`
- 린트: `npm run lint`

## 보안
- API 키는 반드시 `.env.local`에만 보관하고 사용할 것
- `.env.local`은 커밋 금지

### 참고 파일
- 요구사항정의서: @docs/requirements_doc.md
- 와이어프레임: @docs/wireframe_doc.md
- PRD: @docs/PRD.md
- 진행 로드맵: @docs/ROADMAP.md