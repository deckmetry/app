import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = (user.user_metadata?.role as string) ?? "homeowner";

  // Redirect to role-specific dashboard
  switch (role) {
    case "contractor":
      redirect("/contractor");
    case "supplier":
      redirect("/supplier");
    default:
      redirect("/homeowner");
  }
}
