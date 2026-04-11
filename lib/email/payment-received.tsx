import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PaymentReceivedEmailProps {
  recipientName: string;
  amountPaid: string;
}

export function PaymentReceivedEmail({
  recipientName,
  amountPaid,
}: PaymentReceivedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Payment of {amountPaid} received — thank you!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>DECKMETRY</Heading>
          <Hr style={hr} />
          <Heading style={heading}>Payment Received</Heading>
          <Text style={paragraph}>Hi {recipientName},</Text>
          <Text style={paragraph}>
            We&apos;ve successfully processed your payment. Thank you for your
            continued subscription!
          </Text>
          <Section style={detailsBox}>
            <Text style={detailLabel}>Amount Paid</Text>
            <Text style={detailValue}>{amountPaid}</Text>
          </Section>
          <Text style={paragraph}>
            No action is needed on your part. Your subscription is active and
            up to date.
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

export default PaymentReceivedEmail;

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
