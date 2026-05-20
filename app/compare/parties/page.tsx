import { Header } from '@/components/Header';
import { CompareTabs } from '@/components/compare/CompareTabs';
import { PartyCompareClient } from '@/components/compare/PartyCompareClient';

// S-05: 공약 비교 — 정당(비례) 탭
export default function ComparePartiesPage() {
  return (
    <>
      <Header title="공약 비교" showBack />
      <CompareTabs />
      <div className="px-4 py-4">
        <PartyCompareClient />
      </div>
    </>
  );
}
