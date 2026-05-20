// 공약 분야 분류기 — 외부 API가 분야 태그를 제공하지 않으므로 title+body 자연어로 분류 (api_contract §4.3, T-24)
// 키 발급 후 응답에 분야 필드가 있으면 이 분류기를 제거하고 해당 필드를 우선 사용한다.
import type { PledgeCategory } from '@/types/domain';

// 카테고리별 키워드 사전 — 매칭 개수가 가장 많은 카테고리로 분류
// PledgeCategory 선언 순서 = 동점 시 우선순위 (economy → housing → environment → education → welfare)
const CATEGORY_KEYWORDS: Record<PledgeCategory, string[]> = {
  economy: ['경제', '일자리', '고용', '산업', '세제', '세금', '기업', '투자', '창업', '소상공인', '자영업', '임금', '성장'],
  housing: ['주거', '주택', '부동산', '임대', '전세', '월세', '재건축', '재개발', '분양', '청년주택'],
  environment: ['환경', '기후', '탄소', '에너지', '미세먼지', '재생에너지', '녹지', '생태', '오염'],
  education: ['교육', '학교', '학생', '대학', '입시', '교사', '학원', '사교육', '교권'],
  welfare: ['복지', '보건', '의료', '돌봄', '연금', '노인', '장애인', '출산', '보육', '건강', '요양'],
};

const CATEGORIES = Object.keys(CATEGORY_KEYWORDS) as PledgeCategory[];

// 분류 불가 시 fallback — 가장 광범위한 economy
const FALLBACK: PledgeCategory = 'economy';

export function classifyPledge(text: string): PledgeCategory {
  let best: PledgeCategory = FALLBACK;
  let bestScore = 0;

  for (const category of CATEGORIES) {
    const score = CATEGORY_KEYWORDS[category].reduce(
      (acc, kw) => (text.includes(kw) ? acc + 1 : acc),
      0,
    );
    // 동점일 때는 먼저 평가된(우선순위 높은) 카테고리 유지 → '>' 사용
    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }

  return best;
}
