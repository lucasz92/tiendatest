import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { db } from "@/db";
import { orders, orderItems, shopSettings, products, coupons } from "@/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { sendTelegramMessage, buildOrderMessage, buildLowStockMessage } from "@/lib/telegram";

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
            coupon_id?: number | null;
            discount_amount?: number | null;
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

        // ─── Incrementar uso de cupón ──────────────────────────────
        if (meta.coupon_id) {
            await db.update(coupons)
                .set({ usesCount: sql`${coupons.usesCount} + 1` })
                .where(eq(coupons.id, meta.coupon_id));
            console.log(`[MP_WEBHOOK] 🎟️ Cupón #${meta.coupon_id} uso incrementado.`);
        }

        // ─── Notificaciones por Telegram ───────────────────────────
        if (shopSetting && shopSetting.telegramBotToken && shopSetting.telegramChatId) {
            try {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
                const dashUrl = `${appUrl}/dashboard/orders`;

                // 1. Notificación de Nuevo Pedido
                const orderItemsMerged = meta.items.map(i => ({
                    name: `Producto #${i.product_id}`, // Usaremos esto como fallback rápido
                    quantity: i.quantity,
                    price: i.price_at_time,
                }));

                const orderMsg = buildOrderMessage(
                    meta.shop_slug, // Usamos el slug temporalmente como nombre, o podríamos buscar el shop actual
                    newOrder.id,
                    meta.customer_name,
                    meta.customer_email,
                    orderItemsMerged,
                    meta.total_amount,
                    meta.shipping_address,
                    dashUrl
                );

                await sendTelegramMessage(shopSetting.telegramBotToken, shopSetting.telegramChatId, orderMsg);
                console.log(`[MP_WEBHOOK] 📲 Telegram Orden enviada a ${shopSetting.telegramChatId}`);

                // 2. Alerta de Stock Bajo
                const threshold = shopSetting.telegramLowStockThreshold;
                if (threshold !== null && threshold !== undefined) {
                    const productIds = meta.items.map(i => i.product_id);
                    const updatedProducts = await db.select({ name: products.name, stock: products.stock })
                        .from(products)
                        .where(inArray(products.id, productIds));

                    const lowStockItems = updatedProducts
                        .filter(p => p.stock !== null && p.stock <= threshold)
                        .map(p => ({ name: p.name, stock: p.stock as number }));

                    if (lowStockItems.length > 0) {
                        const stockMsg = buildLowStockMessage(meta.shop_slug, lowStockItems, `${appUrl}/dashboard/inventory`);
                        await sendTelegramMessage(shopSetting.telegramBotToken, shopSetting.telegramChatId, stockMsg);
                        console.log(`[MP_WEBHOOK] 📉 Telegram Alerta Stock enviada a ${shopSetting.telegramChatId}`);
                    }
                }

            } catch (tgError) {
                console.error("[MP_WEBHOOK] Error enviando Telegram, pero la orden se creó igual:", tgError);
            }
        }

        return NextResponse.json({ success: true, orderId: newOrder.id }, { status: 200 });

    } catch (error) {
        console.error("[MP_WEBHOOK_ERROR]", error);
        return NextResponse.json({ error: "Error procesando el webhook" }, { status: 500 });
    }
}
