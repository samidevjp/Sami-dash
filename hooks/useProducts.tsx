import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProductsStore {
  products: any[] | null;
  setProducts: (products: any[]) => void;
  removeProducts: () => void;
}

export const useProducts = create<ProductsStore>()(
  persist(
    (set) => ({
      products: null,
      setProducts: (products) => set({ products }),
      removeProducts: () => set({ products: null })
    }),
    {
      name: 'products-storage'
    }
  )
);
