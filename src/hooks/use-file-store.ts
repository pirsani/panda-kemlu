// useFileStore.ts
import { create } from "zustand";

interface FileStore {
  fileUrl: string | null;
  setFileUrl: (url: string | null) => void;
}

const useFileStore = create<FileStore>((set) => ({
  fileUrl: null,
  setFileUrl: (url) => set({ fileUrl: url }),
}));

export default useFileStore;
