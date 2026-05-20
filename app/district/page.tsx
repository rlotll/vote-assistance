import { Header } from '@/components/Header';
import { DistrictForm } from '@/components/district/DistrictForm';

export default function DistrictPage() {
  return (
    <>
      <Header title="내 선거구 설정" showBack />
      <div className="px-4 py-4">
        <DistrictForm />
      </div>
    </>
  );
}
