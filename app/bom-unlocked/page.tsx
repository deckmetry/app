import { redirect } from "next/navigation";

// Post-payment alias — forwards to the unlocked BOM success page.
export default function BomUnlockedPage() {
  redirect("/estimate/success");
}
