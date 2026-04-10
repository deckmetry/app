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

interface DeliveryConfirmedEmailProps {
  contractorName: string;
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  estimatedDate: string;
}

export function DeliveryConfirmedEmail({
  contractorName,
  orderNumber,
  carrier,
  trackingNumber,
  estimatedDate,
}: DeliveryConfirmedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Order {orderNumber} has been delivered!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>DECKMETRY</Heading>
          <Hr style={hr} />
          <Section style={successBanner}>
            <Text style={successText}>Delivery Confirmed!</Text>
          </Section>
          <Text style={paragraph}>Hi {contractorName},</Text>
          <Text style={paragraph}>
            Your order <strong>{orderNumber}</strong> has been delivered.
          </Text>
          <Section style={detailsBox}>
            <Text style={detailLabel}>Carrier</Text>
            <Text style={detailValue}>{carrier}</Text>
            <Text style={detailLabel}>Tracking #</Text>
            <Text style={detailValue}>{trackingNumber}</Text>
            <Text style={detailLabel}>Delivered</Text>
            <Text style={detailValue}>{estimatedDate}</Text>
          </Section>
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

export default DeliveryConfirmedEmail;

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
const hr = { borderColor: "#e5e5e5", margin: "20px 0" };
const footer = {
  color: "#999",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
};
