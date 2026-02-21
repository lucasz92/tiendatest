import { NextResponse } from "next/server";
import { db } from "@/db";
import { shops, products, orders, orderItems } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Inicializamos Mercado Pago con el Access Token
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerInfo, items, shopId } = body;

        // 1. Validaciones básicas
        if (!items || items.length === 0 || !shopId) {
            return NextResponse.json({ error: "Carrito vacío o tienda inválida" }, { status: 400 });
        }

        if (!customerInfo.email || !customerInfo.name) {
            return NextResponse.json({ error: "Faltan datos del cliente" }, { status: 400 });
        }

        // 2. Obtener la tienda para validar que existe
        const shopData = await db.select().from(shops).where(eq(shops.id, shopId));
        if (shopData.length === 0) {
            return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
        }
        const shop = shopData[0];

        // 3. Validar precios y stock reales contra la base de datos (seguridad)
        const productIds = items.map((item: any) => item.id);
        const dbProducts = await db
            .select()
            .from(products)
            .where(inArray(products.id, productIds));

        let calculatedTotal = 0;
        const itemsForOrder = [];
        const itemsForMP = [];

        for (const cartItem of items) {
            const dbProduct = dbProducts.find((p) => p.id === cartItem.id);

            if (!dbProduct) {
                return NextResponse.json({ error: `Producto ${cartItem.name} no encontrado` }, { status: 400 });
            }

            if ((dbProduct.stock ?? 0) < cartItem.quantity) {
                return NextResponse.json({ error: `Sin stock suficiente para ${dbProduct.name}` }, { status: 400 });
            }

            calculatedTotal += dbProduct.price * cartItem.quantity;

            itemsForOrder.push({
                productId: dbProduct.id,
                quantity: cartItem.quantity,
                priceAtTime: dbProduct.price,
            });

            itemsForMP.push({
                id: dbProduct.id.toString(),
                title: dbProduct.name,
                quantity: cartItem.quantity,
                unit_price: dbProduct.price,
                currency_id: "ARS",
                picture_url: dbProduct.imageUrl || undefined,
            });
        }

        // 4. Crear la Orden en estado 'pending' en Drizzle
        const [newOrder] = await db.insert(orders).values({
            shopId: shop.id,
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            shippingAddress: {
                street: customerInfo.street,
                city: customerInfo.city,
                province: customerInfo.province,
                zipCode: customerInfo.zipCode,
            },
            totalAmount: calculatedTotal,
            status: "pending",
        }).returning();

        // 5. Insertar los items de la orden
        await db.insert(orderItems).values(
            itemsForOrder.map(item => ({
                orderId: newOrder.id,
                ...item
            }))
        );

        // 6. Configurar la URL base de ngrok/localhost para las redirecciones
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

        // 7. Crear la Preferencia de Mercado Pago
        const preference = new Preference(client);

        const mpResponse = await preference.create({
            body: {
                items: itemsForMP,
                payer: {
                    name: customerInfo.name,
                    email: customerInfo.email,
                },
                back_urls: {
                    success: `${appUrl}/${shop.slug}/success?orderId=${newOrder.id}`,
                    failure: `${appUrl}/${shop.slug}/failure?orderId=${newOrder.id}`,
                    pending: `${appUrl}/${shop.slug}/pending?orderId=${newOrder.id}`,
                },
                auto_return: "approved",
                // Aquí conectamos la orden interna con la preferencia usando external_reference
                external_reference: newOrder.id.toString(),
                statement_descriptor: shop.name,
            }
        });

        // 8. Devolver el init_point de MP al cliente para redirigirlo
        return NextResponse.json({
            initPoint: mpResponse.init_point,
            orderId: newOrder.id
        });

    } catch (error) {
        console.error("[CHECKOUT_POST]", error);
        return NextResponse.json({ error: "Error interno al procesar el checkout" }, { status: 500 });
    }
}
