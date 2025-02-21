// src/stores/editor-store.ts
import { createStore } from "zustand/vanilla";

interface CreateEditorStoreType {
  fontSize: string;
  isEditable: boolean;
  setFontSize: (size: string) => void;
  setIsEditable: (boolean: boolean) => void;
}

export const createEditorStore = createStore<CreateEditorStoreType>()(
  (set) => ({
    fontSize: "16",
    isEditable: false,
    setFontSize: (size) => set(() => ({ fontSize: size })),
    setIsEditable: (boolean) => set(() => ({ isEditable: boolean })),
  })
);
