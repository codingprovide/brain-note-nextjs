// src/providers/editor-store-provider.tsx
"use client";
import React, { createContext, ReactNode, useContext, useRef } from "react";
import { useStore } from "zustand";
import { createEditorStore, EditorStore } from "../store/editor-store";

export type EditorStoreApi = ReturnType<typeof createEditorStore>;

const EditorStoreContext = createContext<EditorStoreApi | undefined>(undefined);

export const EditorStoreProvider = ({ children }: { children: ReactNode }) => {
  const storeRef = useRef<EditorStoreApi | undefined>(undefined);
  if (!storeRef.current) {
    storeRef.current = createEditorStore();
  }
  return (
    <EditorStoreContext.Provider value={storeRef.current}>
      {children}
    </EditorStoreContext.Provider>
  );
};

export const useEditorStore = <T,>(selector: (state: EditorStore) => T): T => {
  const store = useContext(EditorStoreContext);
  if (!store) {
    throw new Error("useEditorStore 必须在 EditorStoreProvider 中使用");
  }
  return useStore(store, selector);
};
