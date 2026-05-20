import { Header } from '@/components/Header';
import { CompareTabs } from '@/components/compare/CompareTabs';
import { CandidateCompareClient } from '@/components/compare/CandidateCompareClient';

// S-04: 공약 비교 — 후보자 탭
export default function CompareCandidatesPage() {
  return (
    <>
      <Header title="공약 비교" showBack />
      <CompareTabs />
      <div className="px-4 py-4">
        <CandidateCompareClient />
      </div>
    </>
  );
}
