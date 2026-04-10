import { WizardShell } from "@/components/deck-estimator/wizard-shell";
import { Toaster } from "@/components/ui/sonner";

export default function EstimatePage() {
  return (
    <>
      <WizardShell />
      <Toaster position="bottom-right" />
    </>
  );
}
