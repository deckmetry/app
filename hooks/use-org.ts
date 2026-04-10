"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Get the current user's default organization ID on the client side.
 */
export function useOrganizationId(): string | null {
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("default_organization_id")
        .eq("id", user.id)
        .single();

      setOrgId(profile?.default_organization_id ?? null);
    }
    load();
  }, []);

  return orgId;
}
