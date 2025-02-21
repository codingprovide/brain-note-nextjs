import { create } from "zustand";

interface CreateHtmlStoreType {
  htmlSnapshot: string;
  setHtmlSnapshot: (html: string) => void;
}

export const createHtmlStore = create<CreateHtmlStoreType>()((set) => ({
  htmlSnapshot: "",
  setHtmlSnapshot: (html) => set(() => ({ htmlSnapshot: html })),
}));
