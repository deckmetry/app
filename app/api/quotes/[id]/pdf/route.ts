import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { ProposalPDF } from "@/lib/pdf/proposal-template";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quote, error } = await supabase
    .from("quotes")
    .select(`
      *,
      quote_line_items (
        category, description, size, quantity, unit,
        unit_price, line_total, visible_to_customer, sort_order
      ),
      estimates (
        project_name, deck_type, deck_width_ft, deck_projection_ft,
        total_area_sf, contractor_name, project_address,
        decking_brand, decking_color
      )
    `)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const lineItems = (quote.quote_line_items ?? []).sort(
    (a: any, b: any) => a.sort_order - b.sort_order
  );

  const buffer = await renderToBuffer(
    ProposalPDF({
      quote: {
        quote_number: quote.quote_number,
        title: quote.title,
        cover_note: quote.cover_note,
        valid_until: quote.valid_until,
        payment_terms: quote.payment_terms,
        subtotal: Number(quote.subtotal),
        tax_rate: Number(quote.tax_rate),
        tax_amount: Number(quote.tax_amount),
        discount_amount: Number(quote.discount_amount),
        total: Number(quote.total),
        created_at: quote.created_at,
      },
      estimate: {
        project_name: quote.estimates?.project_name ?? "",
        deck_type: quote.estimates?.deck_type ?? "attached",
        deck_width_ft: quote.estimates?.deck_width_ft ?? 0,
        deck_projection_ft: quote.estimates?.deck_projection_ft ?? 0,
        total_area_sf: quote.estimates?.total_area_sf ?? null,
        contractor_name: quote.estimates?.contractor_name ?? null,
        project_address: quote.estimates?.project_address ?? null,
        decking_brand: quote.estimates?.decking_brand ?? null,
        decking_color: quote.estimates?.decking_color ?? null,
      },
      lineItems,
    })
  );

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.quote_number}.pdf"`,
    },
  });
}
