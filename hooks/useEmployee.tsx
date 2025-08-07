import { Employee } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EmployeeStore {
  currentEmployee: Employee | null;
  setCurrentEmployee: (employee: Employee) => void;
  clearCurrentEmployee: () => void;
  allEmployees: Employee[];
  setAllEmployees: (employees: Employee[]) => void;
}

export const useEmployee = create<EmployeeStore>()(
  persist(
    (set) => ({
      currentEmployee: null,
      setCurrentEmployee: (employee) => set({ currentEmployee: employee }),
      clearCurrentEmployee: () => set({ currentEmployee: null }),
      allEmployees: [],
      setAllEmployees: (employees) => set({ allEmployees: employees })
    }),
    {
      name: 'employee-storage',
      partialize: (state) => ({
        allEmployees: state.allEmployees,
        currentEmployee: state.currentEmployee
      })
    }
  )
);
