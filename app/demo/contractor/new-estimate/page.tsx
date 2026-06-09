import { redirect } from "next/navigation";

// The contractor's "New Estimate" flow uses the real Deckmetry deck estimator.
// Any link to this path forwards to the live wizard at /estimate.
export default function NewEstimateRedirect() {
  redirect("/estimate?demo=contractor");
}
