import { create } from "zustand";

export interface DropDownState {
    toolColor: string;
    setToolColor: (color: string) => void;
    stroke: number;
    setStroke: (width: number) => void;
}
  
export const useDropDownStore = create<DropDownState>()((set) => ({
    toolColor: "black",
    setToolColor: (color) => set(() => ({ toolColor: color })),
    stroke: 6,
    setStroke: (width) => set(() => ({ stroke: width })),
}));
  
