import "server-only";
import { getResend } from "@/lib/resend";

// Server-only inquiry notifications. Never throws — email failures must not block
// the user's submission. Keys read from server env (never NEXT_PUBLIC_).
const TO = process.env.INQUIRY_NOTIFICATION_EMAIL || "deckmetry@gmail.com";
// deckmetry.com is a verified Resend sending domain, so we send from it by default.
const FROM = process.env.FROM_EMAIL || "Deckmetry <notifications@deckmetry.com>";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function send(subject: string, text: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("[inquiry-email] RESEND_API_KEY not set — skipping email notification");
      return;
    }
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      subject,
      text,
      html: `<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px;line-height:1.5;white-space:pre-wrap;color:#0f172a">${escapeHtml(text)}</pre>`,
    });
    if (error) console.error("[inquiry-email] Resend error:", error);
  } catch (err) {
    console.error("[inquiry-email] send failed:", err);
  }
}

const yn = (v: unknown) => (v ? "Yes" : "No");

// ── Homeowner / showroom estimator lead ──────────────────────────────────────
export async function sendLeadEmail(lead: Record<string, unknown>) {
  const type =
    lead?.source === "Wehrung's Showroom Demo" ? "Wehrung's Showroom Demo" : "Homeowner Estimate";
  const subject = `New Deckmetry Inquiry — ${type}`;
  const addOns = Array.isArray(lead?.add_ons)
    ? (lead.add_ons as string[]).join(", ") || "None"
    : (lead?.add_ons as string) || "None";

  const text = [
    "New Deckmetry Inquiry",
    "",
    `Inquiry Type: ${type}`,
    `Source: ${lead?.source ?? ""}`,
    `Created: ${lead?.created_date ?? ""}`,
    `Reference: ${lead?.lead_id ?? ""}`,
    "",
    "Contact:",
    `Name: ${lead?.full_name ?? ""}`,
    `Email: ${lead?.email ?? ""}`,
    `Phone: ${lead?.phone ?? ""}`,
    `City: ${lead?.city ?? ""}`,
    `Address: ${lead?.address_optional || "—"}`,
    `Timeline: ${lead?.timeline || "—"}`,
    `User Type: ${lead?.user_type ?? ""}`,
    `Needs Contractor Installation: ${lead?.needs_installation ?? ""}`,
    "",
    "Project:",
    `Project Type: ${lead?.project_type ?? ""}`,
    `Deck Size: ${lead?.deck_size ?? ""}`,
    `Deck Height: ${lead?.deck_height ?? ""}`,
    `Decking: ${[lead?.decking_brand, lead?.decking_line].filter(Boolean).join(" ")}${lead?.decking_color ? ` - ${lead.decking_color}` : ""}`,
    `Railing: ${lead?.railing_type ?? ""}`,
    `Stairs: ${lead?.stairs ?? ""}`,
    `Add-ons: ${addOns}`,
    `Estimated Material Range: ${lead?.estimated_material_range ?? ""}`,
    `BOM Status: ${lead?.bom_status ?? ""}`,
    "",
    "Requested Next Steps:",
    `Pro Contact: ${yn(lead?.wants_pro_contact)}`,
    `Permit-Ready Drawings: ${yn(lead?.wants_permit_ready_drawings)}`,
    `3D Renderings: ${yn(lead?.wants_3d_renderings)}`,
    "",
    "Notes:",
    `${(lead?.notes as string) || "—"}`,
  ].join("\n");

  await send(subject, text);
}

// ── Contractor / supplier waitlist ───────────────────────────────────────────
export async function sendWaitlistEmail(entry: Record<string, unknown>) {
  const isSupplier = entry?.type === "supplier_waitlist";
  const label = isSupplier ? "Supplier Waitlist" : "Contractor Waitlist";
  const subject = `New Deckmetry Inquiry — ${label}`;

  const text = [
    "New Deckmetry Inquiry",
    "",
    `Inquiry Type: ${label}`,
    `Source: ${label}`,
    `Created: ${entry?.created_date ?? ""}`,
    "",
    "Contact:",
    `Name: ${entry?.name ?? ""}`,
    `Company Name: ${entry?.company_name ?? ""}`,
    `Email: ${entry?.email ?? ""}`,
    `Phone: ${entry?.phone || "—"}`,
  ].join("\n");

  await send(subject, text);
}
