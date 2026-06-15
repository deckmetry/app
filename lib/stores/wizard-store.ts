// Deckmetry Wizard Store — Zustand v5

import { useMemo } from "react";
import { create } from "zustand";
import type { EstimateInput, WizardStep } from "@/lib/types";
import { initialFormState, getStepsForScope } from "@/lib/store";
import { calculateEstimate } from "@/lib/calculations";

interface WizardState {
  formData: EstimateInput;
  currentStep: WizardStep;
  source: string | null;
  editingEstimateId: string | null;

  updateFormData: (updates: Partial<EstimateInput>) => void;
  setFormData: (formData: EstimateInput) => void;
  setSource: (source: string | null) => void;
  setEditingEstimateId: (id: string | null) => void;
  goToStep: (step: WizardStep) => void;
  goNext: () => void;
  goPrevious: () => void;
  reset: () => void;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  formData: initialFormState,
  currentStep: "job-info",
  source: null,
  editingEstimateId: null,

  updateFormData: (updates) =>
    set((state) => ({
      formData: { ...state.formData, ...updates },
    })),

  setFormData: (formData) => set({ formData }),

  setSource: (source) => set({ source }),

  setEditingEstimateId: (id) => set({ editingEstimateId: id }),

  goToStep: (step) => set({ currentStep: step }),

  goNext: () => {
    const { currentStep, formData } = get();
    const steps = getStepsForScope(formData.scope);
    const i = steps.findIndex((s) => s.id === currentStep);
    if (i >= 0 && i < steps.length - 1) {
      set({ currentStep: steps[i + 1].id });
    }
  },

  goPrevious: () => {
    const { currentStep, formData } = get();
    const steps = getStepsForScope(formData.scope);
    const i = steps.findIndex((s) => s.id === currentStep);
    if (i > 0) {
      set({ currentStep: steps[i - 1].id });
    }
  },

  reset: () =>
    set({
      formData: initialFormState,
      currentStep: "job-info",
      source: null,
      editingEstimateId: null,
    }),
}));

/** Derives the full estimate from formData. Memoized to avoid recalculation. */
export function useEstimate() {
  const formData = useWizardStore((s) => s.formData);
  return useMemo(() => calculateEstimate(formData), [formData]);
}

/** Returns the numeric index of the current step within the scope's visible steps. */
export function useCurrentStepIndex() {
  const currentStep = useWizardStore((s) => s.currentStep);
  const scope = useWizardStore((s) => s.formData.scope);
  return getStepsForScope(scope).findIndex((s) => s.id === currentStep);
}
