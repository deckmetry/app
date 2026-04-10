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

interface ProposalApprovedEmailProps {
  contractorName: string;
  signerName: string;
  projectName: string;
  quoteNumber: string;
  total: string;
  dashboardUrl: string;
}

export function ProposalApprovedEmail({
  contractorName,
  signerName,
  projectName,
  quoteNumber,
  total,
  dashboardUrl,
}: ProposalApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Proposal {quoteNumber} approved by {signerName}!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>DECKMETRY</Heading>
          <Hr style={hr} />
          <Section style={successBanner}>
            <Text style={successText}>Proposal Approved!</Text>
          </Section>
          <Heading style={heading}>Great news, {contractorName}!</Heading>
          <Text style={paragraph}>
            <strong>{signerName}</strong> has approved your proposal for project{" "}
            <strong>{projectName}</strong>.
          </Text>
          <Section style={detailsBox}>
            <Text style={detailLabel}>Quote Number</Text>
            <Text style={detailValue}>{quoteNumber}</Text>
            <Text style={detailLabel}>Approved Total</Text>
            <Text style={detailValue}>{total}</Text>
            <Text style={detailLabel}>Approved By</Text>
            <Text style={detailValue}>{signerName}</Text>
          </Section>
          <Section style={buttonSection}>
            <Link href={dashboardUrl} style={button}>
              View in Dashboard
            </Link>
          </Section>
          <Text style={paragraph}>
            You can now proceed with ordering materials and scheduling the
            project.
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

export default ProposalApprovedEmail;

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

const successBanner = {
  backgroundColor: "#ecfdf5",
  borderRadius: "6px",
  padding: "12px 20px",
  textAlign: "center" as const,
  margin: "16px 0",
};

const successText = {
  color: "#065f46",
  fontSize: "18px",
  fontWeight: "bold" as const,
  margin: "0",
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
