import { create } from "zustand";

interface Document {
  id: string;
  title?: string;
  authors?: string;
  abstract?: string;
  pdfUrl: string;
  userId: string;
  fileName: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDataState {
  documents: Document[] | null;
  setDocuments: (data: Document[]) => void;
  error: string;
  loading: boolean;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useDocumentDataStore = create<DocumentDataState>()((set) => ({
  documents: [],
  error: "",
  loading: false,
  setDocuments: (data: Document[]) => set(() => ({ documents: data })),
  setError: (error: string) => set(() => ({ error: error })),
  setLoading: (loading: boolean) => set(() => ({ loading: loading })),
}));
