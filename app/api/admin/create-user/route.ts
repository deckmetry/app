import { NextRequest, NextResponse } from "next/server";

// Temporary admin endpoint — secured by a static secret
const ADMIN_SECRET = process.env.ADMIN_CREATE_SECRET ?? "deckmetry-admin-2026";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, password, fullName, role } = await req.json();
  if (!email || !password || !role) {
    return NextResponse.json({ error: "email, password, role required" }, { status: 400 });
  }

  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();

  // Step 1: Try to create the auth user
  const { data: userData, error: authError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, full_name: fullName ?? "" },
  });

  let userId: string;

  if (authError) {
    // If trigger failed ("Database error"), the auth user wasn't created.
    // This means we need to handle it differently.
    return NextResponse.json({
      error: authError.message,
      hint: "Go to Supabase Dashboard > SQL Editor and run the SQL provided."
    }, { status: 500 });
  } else {
    userId = userData.user.id;
  }

  // Step 2: Check if the trigger created the profile (it should have)
  const { data: profile } = await service
    .from("profiles")
    .select("id, default_organization_id")
    .eq("id", userId)
    .single();

  if (!profile?.default_organization_id) {
    // Trigger didn't run — manually create profile + org
    const orgName = `${fullName ?? email}'s Organization`;

    const { data: org, error: orgErr } = await service
      .from("organizations")
      .insert({ name: orgName, type: role })
      .select("id")
      .single();

    if (orgErr || !org) {
      return NextResponse.json({ error: "Failed to create org: " + orgErr?.message }, { status: 500 });
    }

    // Upsert profile
    await service.from("profiles").upsert({
      id: userId,
      full_name: fullName ?? "",
      default_organization_id: org.id,
    });

    // Create org membership
    await service.from("organization_members").insert({
      organization_id: org.id,
      user_id: userId,
      role: "owner",
    });
  }

  return NextResponse.json({ success: true, userId });
}
