import { ShowroomEstimator } from "@/components/showroom/showroom-estimator";

// Public showroom estimator.
//   /estimate                -> public paid mode (detailed BOM locked behind $79)
//   /estimate?demo=wehrungs  -> Wehrung's showroom demo (BOM unlocked + badge)
export default async function EstimatePage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const { demo } = await searchParams;
  const mode = demo === "wehrungs" ? "demo" : "paid";
  return <ShowroomEstimator mode={mode} />;
}
