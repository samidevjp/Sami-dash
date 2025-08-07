import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookingStore {
  booking: any | null;
  setBooking: (booking: any) => void;
  removeBooking: () => void;
}

// Create the store with persist middleware
export const useBooking = create<BookingStore>()(
  persist(
    (set) => ({
      booking: null,
      setBooking: (booking) => set({ booking }),
      removeBooking: () => set({ booking: null })
    }),
    {
      name: 'booking-storage'
    }
  )
);
