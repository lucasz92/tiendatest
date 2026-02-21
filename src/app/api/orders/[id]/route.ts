import { NextResponse } from "next/server";
import { getCurrentShop } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { resend } from "@/lib/resend";
import { OrderShippedEmail } from "@/components/emails/order-shipped-email";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const shop = await getCurrentShop();

        if (!shop) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { status, trackingCode } = body;

        const [updatedOrder] = await db
            .update(orders)
            .set({
                status,
                trackingCode,
            })
            .where(and(
                eq(orders.id, parseInt(id)),
                eq(orders.shopId, shop.id) // Security check: must belong to the tenant
            ))
            .returning();

        if (!updatedOrder) {
            return new NextResponse("Order not found or unauthorized", { status: 404 });
        }

        // --- AUTOMATED EMAIL: Order Shipped ---
        if (status === "shipped" && trackingCode) {
            try {
                await resend.emails.send({
                    from: "TiendaFácil <onboarding@resend.dev>", // Cambiar por tu dominio verificado en Resend
                    to: updatedOrder.customerEmail, // Si estás en plan Free de Resend, solo podés enviarte a tu propio correo verificado
                    subject: `Tu pedido #${updatedOrder.id} está en camino 🚚`,
                    react: OrderShippedEmail({
                        customerName: updatedOrder.customerName,
                        orderId: updatedOrder.id,
                        trackingCode: trackingCode,
                        shopName: shop.name
                    }) as React.ReactElement,
                });
                console.log(`[EMAIL] Shipped notification sent for Request #${updatedOrder.id}`);
            } catch (emailErr) {
                console.error("[EMAIL_ERROR]", emailErr);
                // We don't fail the API request if the email fails, the DB update was successful
            }
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("[ORDER_PUT]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
