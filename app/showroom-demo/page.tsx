import { redirect } from "next/navigation";

// Convenience entry point for the presentation — opens the estimator in
// Wehrung's showroom demo mode (detailed BOM unlocked, demo badge shown).
export default function ShowroomDemoPage() {
  redirect("/estimate?demo=wehrungs");
}
