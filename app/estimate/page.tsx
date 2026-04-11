import { Suspense } from "react";
import { WizardShell } from "@/components/deck-estimator/wizard-shell";
import { Toaster } from "@/components/ui/sonner";

export default function EstimatePage() {
  return (
    <>
      <Suspense>
        <WizardShell />
      </Suspense>
      <Toaster position="bottom-right" />
    </>
  );
}
