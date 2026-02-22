import { NextResponse } from "next/server";
import { db } from "@/db";
import { shops, products, shopSettings, coupons } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerInfo, items, shopId, couponCode } = body;

        if (!items || items.length === 0 || !shopId) {
            return NextResponse.json({ error: "Carrito vacío o tienda inválida" }, { status: 400 });
        }

        if (!customerInfo.email || !customerInfo.name) {
            return NextResponse.json({ error: "Faltan datos del cliente" }, { status: 400 });
        }

        // 1. Validar que la tienda existe
        const shopData = await db.select().from(shops).where(eq(shops.id, shopId));
        if (shopData.length === 0) {
            return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
        }
        const shop = shopData[0];

        // Fetch store MP credentials
        const shopSettingsData = await db.select().from(shopSettings).where(eq(shopSettings.shopId, shopId));
        const shopSetting = shopSettingsData[0];

        let accessToken = process.env.MP_ACCESS_TOKEN!;
        if (shopSetting && shopSetting.mpAccessToken) {
            accessToken = shopSetting.mpAccessToken;
        }

        const client = new MercadoPagoConfig({ accessToken });

        // 2. Validar precios y stock desde la DB (seguridad)
        const productIds = items.map((item: any) => item.id);
        const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));

        let calculatedTotal = 0;
        const itemsForMP = [];
        const itemsForWebhook = []; // se guarda en metadata para recrear la orden después

        for (const cartItem of items) {
            const dbProduct = dbProducts.find((p) => p.id === cartItem.id);
            if (!dbProduct) {
                return NextResponse.json({ error: `Producto ${cartItem.name} no encontrado` }, { status: 400 });
            }
            if ((dbProduct.stock ?? 0) < cartItem.quantity) {
                return NextResponse.json({ error: `Sin stock suficiente para ${dbProduct.name}` }, { status: 400 });
            }

            calculatedTotal += dbProduct.price * cartItem.quantity;

            itemsForMP.push({
                id: dbProduct.id.toString(),
                title: dbProduct.name,
                quantity: cartItem.quantity,
                unit_price: dbProduct.price,
                currency_id: "ARS",
                picture_url: dbProduct.imageUrl || undefined,
            });

            itemsForWebhook.push({
                product_id: dbProduct.id,
                quantity: cartItem.quantity,
                price_at_time: dbProduct.price,
                selectedVariants: cartItem.selectedVariants || {},
            });
        }

        // 3. Validar y aplicar el cupón si existe
        let appliedCouponId = null;
        let discountAmount = 0;

        if (couponCode) {
            const normalizedCode = couponCode.toUpperCase().trim();
            const [coupon] = await db
                .select()
                .from(coupons)
                .where(and(
                    eq(coupons.shopId, shopId),
                    eq(coupons.code, normalizedCode)
                ));

            // Only apply if fully valid
            if (
                coupon &&
                coupon.isActive &&
                (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) &&
                (!coupon.maxUses || coupon.usesCount < coupon.maxUses) &&
                (!coupon.minAmount || calculatedTotal >= coupon.minAmount)
            ) {
                appliedCouponId = coupon.id;

                if (coupon.type === "percentage") {
                    discountAmount = Math.round(calculatedTotal * (coupon.value / 100));
                } else if (coupon.type === "fixed") {
                    discountAmount = coupon.value;
                    if (discountAmount > calculatedTotal) {
                        discountAmount = calculatedTotal;
                    }
                }

                // Append negative item for Mercado Pago
                if (discountAmount > 0) {
                    itemsForMP.push({
                        id: `COUPON-${coupon.code}`,
                        title: `Descuento: ${coupon.code}`,
                        quantity: 1,
                        unit_price: -discountAmount, // MP accepts negative prices for flat discounts
                        currency_id: "ARS",
                    });

                    calculatedTotal -= discountAmount;
                }
            }
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL
            ? process.env.NEXT_PUBLIC_APP_URL
            : process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : "http://localhost:3000";

        // 3. Crear la Preferencia de MP con toda la info en metadata
        //    ⚠️ NO creamos la orden en DB todavía — lo hace el webhook cuando el pago sea aprobado
        const preference = new Preference(client);

        const mpResponse = await preference.create({
            body: {
                notification_url: `${appUrl}/api/webhooks/mercadopago?shopId=${shop.id}`,
                items: itemsForMP,
                payer: {
                    name: customerInfo.name,
                    email: customerInfo.email,
                },
                back_urls: {
                    success: `${appUrl}/${shop.slug}/success`,
                    failure: `${appUrl}/${shop.slug}/failure`,
                    pending: `${appUrl}/${shop.slug}/pending`,
                },
                auto_return: "approved",
                statement_descriptor: shop.name,
                // Toda la info necesaria para crear la orden en el webhook
                metadata: {
                    shopId: shop.id,
                    shopSlug: shop.slug,
                    totalAmount: calculatedTotal,
                    customerName: customerInfo.name,
                    customerEmail: customerInfo.email,
                    customerPhone: customerInfo.phone || null,
                    shippingAddress: {
                        street: customerInfo.street || null,
                        city: customerInfo.city || null,
                        province: customerInfo.province || null,
                        zipCode: customerInfo.zipCode || null,
                    },
                    items: itemsForWebhook,
                    couponId: appliedCouponId,
                    discountAmount: discountAmount
                },
            }
        });

        return NextResponse.json({
            initPoint: mpResponse.init_point,
        });

    } catch (error) {
        console.error("[CHECKOUT_POST]", error);
        return NextResponse.json({ error: "Error interno al procesar el checkout" }, { status: 500 });
    }
}
