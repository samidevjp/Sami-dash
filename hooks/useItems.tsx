import { Item } from '@/types';
import { create } from 'zustand';

interface ItemsStore {
  items: Item[];
  addItem: (item: Item, isAddon?: boolean) => void;
  removeItem: (index: number) => void;
  removeAllItems: () => void;
  addAddOnToItem: (itemId: string, addOn: any) => void; // New function
  removeAddOnFromItem: (itemId: string, addOnId: string) => void; // New function
}

export const useItems = create<ItemsStore>((set) => ({
  items: [],
  addItem: (productItem, isAddon = false) =>
    set((state) => {
      const existingProduct = state.items.find(
        (item) =>
          item.currentTimestamp === productItem.currentTimestamp &&
          item.id === productItem.id
      );

      if (existingProduct) {
        return {
          items: state.items.map((item) =>
            item.currentTimestamp === productItem.currentTimestamp &&
            item.id === productItem.id
              ? {
                  ...item,
                  quantity: isAddon ? productItem.quantity : item.quantity + 1,
                  addOns:
                    productItem.addOns !== undefined &&
                    productItem?.addOns.length > 0
                      ? productItem.addOns
                      : item.addOns,
                  note: productItem.note
                }
              : item
          )
        };
      } else {
        return {
          items: [...state.items, productItem]
        };
      }
    }),
  removeItem: (index) =>
    set((state) => ({ items: state.items.filter((_, i) => i !== index) })),
  removeAllItems: () => set({ items: [] }),
  addAddOnToItem: (itemId, addOn) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              addOns: item.addOns
                ? item.addOns.some(
                    (existingAddOn) => existingAddOn.id === addOn.id
                  )
                  ? item.addOns.map((existingAddOn) =>
                      existingAddOn.id === addOn.id
                        ? {
                            ...existingAddOn,
                            quantity: existingAddOn.quantity + 1
                          }
                        : existingAddOn
                    )
                  : [...item.addOns, { ...addOn, quantity: 1 }]
                : [{ ...addOn, quantity: 1 }]
            }
          : item
      )
    })),
  removeAddOnFromItem: (itemId, addOnId) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              addOns: item.addOns?.filter((addOn) => addOn.id !== addOnId)
            }
          : item
      )
    }))
}));
