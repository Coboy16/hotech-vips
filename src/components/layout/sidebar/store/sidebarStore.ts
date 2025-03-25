import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SidebarState {
  isExpanded: boolean;
  toggleExpanded: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isExpanded: true,
      toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
    }),
    {
      name: 'sidebar-storage',
    }
  )
);