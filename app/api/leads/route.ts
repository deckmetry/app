import { NextResponse } from "next/server";

// Best-effort lead capture for the public estimator. Kept dependency-free so the
// public site can go live without backend wiring; never blocks the user's flow.
// (Persisting to Supabase can be added later behind a try/catch.)
export async function POST(req: Request) {
  try {
    const lead = await req.json();
    // Lightweight server log so leads are visible in deployment logs immediately.
    console.log(
      `[lead] ${lead?.lead_id ?? "?"} | ${lead?.source ?? "?"} | ${lead?.full_name ?? ""} <${lead?.email ?? ""}> | ${lead?.city ?? ""} | range=${lead?.estimated_material_range ?? ""}`
    );
    return NextResponse.json({ ok: true, reference: lead?.lead_id ?? null });
  } catch {
    // Never fail the user's submission over lead logging.
    return NextResponse.json({ ok: true });
  }
}
