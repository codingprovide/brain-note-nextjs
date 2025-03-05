import { create } from "zustand";

export interface ToolBarState {
  activeTool: string;
  setActiveTool: (tool: string) => void;
}

export const useToolBarStore = create<ToolBarState>()((set) => ({
  activeTool: "Select",
  setActiveTool: (tool) => set(() => ({ activeTool: tool })),
}));
