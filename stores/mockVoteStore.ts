// 모의투표 임시 상태 — persist 금지 (F-18, NF-03)
// 페이지 새로고침 시 자동 초기화가 의도된 동작임
import { create } from 'zustand';
import type { CandidatePosition } from '@/types/domain';

export interface MockVoteSelection {
  step: number;              // 1-based 스텝 번호
  position?: CandidatePosition; // candidate 스텝에만 존재 (party 스텝은 없음)
  candidateId?: string;
  partyId?: string;          // 비례 선거 시
}

interface MockVoteStore {
  selections: MockVoteSelection[];
  setSelection: (selection: MockVoteSelection) => void;
  reset: () => void;         // F-19 "다시 해보기"
}

export const useMockVoteStore = create<MockVoteStore>()((set) => ({
  selections: [],
  setSelection: (selection) =>
    set((state) => ({
      selections: [
        ...state.selections.filter((s) => s.step !== selection.step),
        selection,
      ],
    })),
  reset: () => set({ selections: [] }),
}));
