import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookingVisibilityStore {
  isVisible: boolean;
  toggle: () => void;
}

export const useBookingVisibility = create<BookingVisibilityStore>()(
  persist(
    (set) => ({
      isVisible: true,
      toggle: () => set((state) => ({ isVisible: !state.isVisible }))
    }),
    {
      name: 'booking-visibility-storage'
    }
  )
);
