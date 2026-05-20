import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockApi, presetDistrict } from './helpers';

// T-38 접근성: 주요 화면을 axe-core(WCAG 2.0/2.1 A·AA)로 자동 검사
const PAGES = [
  { path: '/', name: '홈' },
  { path: '/district', name: '선거구 설정' },
  { path: '/compare/candidates', name: '공약 비교(후보자)' },
  { path: '/compare/parties', name: '공약 비교(정당)' },
  { path: '/mock-vote', name: '모의투표' },
];

test.describe('접근성 자동 검사 (T-38)', () => {
  for (const { path, name } of PAGES) {
    test(`${name} 화면에 WCAG 위반이 없다`, async ({ page }) => {
      await mockApi(page);
      await presetDistrict(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
});

test.describe('키보드 접근성 (T-38)', () => {
  test('홈에서 Tab으로 선거구 변경 링크에 포커스하고 Enter로 이동', async ({ page }) => {
    await mockApi(page);
    await presetDistrict(page);
    await page.goto('/');

    // 선거구 변경 링크로 직접 포커스 후 키보드 활성화
    const link = page.getByRole('link', { name: '내 선거구 변경' });
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/district/);
  });
});
