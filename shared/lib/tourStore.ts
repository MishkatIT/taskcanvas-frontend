import { create } from "zustand";

interface TourState {
  isActive: boolean;
  currentStep: number;
  hasCompletedBefore: boolean;
  startTour: (initialStep?: number) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  initialize: () => void;
}

export const useTourStore = create<TourState>((set, get) => ({
  isActive: false,
  currentStep: 0,
  hasCompletedBefore: false,

  initialize: () => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("taskcanvas_tour_completed") === "true";
      set({ hasCompletedBefore: completed });
    }
  },

  startTour: (initialStep = 0) => {
    set({ isActive: true, currentStep: initialStep });
  },

  endTour: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("taskcanvas_tour_completed", "true");
    }
    set({ isActive: false, currentStep: 0, hasCompletedBefore: true });
  },

  nextStep: () => {
    set((state) => ({ currentStep: state.currentStep + 1 }));
  },

  prevStep: () => {
    set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) }));
  },

  setStep: (step: number) => {
    set({ currentStep: step });
  },
}));
