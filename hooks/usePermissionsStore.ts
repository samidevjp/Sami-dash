import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PermissionsStore {
  permissions: any;
  setPermissions: (permissions: any) => void;
}

export const usePermissionsStore = create<PermissionsStore>()(
  persist(
    (set) => ({
      permissions: {},
      setPermissions: (permissions) => set({ permissions })
    }),
    {
      name: 'permissions-storage'
    }
  )
);
