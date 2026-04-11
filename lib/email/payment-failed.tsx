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

interface PaymentFailedEmailProps {
  recipientName: string;
  gracePeriodEnd: string;
  amountDue: string;
  portalUrl: string;
}

export function PaymentFailedEmail({
  recipientName,
  gracePeriodEnd,
  amountDue,
  portalUrl,
}: PaymentFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Action required: your payment of {amountDue} failed
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>DECKMETRY</Heading>
          <Hr style={hr} />
          <Heading style={heading}>Payment Failed</Heading>
          <Text style={paragraph}>Hi {recipientName},</Text>
          <Text style={paragraph}>
            We were unable to process your payment of <strong>{amountDue}</strong>.
            Your account will remain active until <strong>{gracePeriodEnd}</strong>,
            but you need to update your payment method before then to avoid service
            interruption.
          </Text>
          <Section style={detailsBox}>
            <Text style={detailLabel}>Amount Due</Text>
            <Text style={detailValue}>{amountDue}</Text>
            <Text style={detailLabel}>Grace Period Ends</Text>
            <Text style={detailValue}>{gracePeriodEnd}</Text>
          </Section>
          <Section style={buttonSection}>
            <Link href={portalUrl} style={button}>
              Update Payment Method
            </Link>
          </Section>
          <Text style={paragraph}>
            If you believe this is an error or need assistance, please reach out
            to our support team.
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

export default PaymentFailedEmail;

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
  backgroundColor: "#fef3c7",
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
  backgroundColor: "#dc2626",
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
