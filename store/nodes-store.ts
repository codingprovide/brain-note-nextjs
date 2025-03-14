import { create } from "zustand";
import { Node } from "@xyflow/react";

type SetStateAction<T> = T | ((prev: T) => T);

export interface NodeStoreState {
  selectedNodeIds: Set<string>;
  selectedNodes: (Node | undefined)[];
  setSelectedNodes: (nodes: SetStateAction<(Node | undefined)[]>) => void;
  setSelectedNodeIds: (ids: SetStateAction<Set<string>>) => void;
}

export const useNodeStore = create<NodeStoreState>((set) => ({
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
}));
