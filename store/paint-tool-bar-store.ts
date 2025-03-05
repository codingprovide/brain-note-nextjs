import { create } from "zustand";

export interface PaintToolBarState {
  paintTool: string;
  setPaintTool: (tool: string) => void;
}

export const usePaintToolBarStore = create<PaintToolBarState>()((set) => ({
  paintTool: "Pen",
  setPaintTool: (tool) => set(() => ({ paintTool: tool })),
}));
