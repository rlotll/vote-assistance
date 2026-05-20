import { test, expect } from '@playwright/test';
import { mockApi, presetDistrict } from './helpers';

test.describe('홈 (S-01)', () => {
  test('D-day 배너와 선거구 미설정 안내가 보인다', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');

    await expect(page.getByRole('heading', { name: '제9회 전국동시지방선거' })).toBeVisible();
    await expect(page.getByText('선거구를 설정해주세요')).toBeVisible();
  });

  test('선거구 설정 시 홈에 현재 선거구와 변경 진입점이 보인다', async ({ page }) => {
    await mockApi(page);
    await presetDistrict(page);
    await page.goto('/');

    await expect(page.getByRole('link', { name: '내 선거구 변경' })).toBeVisible();
    await expect(page.getByText('서울특별시 종로구')).toBeVisible();
  });

  test('선거구 변경 링크는 /district로 이동한다', async ({ page }) => {
    await mockApi(page);
    await presetDistrict(page);
    await page.goto('/');
    await page.getByRole('link', { name: '내 선거구 변경' }).click();
    await expect(page).toHaveURL(/\/district/);
  });
});
