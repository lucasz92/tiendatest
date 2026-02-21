import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Text,
    Section,
    Row,
    Column,
    Hr,
} from "@react-email/components";
import * as React from "react";

interface OrderShippedEmailProps {
    customerName: string;
    orderId: number;
    trackingCode: string;
    shopName: string;
}

export const OrderShippedEmail = ({
    customerName,
    orderId,
    trackingCode,
    shopName,
}: OrderShippedEmailProps) => {
    const previewText = `¡Tu pedido #${orderId} de ${shopName} está en camino!`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>¡Buenas noticias, {customerName}!</Heading>
                    <Text style={text}>
                        Tu pedido <strong>#{orderId}</strong> en <strong>{shopName}</strong> ha sido despachado y ya está en camino a tu domicilio.
                    </Text>

                    <Section style={trackingSection}>
                        <Text style={label}>Código de Seguimiento:</Text>
                        <Text style={trackingCodeStyle}>{trackingCode}</Text>
                    </Section>

                    <Text style={text}>
                        Podés usar ese código en la página del correo para seguir el trayecto de tu paquete.
                    </Text>

                    <Hr style={hr} />

                    <Text style={footer}>
                        Gracias por tu compra. Si tenés alguna duda, respondé a este correo para contactarte con <strong>{shopName}</strong>.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default OrderShippedEmail;

// Styles
const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    border: "1px solid #e6ebf1",
    borderRadius: "8px",
    maxWidth: "600px",
};

const h1 = {
    color: "#333",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "30px 0",
    padding: "0 24px",
};

const text = {
    color: "#525f7f",
    fontSize: "16px",
    lineHeight: "26px",
    padding: "0 24px",
};

const trackingSection = {
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    padding: "24px",
    margin: "24px",
    textAlign: "center" as const,
};

const label = {
    color: "#495057",
    fontSize: "14px",
    textTransform: "uppercase" as const,
    marginBottom: "8px",
    fontWeight: "bold",
};

const trackingCodeStyle = {
    color: "#18181b",
    fontSize: "24px",
    fontWeight: "bold",
    letterSpacing: "2px",
    margin: "0",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "20px 0",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    padding: "0 24px",
    textAlign: "center" as const,
};
