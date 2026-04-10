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

interface ProposalSentEmailProps {
  recipientName: string;
  contractorName: string;
  projectName: string;
  quoteNumber: string;
  total: string;
  proposalUrl: string;
}

export function ProposalSentEmail({
  recipientName,
  contractorName,
  projectName,
  quoteNumber,
  total,
  proposalUrl,
}: ProposalSentEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        New deck proposal from {contractorName} — {quoteNumber}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>DECKMETRY</Heading>
          <Hr style={hr} />
          <Heading style={heading}>New Proposal for Your Review</Heading>
          <Text style={paragraph}>Hi {recipientName},</Text>
          <Text style={paragraph}>
            {contractorName} has sent you a proposal for your deck project{" "}
            <strong>{projectName}</strong>.
          </Text>
          <Section style={detailsBox}>
            <Text style={detailLabel}>Quote Number</Text>
            <Text style={detailValue}>{quoteNumber}</Text>
            <Text style={detailLabel}>Total</Text>
            <Text style={detailValue}>{total}</Text>
          </Section>
          <Section style={buttonSection}>
            <Link href={proposalUrl} style={button}>
              Review &amp; Approve Proposal
            </Link>
          </Section>
          <Text style={paragraph}>
            Click the button above to review the full breakdown of materials and
            services. You can approve directly from the proposal page.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Sent via Deckmetry &mdash; Professional Deck Estimating &amp;
            Ordering
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ProposalSentEmail;

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
