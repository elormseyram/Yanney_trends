import { create } from "zustand";
import type { QuizAnswers } from "@/lib/stylist";

type Step = "intro" | "q1" | "q2" | "q3" | "q4" | "q5" | "loading" | "results";

interface StylistQuizState {
  step: Step;
  answers: Partial<QuizAnswers>;
  setStep: (s: Step) => void;
  patchAnswers: (p: Partial<QuizAnswers>) => void;
  reset: () => void;
}

const empty: Partial<QuizAnswers> = {
  occasion: null,
  mood: null,
  fit: null,
  colors: [],
  budget_max: 600,
};

export const useStylistQuizStore = create<StylistQuizState>((set) => ({
  step: "intro",
  answers: { ...empty },
  setStep: (step) => set({ step }),
  patchAnswers: (p) =>
    set((s) => ({ answers: { ...s.answers, ...p } })),
  reset: () => set({ step: "intro", answers: { ...empty } }),
}));
