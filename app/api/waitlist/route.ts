import { NextResponse } from "next/server";
import { sendWaitlistEmail } from "@/lib/inquiry-email";

// Waitlist capture for contractor/supplier "coming soon" pages. Sends a
// notification email; failures never block the user's submission.
export async function POST(req: Request) {
  try {
    const entry = await req.json();
    console.log(
      `[waitlist] ${entry?.type ?? "?"} | ${entry?.name ?? ""} @ ${entry?.company_name ?? ""} <${entry?.email ?? ""}> | ${entry?.phone ?? ""}`
    );
    await sendWaitlistEmail(entry);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
