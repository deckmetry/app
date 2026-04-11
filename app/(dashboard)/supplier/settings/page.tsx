import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { EmbedSettings } from "@/components/supplier/embed-settings";

export default async function SupplierSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  const orgId = profile?.default_organization_id;
  if (!orgId) redirect("/dashboard");

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, logo_url, primary_color, embed_config")
    .eq("id", orgId)
    .single();

  if (!org) redirect("/supplier");

  const embedConfig = (org.embed_config as { show_header?: boolean }) ?? {};

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Configure your embedded deck estimator and branding"
      />
      <EmbedSettings
        orgId={org.id}
        orgName={org.name}
        slug={org.slug || ""}
        logoUrl={org.logo_url || ""}
        primaryColor={org.primary_color || "#2d7a6b"}
        showHeader={embedConfig.show_header !== false}
      />
    </div>
  );
}
