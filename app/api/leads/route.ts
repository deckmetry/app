import { NextResponse } from "next/server";
import { sendLeadEmail } from "@/lib/inquiry-email";

// Lead capture for the public estimator. Sends a notification email to the
// inquiry inbox; email failures never block the user's submission.
export async function POST(req: Request) {
  try {
    const lead = await req.json();
    console.log(
      `[lead] ${lead?.lead_id ?? "?"} | ${lead?.source ?? "?"} | ${lead?.full_name ?? ""} <${lead?.email ?? ""}> | ${lead?.city ?? ""} | range=${lead?.estimated_material_range ?? ""}`
    );
    // Awaited so the serverless function doesn't terminate before the email sends;
    // sendLeadEmail swallows its own errors.
    await sendLeadEmail(lead);
    return NextResponse.json({ ok: true, reference: lead?.lead_id ?? null });
  } catch {
    // Never fail the user's submission over notification/logging.
    return NextResponse.json({ ok: true });
  }
}
