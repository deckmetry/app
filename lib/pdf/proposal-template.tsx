import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#333",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#2d7a6b",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d7a6b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "#666",
  },
  quoteNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2d7a6b",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 10,
    fontWeight: "bold",
  },
  coverNote: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#555",
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#f8f8f6",
    borderRadius: 4,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0ee",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  colDescription: { width: "40%" },
  colQty: { width: "10%", textAlign: "right" },
  colUnit: { width: "10%" },
  colUnitPrice: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },
  colCategory: { width: "10%" },
  headerText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cellText: {
    fontSize: 9,
  },
  totalsSection: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 10,
    color: "#666",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingVertical: 6,
    borderTopWidth: 2,
    borderTopColor: "#2d7a6b",
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2d7a6b",
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#2d7a6b",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#999",
  },
  terms: {
    fontSize: 9,
    color: "#666",
    marginTop: 4,
  },
});

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface ProposalPDFProps {
  quote: {
    quote_number: string;
    title: string;
    cover_note: string | null;
    valid_until: string | null;
    payment_terms: string | null;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    discount_amount: number;
    total: number;
    created_at: string;
  };
  estimate: {
    project_name: string;
    deck_type: string;
    deck_width_ft: number;
    deck_projection_ft: number;
    total_area_sf: number | null;
    contractor_name: string | null;
    project_address: string | null;
    decking_brand: string | null;
    decking_color: string | null;
  };
  lineItems: {
    category: string;
    description: string;
    size: string | null;
    quantity: number;
    unit: string;
    unit_price: number;
    line_total: number;
    visible_to_customer: boolean;
  }[];
}

export function ProposalPDF({ quote, estimate, lineItems }: ProposalPDFProps) {
  const visibleItems = lineItems.filter((i) => i.visible_to_customer);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>DECKMETRY</Text>
          <Text style={styles.subtitle}>Professional Deck Proposal</Text>
          <Text style={styles.quoteNumber}>{quote.quote_number}</Text>
        </View>

        {/* Project Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Project</Text>
              <Text style={styles.value}>{estimate.project_name}</Text>
            </View>
            <View>
              <Text style={styles.label}>Deck</Text>
              <Text style={styles.value}>
                {estimate.deck_width_ft}&apos; x {estimate.deck_projection_ft}&apos;{" "}
                {estimate.deck_type} ({estimate.total_area_sf} sf)
              </Text>
            </View>
          </View>
          {estimate.project_address && (
            <View style={{ marginTop: 4 }}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{estimate.project_address}</Text>
            </View>
          )}
          {estimate.contractor_name && (
            <View style={{ marginTop: 4 }}>
              <Text style={styles.label}>Contractor</Text>
              <Text style={styles.value}>{estimate.contractor_name}</Text>
            </View>
          )}
          <View style={{ marginTop: 4 }}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>
              {new Date(quote.created_at).toLocaleDateString()}
            </Text>
          </View>
          {quote.valid_until && (
            <View style={{ marginTop: 4 }}>
              <Text style={styles.label}>Valid Until</Text>
              <Text style={styles.value}>
                {new Date(quote.valid_until).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Cover note */}
        {quote.cover_note && (
          <View style={styles.coverNote}>
            <Text>{quote.cover_note}</Text>
          </View>
        )}

        {/* Line items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materials &amp; Services</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.colCategory}>
                <Text style={styles.headerText}>Category</Text>
              </View>
              <View style={styles.colDescription}>
                <Text style={styles.headerText}>Description</Text>
              </View>
              <View style={styles.colQty}>
                <Text style={styles.headerText}>Qty</Text>
              </View>
              <View style={styles.colUnit}>
                <Text style={styles.headerText}>Unit</Text>
              </View>
              <View style={styles.colUnitPrice}>
                <Text style={styles.headerText}>Unit Price</Text>
              </View>
              <View style={styles.colTotal}>
                <Text style={styles.headerText}>Total</Text>
              </View>
            </View>
            {visibleItems.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={styles.colCategory}>
                  <Text style={styles.cellText}>{item.category}</Text>
                </View>
                <View style={styles.colDescription}>
                  <Text style={styles.cellText}>
                    {item.description}
                    {item.size ? ` (${item.size})` : ""}
                  </Text>
                </View>
                <View style={styles.colQty}>
                  <Text style={styles.cellText}>{item.quantity}</Text>
                </View>
                <View style={styles.colUnit}>
                  <Text style={styles.cellText}>{item.unit}</Text>
                </View>
                <View style={styles.colUnitPrice}>
                  <Text style={styles.cellText}>{fmt(item.unit_price)}</Text>
                </View>
                <View style={styles.colTotal}>
                  <Text style={styles.cellText}>{fmt(item.line_total)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{fmt(quote.subtotal)}</Text>
          </View>
          {quote.tax_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Tax ({(quote.tax_rate * 100).toFixed(1)}%)
              </Text>
              <Text style={styles.totalValue}>{fmt(quote.tax_amount)}</Text>
            </View>
          )}
          {quote.discount_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={styles.totalValue}>-{fmt(quote.discount_amount)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{fmt(quote.total)}</Text>
          </View>
        </View>

        {/* Terms */}
        {quote.payment_terms && (
          <View style={{ ...styles.section, marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Payment Terms</Text>
            <Text style={styles.terms}>{quote.payment_terms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by Deckmetry &mdash; app.deckmetry.com
          </Text>
          <Text style={styles.footerText}>{quote.quote_number}</Text>
        </View>
      </Page>
    </Document>
  );
}
