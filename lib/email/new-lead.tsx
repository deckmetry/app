import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface NewLeadEmailProps {
  supplierName: string;
  homeownerName?: string | null;
  homeownerEmail: string;
  homeownerPhone?: string | null;
  projectAddress?: string | null;
  deckType: string;
  widthFt: number;
  projectionFt: number;
  areaSf: number;
  bomItems: number;
  leadsUrl: string;
}

export function NewLeadEmail({
  supplierName,
  homeownerName,
  homeownerEmail,
  homeownerPhone,
  projectAddress,
  deckType,
  widthFt,
  projectionFt,
  areaSf,
  bomItems,
  leadsUrl,
}: NewLeadEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        New lead from your deck estimator — {homeownerName || homeownerEmail}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>DECKMETRY</Heading>
          <Hr style={hr} />

          <Heading style={heading}>New Lead from Your Deck Estimator</Heading>
          <Text style={paragraph}>
            Someone just used your embedded deck estimator on your website.
            Here are their details:
          </Text>

          {/* Contact info */}
          <Section style={detailsBox}>
            {homeownerName && (
              <>
                <Text style={detailLabel}>Name</Text>
                <Text style={detailValue}>{homeownerName}</Text>
              </>
            )}
            <Text style={detailLabel}>Email</Text>
            <Text style={detailValue}>{homeownerEmail}</Text>
            {homeownerPhone && (
              <>
                <Text style={detailLabel}>Phone</Text>
                <Text style={detailValue}>{homeownerPhone}</Text>
              </>
            )}
            {projectAddress && (
              <>
                <Text style={detailLabel}>Project Address</Text>
                <Text style={detailValue}>{projectAddress}</Text>
              </>
            )}
          </Section>

          {/* Project specs */}
          <Section style={detailsBox}>
            <Text style={detailLabel}>Deck Type</Text>
            <Text style={detailValue}>{deckType}</Text>
            <Text style={detailLabel}>Dimensions</Text>
            <Text style={detailValue}>
              {widthFt}&apos; x {projectionFt}&apos; ({areaSf} sq ft)
            </Text>
            <Text style={detailLabel}>BOM Items</Text>
            <Text style={{ ...detailValue, margin: "0" }}>{bomItems} items</Text>
          </Section>

          <Section style={buttonSection}>
            <Link href={leadsUrl} style={button}>
              View Lead in Dashboard
            </Link>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            Deckmetry &mdash; Lead notification for {supplierName}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default NewLeadEmail;

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
  color: "#2d7a6b",
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
  backgroundColor: "#2d7a6b",
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
