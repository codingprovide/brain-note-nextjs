import { create } from "zustand";

export interface SideBarState {
  navMainButton: string;
  setNavMainButton: (item: string) => void;
}

export const useSideBarStore = create<SideBarState>()((set) => ({
  navMainButton: "",
  setNavMainButton: (item) => set(() => ({ navMainButton: item })),
}));
