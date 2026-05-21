import { defineConfig } from 'vitest/config';

// 단위테스트 전용 설정 — 순수 로직(lib, stores) 대상, node 환경
// @/ 별칭은 Vite 네이티브 tsconfigPaths로 해석 (tsconfig.json paths)
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    // 기본은 node(순수 로직). 컴포넌트 테스트(.tsx)는 파일 상단 docblock으로 jsdom 환경을 개별 지정한다.
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e/**'], // e2e는 Playwright 전용
  },
});
