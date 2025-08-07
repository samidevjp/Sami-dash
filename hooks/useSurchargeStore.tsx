// ✅ useSurchargeStore.tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import moment from 'moment';
import { daysOfWeek } from '@/utils/enum';
import { SurchargeItem } from '@/types';

interface SurchargeStore {
  filteredSurcharges: SurchargeItem[];
  setFilteredSurcharges: (data: SurchargeItem[]) => void;
  fetchSurcharges: (
    getPosOtherSurcharge: () => Promise<any[]>
  ) => Promise<void>;
}

export const useSurchargeStore = create<SurchargeStore>()(
  persist(
    (set) => {
      const setField =
        <K extends keyof SurchargeStore>(key: K) =>
        (value: SurchargeStore[K]) =>
          set({ [key]: value } as Pick<SurchargeStore, K>);

      return {
        filteredSurcharges: [],
        setFilteredSurcharges: setField('filteredSurcharges'),
        fetchSurcharges: async (getPosOtherSurcharge) => {
          const response = await getPosOtherSurcharge();

          if (!Array.isArray(response)) return;

          const dayNumber =
            daysOfWeek[moment().format('dddd') as keyof typeof daysOfWeek];

          const filtered = response.filter((item: any) => item.status === 1);

          set({ filteredSurcharges: filtered });
        }
      };
    },
    {
      name: 'surcharge-store'
    }
  )
);
