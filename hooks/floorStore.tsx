import { Floor, Table } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FloorStore {
  floor: Floor[] | null;
  setFloor: (floor: Floor[]) => void;
  removeFloor: () => void;
  table: Table[] | null;
  setTable: (table: Table[] | null) => void;
}

export const useFloor = create<FloorStore>()(
  persist(
    (set) => ({
      floor: null,
      setFloor: (floor) => set({ floor }),
      removeFloor: () => set({ floor: null }),
      table: null,
      setTable: (table) => set({ table })
    }),
    {
      name: 'floor-storage'
    }
  )
);
