import { test, expect } from '@playwright/test';
import { mockApi, presetDistrict } from './helpers';

test.describe('모의투표 (S-06)', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await presetDistrict(page);
  });

  test('대통령선거가 아니라 지방선거 종류로 스텝이 시작된다', async ({ page }) => {
    await page.goto('/mock-vote');
    // 와이어프레임 순서상 1스텝은 교육감 (active가 type=0이어도 대통령선거로 나오지 않아야 함)
    await expect(page.getByText(/1 \/ \d/)).toBeVisible();
    await expect(page.getByText('교육감 선거')).toBeVisible();
    await expect(page.getByText('대통령 선거')).toHaveCount(0);
  });

  test('모든 스텝을 진행하면 결과 화면이 나온다', async ({ page }) => {
    await page.goto('/mock-vote');
    await expect(page.getByText(/1 \/ \d/)).toBeVisible();

    // 각 스텝에서 첫 항목 선택 후 다음으로, 마지막엔 결과 보기
    for (let i = 0; i < 10; i++) {
      await page.getByRole('radio').first().click();
      const proceed = page.getByRole('button', { name: /다음 투표용지|결과 보기/ });
      const label = (await proceed.textContent()) ?? '';
      await proceed.click();
      if (label.includes('결과')) break;
    }

    await expect(page.getByText('모의투표 완료!')).toBeVisible();
    await expect(page.getByRole('button', { name: '다시 해보기' })).toBeVisible();
  });
});
