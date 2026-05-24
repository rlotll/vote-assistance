import { test, expect } from '@playwright/test';
import { mockApi, presetDistrict } from './helpers';

test.describe('공약 비교 (S-04/S-05)', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await presetDistrict(page);
  });

  test('후보자 탭에 후보 카드와 공약이 표시된다', async ({ page }) => {
    await page.goto('/compare/candidates');

    await expect(page.getByText('김후보')).toBeVisible();
    await expect(page.getByText('이후보')).toBeVisible();
    // 동일 fixture 공약이 후보마다 렌더되므로 첫 항목으로 존재만 확인
    await expect(page.getByText('청년 일자리 확대').first()).toBeVisible();
  });

  test('선거 종류 선택 UI로 종류를 바꿀 수 있다', async ({ page }) => {
    await page.goto('/compare/candidates');
    const group = page.getByRole('group', { name: '선거 종류 선택' });
    await expect(group).toBeVisible();
    // 여러 지역구 종류 중 하나 클릭해도 동작(빈 화면/에러 없이 후보 표시)
    await group.getByRole('button', { name: '구·시·군장' }).click();
    await expect(page.getByText('김후보')).toBeVisible();
  });

  test('정당(비례) 탭으로 전환하면 정당 정책이 보인다', async ({ page }) => {
    await page.goto('/compare/candidates');
    await page.getByRole('tab', { name: '정당(비례)' }).click();

    await expect(page).toHaveURL(/\/compare\/parties/);
    await expect(page.getByText('가나다당')).toBeVisible();
    await expect(page.getByText('복지 확대')).toBeVisible();
  });
});
