import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  isCollapsed: boolean;
  showCompleteProfileDialog: boolean;
  toggleSidebar: () => void;
  toggleCollapse: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
  setShowCompleteProfileDialog: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  isCollapsed: false,
  showCompleteProfileDialog: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
  setShowCompleteProfileDialog: (show) => set({ showCompleteProfileDialog: show }),
}));
