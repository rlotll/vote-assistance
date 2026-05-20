import { test, expect } from '@playwright/test';
import { mockApi, presetDistrict } from './helpers';

// NF-03 / T-40: 개인정보(선거구·모의투표 선택)는 기기 내 저장만, 서버 전송 금지
function trackWrites(page: import('@playwright/test').Page): string[] {
  const writes: string[] = [];
  page.on('request', (req) => {
    const m = req.method();
    if (m === 'POST' || m === 'PUT' || m === 'PATCH') writes.push(`${m} ${req.url()}`);
  });
  return writes;
}

test.describe('개인정보 비전송 (NF-03)', () => {
  test('모의투표 선택은 서버로 전송(POST/PUT/PATCH)되지 않는다', async ({ page }) => {
    await mockApi(page);
    await presetDistrict(page);
    const writes = trackWrites(page);

    await page.goto('/mock-vote');
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: /다음 투표용지|결과 보기/ }).click();

    expect(writes).toEqual([]);
  });

  test('선거구 설정은 localStorage에만 저장되고 전송되지 않는다', async ({ page }) => {
    await mockApi(page);
    const writes = trackWrites(page);

    await page.goto('/district');
    await page.getByLabel('시/도 선택').selectOption({ label: '서울특별시' });
    await page.getByLabel('시/군/구 선택').selectOption({ label: '종로구' });
    await page.getByRole('button', { name: '설정 완료 · 투표소 찾기' }).click();
    await expect(page).toHaveURL(/\/polling-stations/);

    expect(writes).toEqual([]);
    const stored = await page.evaluate(() => localStorage.getItem('vote-assistant:user:v1'));
    expect(stored).toContain('종로구');
  });
});
