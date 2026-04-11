import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Auto-create contractor-supplier link if user signed up via supplier ref
  const supplierRef = user.user_metadata?.supplier_ref;
  if (supplierRef && user.user_metadata?.role === "contractor") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("default_organization_id")
      .eq("id", user.id)
      .single();

    if (profile?.default_organization_id) {
      try {
        const { createServiceClient } = await import("@/lib/supabase/service");
        const service = createServiceClient();

        const { data: existingLink } = await service
          .from("contractor_supplier_links")
          .select("id")
          .eq("contractor_org_id", profile.default_organization_id)
          .single();

        if (!existingLink) {
          const { data: supplierOrg } = await service
            .from("organizations")
            .select("id")
            .eq("slug", supplierRef)
            .eq("type", "supplier")
            .single();

          if (supplierOrg) {
            await service.from("contractor_supplier_links").insert({
              contractor_org_id: profile.default_organization_id,
              supplier_org_id: supplierOrg.id,
              status: "active",
            });
          }
        }
      } catch {
        // Service role key may not be set — skip silently
      }
    }
  }

  return <>{children}</>;
}
