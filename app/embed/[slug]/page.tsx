import { Suspense } from "react";
import { notFound } from "next/navigation";
import { EmbedWizardShell } from "@/components/deck-estimator/embed-wizard-shell";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

function getServiceClient() {
  try {
    // Dynamic import to avoid build-time errors
    const { createServiceClient } = require("@/lib/supabase/service");
    return createServiceClient();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getServiceClient();
  if (!supabase) return { title: "Deck Estimator" };

  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("slug", slug)
    .eq("type", "supplier")
    .is("deleted_at", null)
    .single();

  return {
    title: org ? `Deck Estimator | ${org.name}` : "Deck Estimator",
  };
}

export default async function EmbedPage({ params }: Props) {
  const { slug } = await params;
  const supabase = getServiceClient();

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Configuration Required</p>
          <p className="text-sm text-muted-foreground">
            SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local to enable the embed.
          </p>
        </div>
      </div>
    );
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, logo_url, primary_color, embed_config")
    .eq("slug", slug)
    .eq("type", "supplier")
    .is("deleted_at", null)
    .single();

  if (!org) notFound();

  const embedConfig = (org.embed_config as { show_header?: boolean }) ?? {};

  return (
    <>
      <Suspense>
        <EmbedWizardShell
          supplierOrgId={org.id}
          supplierSlug={org.slug!}
          supplierName={org.name}
          logoUrl={org.logo_url}
          primaryColor={org.primary_color ?? "#2d7a6b"}
          showHeader={embedConfig.show_header !== false}
        />
      </Suspense>
      <Toaster position="bottom-right" />
    </>
  );
}
