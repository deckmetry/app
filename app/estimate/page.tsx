import { Suspense } from "react";
import { WizardShell } from "@/components/deck-estimator/wizard-shell";
import { Toaster } from "@/components/ui/sonner";

// Public showroom estimator — the full guided wizard (Plan View + Project Summary).
//   /estimate                -> public homeowner mode (generic next-step actions)
//   /estimate?demo=wehrungs  -> Wehrung's showroom demo (badge shown)
// The Review step renders public next-step actions when on this route.
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
