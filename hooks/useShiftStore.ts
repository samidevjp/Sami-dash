import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShiftStore {
  currentShiftId: number;
  setCurrentShiftId: (shiftId: number) => void;
  selectedShiftId: number;
  setSelectedShiftId: (shiftId: number) => void;
}

export const useShiftStore = create<ShiftStore>()(
  persist(
    (set) => ({
      currentShiftId: 0,
      setCurrentShiftId: (shiftId) => set({ currentShiftId: shiftId }),
      selectedShiftId: 0,
      setSelectedShiftId: (shiftId) => set({ selectedShiftId: shiftId })
    }),
    {
      name: 'shift-storage'
    }
  )
);
