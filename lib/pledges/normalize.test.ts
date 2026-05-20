import { describe, it, expect } from 'vitest';
import { normalizeCandidatePledge, normalizeCandidatePledges, type RawPledgeItem } from './normalize';

const raw = (over: Partial<RawPledgeItem> = {}): RawPledgeItem => ({
  prmsId: 'PL1',
  prmsTitle: '청년 일자리 확대',
  prmsCn: '창업 지원과 고용 확대',
  prmsUrl: 'https://example.com/pledge.pdf',
  ...over,
});

describe('normalizeCandidatePledge', () => {
  it('필드를 Pledge로 매핑하고 본문 기반으로 분야 분류', () => {
    expect(normalizeCandidatePledge(raw(), 'H1', 0)).toEqual({
      id: 'PL1',
      ownerType: 'candidate',
      ownerId: 'H1',
      category: 'economy',
      title: '청년 일자리 확대',
      body: '창업 지원과 고용 확대',
      sourceUrl: 'https://example.com/pledge.pdf',
    });
  });

  it('prmsId가 없으면 huboid+index로 id 생성', () => {
    const { prmsId, ...noId } = raw();
    void prmsId;
    expect(normalizeCandidatePledge(noId, 'H9', 3).id).toBe('H9-3');
  });

  it('prmsUrl이 없으면 sourceUrl은 undefined', () => {
    const { prmsUrl, ...noUrl } = raw();
    void prmsUrl;
    expect(normalizeCandidatePledge(noUrl, 'H1', 0).sourceUrl).toBeUndefined();
  });

  it('분야명(prmsRealmName)도 분류에 반영', () => {
    const p = normalizeCandidatePledge(
      raw({ prmsTitle: '미래 비전', prmsCn: '지역 발전', prmsRealmName: '환경' }),
      'H1',
      0,
    );
    expect(p.category).toBe('environment');
  });
});

describe('normalizeCandidatePledges', () => {
  it('응답 순서를 유지하며 모두 정규화', () => {
    const result = normalizeCandidatePledges(
      [raw({ prmsId: 'A' }), raw({ prmsId: 'B' })],
      'H1',
    );
    expect(result.map((p) => p.id)).toEqual(['A', 'B']);
    expect(result.every((p) => p.ownerId === 'H1')).toBe(true);
  });
});
