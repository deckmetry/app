import { Suspense } from "react";
import { WizardShell } from "@/components/deck-estimator/wizard-shell";
import { Toaster } from "@/components/ui/sonner";
import { getEstimate } from "@/lib/actions/estimates";

// The detailed contractor/engineering estimator (formerly at /estimate).
// Relocated to /estimate/pro so /estimate can host the public showroom estimator.
export default async function ProEstimatePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const existingEstimate = edit ? await getEstimate(edit) : null;

  return (
    <>
      <Suspense>
        <WizardShell initialEstimate={existingEstimate} />
      </Suspense>
      <Toaster position="bottom-right" />
    </>
  );
}
