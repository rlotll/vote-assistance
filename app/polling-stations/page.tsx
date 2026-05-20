import { Header } from '@/components/Header';
import { PollingStationsClient } from '@/components/polling-stations/PollingStationsClient';

export default function PollingStationsPage() {
  return (
    <>
      <Header title="주변 투표소" showBack />
      <div className="px-4 py-4">
        <PollingStationsClient />
      </div>
    </>
  );
}
