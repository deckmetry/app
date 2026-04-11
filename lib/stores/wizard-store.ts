// Deckmetry Wizard Store — Zustand v5

import { useMemo } from "react";
import { create } from "zustand";
import type { EstimateInput, WizardStep } from "@/lib/types";
import { initialFormState, WIZARD_STEPS, getStepIndex } from "@/lib/store";
import { calculateEstimate } from "@/lib/calculations";

interface WizardState {
  formData: EstimateInput;
  currentStep: WizardStep;
  source: string | null;

  updateFormData: (updates: Partial<EstimateInput>) => void;
  setFormData: (formData: EstimateInput) => void;
  setSource: (source: string | null) => void;
  goToStep: (step: WizardStep) => void;
  goNext: () => void;
  goPrevious: () => void;
  reset: () => void;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  formData: initialFormState,
  currentStep: "job-info",
  source: null,

  updateFormData: (updates) =>
    set((state) => ({
      formData: { ...state.formData, ...updates },
    })),

  setFormData: (formData) => set({ formData }),

  setSource: (source) => set({ source }),

  goToStep: (step) => set({ currentStep: step }),

  goNext: () => {
    const { currentStep } = get();
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex < WIZARD_STEPS.length - 1) {
      set({ currentStep: WIZARD_STEPS[currentIndex + 1].id });
    }
  },

  goPrevious: () => {
    const { currentStep } = get();
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex > 0) {
      set({ currentStep: WIZARD_STEPS[currentIndex - 1].id });
    }
  },

  reset: () =>
    set({
      formData: initialFormState,
      currentStep: "job-info",
      source: null,
    }),
}));

/** Derives the full estimate from formData. Memoized to avoid recalculation. */
export function useEstimate() {
  const formData = useWizardStore((s) => s.formData);
  return useMemo(() => calculateEstimate(formData), [formData]);
}

/** Returns the numeric index of the current step. */
export function useCurrentStepIndex() {
  const currentStep = useWizardStore((s) => s.currentStep);
  return getStepIndex(currentStep);
}
