import { create } from "zustand";
import { Node } from "@xyflow/react";

type SetStateAction<T> = T | ((prev: T) => T);

export interface NodeStoreState {
  selectedNodeIds: Set<string>;
  selectedNodes: (Node | undefined)[];
  setSelectedNodes: (nodes: SetStateAction<(Node | undefined)[]>) => void;
  setSelectedNodeIds: (ids: SetStateAction<Set<string>>) => void;
  copyPressed: boolean;
  setCopyPressed: (copyPressed: SetStateAction<boolean>) => void;
  pastePressed: boolean;
  setPastePressed: (pastePressed: SetStateAction<boolean>) => void;
  progress: number;
  setProgress: (progress: SetStateAction<number>) => void;
  isRestoring: boolean;
  setIsRestoring: (isRestoring: boolean) => void;
}

export const useNodeStore = create<NodeStoreState>((set) => ({
  isRestoring: false,
  setIsRestoring: (isRestoring) => set({ isRestoring }),
  progress: 0,
  setProgress: (action) =>
    set((state) => ({
      progress: typeof action === "function" ? action(state.progress) : action,
    })),
  selectedNodeIds: new Set(),
  selectedNodes: [],
  setSelectedNodes: (action) =>
    set((state) => ({
      selectedNodes:
        typeof action === "function" ? action(state.selectedNodes) : action,
    })),
  setSelectedNodeIds: (action) =>
    set((state) => ({
      selectedNodeIds:
        typeof action === "function" ? action(state.selectedNodeIds) : action,
    })),
  copyPressed: false,
  setCopyPressed: (action) =>
    set((state) => ({
      copyPressed:
        typeof action === "function" ? action(state.copyPressed) : action,
    })),
  pastePressed: false,
  setPastePressed: (action) =>
    set((state) => ({
      pastePressed:
        typeof action === "function" ? action(state.pastePressed) : action,
    })),
}));
