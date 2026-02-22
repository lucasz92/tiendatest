import { NextResponse } from "next/server";
import { getCurrentShop } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
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
        const { status, trackingCode } = body; // new status

        // 1. Fetch current order state and items
        const existingOrders = await db.select({
            status: orders.status,
            customerEmail: orders.customerEmail,
            customerName: orders.customerName
        })
            .from(orders)
            .where(and(eq(orders.id, parseInt(id)), eq(orders.shopId, shop.id)));

        if (existingOrders.length === 0) {
            return new NextResponse("Order not found or unauthorized", { status: 404 });
        }

        const oldStatus = existingOrders[0].status;

        // 2. Automated Stock Management
        const isCanceledOrReturned = (s: string | null) => s === "canceled" || s === "returned";

        // If transitioning INTO canceled/returned -> RESTORE STOCK
        if (isCanceledOrReturned(status) && !isCanceledOrReturned(oldStatus)) {
            const items = await db.select().from(orderItems).where(eq(orderItems.orderId, parseInt(id)));
            // Restore via atomic increment
            for (const item of items) {
                await db.update(products)
                    .set({ stock: sql`stock + ${item.quantity}` })
                    .where(eq(products.id, item.productId));
            }
            console.log(`[ORDER_${id}] Stock restored. Changed from ${oldStatus} to ${status}`);
        }

        // If transitioning OUT OF canceled/returned -> DEDUCT STOCK AGAIN
        if (!isCanceledOrReturned(status) && isCanceledOrReturned(oldStatus)) {
            const items = await db.select().from(orderItems).where(eq(orderItems.orderId, parseInt(id)));
            // Deduct via atomic decrement (preventing negative)
            for (const item of items) {
                await db.update(products)
                    .set({ stock: sql`GREATEST(0, stock - ${item.quantity})` })
                    .where(eq(products.id, item.productId));
            }
            console.log(`[ORDER_${id}] Stock deducted. Changed from ${oldStatus} to ${status}`);
        }

        // 3. Update Order Status
        const [updatedOrder] = await db
            .update(orders)
            .set({
                status,
                trackingCode,
            })
            .where(and(
                eq(orders.id, parseInt(id)),
                eq(orders.shopId, shop.id) // Security check inside transaction bounds (optional if checked above, but good for returning full order row)
            ))
            .returning();

        // --- AUTOMATED EMAIL: Order Shipped ---
        if (status === "shipped" && trackingCode && oldStatus !== "shipped") {
            try {
                await resend.emails.send({
                    from: "TiendaFácil <onboarding@resend.dev>",
                    to: updatedOrder.customerEmail,
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
            }
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("[ORDER_PUT]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
