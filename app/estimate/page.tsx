import { Suspense } from "react";
import { WizardShell } from "@/components/deck-estimator/wizard-shell";
import { Toaster } from "@/components/ui/sonner";
import { getEstimate } from "@/lib/actions/estimates";

export default async function EstimatePage({
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
