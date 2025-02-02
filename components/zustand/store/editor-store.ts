// src/stores/editor-store.ts
import { createStore } from "zustand/vanilla";

export type EditorState = {
  fontSize: string;
};

export type EditorActions = {
  setFontSize: (size: string) => void;
};

export type EditorStore = EditorState & EditorActions;

export const defaultEditorState: EditorState = {
  fontSize: "16", // 默认字体大小（这里只存数值，不含单位）
};

export const createEditorStore = (
  initState: EditorState = defaultEditorState
) =>
  createStore<EditorStore>()((set) => ({
    ...initState,
    setFontSize: (size: string) => set({ fontSize: size }),
  }));
