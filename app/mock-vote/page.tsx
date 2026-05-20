import { Header } from '@/components/Header';
import { MockVoteClient } from '@/components/mock-vote/MockVoteClient';

// S-06: 모의투표
export default function MockVotePage() {
  return (
    <>
      <Header title="모의투표" showBack />
      <div className="px-4 py-4">
        <MockVoteClient />
      </div>
    </>
  );
}
