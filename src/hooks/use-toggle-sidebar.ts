import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

// Define the state interface
interface ToggleSidebarState {
  collapse: boolean;
  toggle: () => void;
  setCollapse: (collapse: boolean) => void;
}

// Define the Zustand state creator function
const createState: StateCreator<ToggleSidebarState> = (set) => ({
  collapse: false,
  toggle: () => set((state) => ({ collapse: !state.collapse })),
  setCollapse: (collapse) => set({ collapse }),
});

// Configure persistence options
const persistOptions: PersistOptions<ToggleSidebarState> = {
  name: "toggle-sidebar-storage", // Name for the local storage key
  //getStorage: () => localStorage, // Use localStorage for persistence
};

// Create the Zustand store with persistence
export const useToggleSidebar = create(persist(createState, persistOptions));

export default useToggleSidebar;
