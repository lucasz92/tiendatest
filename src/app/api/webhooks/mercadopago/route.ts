import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

// Inicializamos Mercado Pago con el Access Token
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Webhook de Mercado Pago: buscamos eventos de pago
        const type = body.type || body.topic;
        if (type !== "payment") {
            // Ignoramos otros eventos para evitar errores
            return NextResponse.json({ message: "Evento ignorado" }, { status: 200 });
        }

        const paymentId = body.data?.id;
        if (!paymentId) {
            return NextResponse.json({ error: "ID de pago no encontrado en el payload" }, { status: 400 });
        }

        // Instanciamos el servicio de Pagos de MP
        const payment = new Payment(client);
        const paymentInfo = await payment.get({ id: paymentId });

        console.log(`Recibido Webhook de MP. Payment ID: ${paymentId}. Status: ${paymentInfo.status}`);

        // La ID de la orden interna viaja en `external_reference`
        const orderIdStr = paymentInfo.external_reference;
        if (!orderIdStr) {
            console.warn(`Pago ${paymentId} no tiene external_reference. Ignorando.`);
            return NextResponse.json({ message: "Sin external_reference" }, { status: 200 });
        }

        const orderId = parseInt(orderIdStr, 10);

        // Actualizamos el estado en base a la respuesta de MP
        if (paymentInfo.status === "approved") {
            await db.update(orders)
                .set({ status: "paid" })
                .where(eq(orders.id, orderId));

            console.log(`Orden ${orderIdStr} actualizada a 'paid'`);
        } else if (paymentInfo.status === "cancelled" || paymentInfo.status === "rejected") {
            await db.update(orders)
                .set({ status: "cancelled" })
                .where(eq(orders.id, orderId));

            console.log(`Orden ${orderIdStr} actualizada a 'cancelled'`);
        } else {
            console.log(`Orden ${orderIdStr} mantenida en estado transitorio (${paymentInfo.status})`);
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("[MP_WEBHOOK_ERROR]", error);
        return NextResponse.json({ error: "Error procesando el webhook" }, { status: 500 });
    }
}
