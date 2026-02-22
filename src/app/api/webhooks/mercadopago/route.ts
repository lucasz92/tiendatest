import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { db } from "@/db";
import { orders, orderItems, shopSettings, products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const type = body.type || body.topic;
        if (type !== "payment") {
            return NextResponse.json({ message: "Evento ignorado" }, { status: 200 });
        }

        const { searchParams } = new URL(request.url);
        const shopIdParam = searchParams.get("shopId");
        if (!shopIdParam) {
            return NextResponse.json({ error: "Missing shopId param in webhook" }, { status: 400 });
        }

        const paymentId = body.data?.id;
        if (!paymentId) {
            return NextResponse.json({ error: "ID de pago no encontrado" }, { status: 400 });
        }

        const shopSettingsData = await db.select().from(shopSettings).where(eq(shopSettings.shopId, parseInt(shopIdParam)));
        const shopSetting = shopSettingsData[0];

        let accessToken = process.env.MP_ACCESS_TOKEN!;
        if (shopSetting && shopSetting.mpAccessToken) {
            accessToken = shopSetting.mpAccessToken;
        }

        const client = new MercadoPagoConfig({ accessToken });
        const payment = new Payment(client);
        const paymentInfo = await payment.get({ id: paymentId });

        console.log(`[MP_WEBHOOK] Payment ${paymentId} — status: ${paymentInfo.status}`);

        // ─── Solo actuamos si el pago fue aprobado ──────────────────
        if (paymentInfo.status !== "approved") {
            console.log(`[MP_WEBHOOK] Pago no aprobado (${paymentInfo.status}), ignorando.`);
            return NextResponse.json({ message: "Pago no aprobado, ignorado" }, { status: 200 });
        }

        // ─── Recuperamos los datos del pedido desde metadata ────────
        const meta = paymentInfo.metadata as {
            shop_id: number;
            shop_slug: string;
            total_amount: number;
            customer_name: string;
            customer_email: string;
            customer_phone?: string;
            shipping_address?: {
                street?: string;
                city?: string;
                province?: string;
                zip_code?: string;
            };
            items: Array<{
                product_id: number;
                quantity: number;
                price_at_time: number;
            }>;
        } | null;

        if (!meta || !meta.shop_id || !meta.items?.length) {
            console.error(`[MP_WEBHOOK] Metadata incompleta para pago ${paymentId}:`, meta);
            return NextResponse.json({ error: "Metadata incompleta" }, { status: 400 });
        }

        // ─── Crear la orden en DB ───────────────────────────────────
        const [newOrder] = await db.insert(orders).values({
            shopId: meta.shop_id,
            customerName: meta.customer_name,
            customerEmail: meta.customer_email,
            customerPhone: meta.customer_phone || null,
            shippingAddress: meta.shipping_address || null,
            totalAmount: meta.total_amount,
            status: "paid", // ← ya viene confirmado por MP
        }).returning();

        // ─── Crear los order items ─────────────────────────────────
        await db.insert(orderItems).values(
            meta.items.map(item => ({
                orderId: newOrder.id,
                productId: item.product_id,
                quantity: item.quantity,
                priceAtTime: item.price_at_time,
            }))
        );

        console.log(`[MP_WEBHOOK] ✅ Orden ${newOrder.id} creada correctamente para pago ${paymentId}`);

        // ─── Descontar stock automáticamente ───────────────────────
        for (const item of meta.items) {
            await db.update(products)
                .set({ stock: sql`GREATEST(0, ${products.stock} - ${item.quantity})` })
                .where(eq(products.id, item.product_id));
        }
        console.log(`[MP_WEBHOOK] 📦 Stock descontado para ${meta.items.length} producto(s)`);

        return NextResponse.json({ success: true, orderId: newOrder.id }, { status: 200 });

    } catch (error) {
        console.error("[MP_WEBHOOK_ERROR]", error);
        return NextResponse.json({ error: "Error procesando el webhook" }, { status: 500 });
    }
}
