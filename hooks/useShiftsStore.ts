import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShiftsStore {
  shifts: any[];
  setShifts: (shifts: any[]) => void;
}

export const useShiftsStore = create<ShiftsStore>()(
  persist(
    (set) => ({
      shifts: [],
      setShifts: (shifts) => set({ shifts })
    }),
    {
      name: 'shifts-storage'
    }
  )
);
