import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { District, PledgeCategory } from '@/types/domain';

export interface UserPreference {
  district: District | null;
  residenceDiffersFromRegistration: boolean;
  selectedCategories: PledgeCategory[];
}

interface UserStore extends UserPreference {
  setDistrict: (district: District) => void;
  setResidenceDifferent: (value: boolean) => void;
  toggleCategory: (category: PledgeCategory) => void;
  reset: () => void;
}

const initialState: UserPreference = {
  district: null,
  residenceDiffersFromRegistration: false,
  selectedCategories: [],
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setDistrict: (district) => set({ district }),
      setResidenceDifferent: (value) => set({ residenceDiffersFromRegistration: value }),
      toggleCategory: (category) => {
        const current = get().selectedCategories;
        const next = current.includes(category)
          ? current.filter((c) => c !== category)
          : [...current, category];
        set({ selectedCategories: next });
      },
      reset: () => set(initialState),
    }),
    {
      name: 'vote-assistant:user:v1',
      // SSR에서 localStorage 접근 방지 — 클라이언트 마운트 후 rehydrate()로 복원
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
