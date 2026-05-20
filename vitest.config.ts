import { defineConfig } from 'vitest/config';

// 단위테스트 전용 설정 — 순수 로직(lib, stores) 대상, node 환경
// @/ 별칭은 Vite 네이티브 tsconfigPaths로 해석 (tsconfig.json paths)
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['**/*.{test,spec}.ts'],
    exclude: ['node_modules', '.next', 'e2e/**'], // e2e는 Playwright 전용
  },
});
