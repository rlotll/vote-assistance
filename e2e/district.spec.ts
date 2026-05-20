import { test, expect } from '@playwright/test';
import { mockApi } from './helpers';

test.describe('선거구 가드 + 설정 (S-02)', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  test('선거구 미설정 시 보호 경로 진입하면 /district로 리다이렉트', async ({ page }) => {
    await page.goto('/compare/candidates');
    await expect(page).toHaveURL(/\/district$/);
  });

  test('시/도·시/군구 선택 후 설정 완료하면 투표소로 이동', async ({ page }) => {
    await page.goto('/district');

    await page.getByLabel('시/도 선택').selectOption({ label: '서울특별시' });
    await page.getByLabel('시/군/구 선택').selectOption({ label: '종로구' });
    await page.getByRole('button', { name: '설정 완료 · 투표소 찾기' }).click();

    await expect(page).toHaveURL(/\/polling-stations/);
    await expect(page.getByText('서울특별시 종로구')).toBeVisible();
  });

  test('거주지 불일치 체크 시 사전투표 안내가 노출된다', async ({ page }) => {
    await page.goto('/district');
    await page.getByRole('checkbox', { name: /현재 거주지가 주민등록 주소와 달라요/ }).check();
    await expect(page.getByText(/전국 어디서나 사전투표소/)).toBeVisible();
  });
});
