import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface BomResultsEmailProps {
  homeownerName?: string | null;
  supplierName: string;
  supplierLogoUrl?: string | null;
  supplierPrimaryColor?: string | null;
  deckType: string;
  widthFt: number;
  projectionFt: number;
  areaSf: number;
  bomItems: number;
  brand?: string | null;
  color?: string | null;
  bomUrl: string;
}

export function BomResultsEmail({
  homeownerName,
  supplierName,
  supplierLogoUrl,
  supplierPrimaryColor,
  deckType,
  widthFt,
  projectionFt,
  areaSf,
  bomItems,
  brand,
  color,
  bomUrl,
}: BomResultsEmailProps) {
  const primaryColor = supplierPrimaryColor || "#2d7a6b";
  const greeting = homeownerName ? `Hi ${homeownerName},` : "Hi there,";

  return (
    <Html>
      <Head />
      <Preview>
        Your deck material list is ready — {widthFt}&apos; x {projectionFt}&apos; {deckType} deck
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          {supplierLogoUrl ? (
            <Img
              src={supplierLogoUrl}
              alt={supplierName}
              height="36"
              style={{ margin: "0 auto 16px", display: "block" }}
            />
          ) : (
            <Heading style={{ ...logo, color: primaryColor }}>
              {supplierName.toUpperCase()}
            </Heading>
          )}
          <Hr style={hr} />

          <Heading style={heading}>Your Deck Material List is Ready</Heading>
          <Text style={paragraph}>{greeting}</Text>
          <Text style={paragraph}>
            Your deck material estimate has been generated. Here&apos;s a summary
            of your project:
          </Text>

          {/* Specs */}
          <Section style={detailsBox}>
            <Text style={detailLabel}>Deck Type</Text>
            <Text style={detailValue}>{deckType}</Text>
            <Text style={detailLabel}>Dimensions</Text>
            <Text style={detailValue}>
              {widthFt}&apos; x {projectionFt}&apos; ({areaSf} sq ft)
            </Text>
            {brand && (
              <>
                <Text style={detailLabel}>Material</Text>
                <Text style={detailValue}>
                  {brand} {color ? `— ${color}` : ""}
                </Text>
              </>
            )}
            <Text style={detailLabel}>BOM Items</Text>
            <Text style={{ ...detailValue, margin: "0" }}>{bomItems} items</Text>
          </Section>

          <Section style={buttonSection}>
            <Link href={bomUrl} style={{ ...button, backgroundColor: primaryColor }}>
              View Full Material List
            </Link>
          </Section>

          <Text style={paragraph}>
            Click the button above to see the complete breakdown of all materials
            needed for your deck project.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            Powered by Deckmetry &middot; Provided by {supplierName}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default BomResultsEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const logo = {
  fontSize: "20px",
  fontWeight: "bold" as const,
  textAlign: "center" as const,
  margin: "0 0 16px",
};

const heading = {
  color: "#333",
  fontSize: "22px",
  fontWeight: "bold" as const,
  margin: "24px 0 16px",
};

const paragraph = {
  color: "#555",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const detailsBox = {
  backgroundColor: "#f8f8f6",
  borderRadius: "6px",
  padding: "16px 20px",
  margin: "20px 0",
};

const detailLabel = {
  color: "#888",
  fontSize: "11px",
  fontWeight: "bold" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 2px",
};

const detailValue = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold" as const,
  margin: "0 0 12px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  borderRadius: "6px",
  color: "#fff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "bold" as const,
  padding: "12px 32px",
  textDecoration: "none",
};

const hr = {
  borderColor: "#e5e5e5",
  margin: "20px 0",
};

const footer = {
  color: "#999",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
};
