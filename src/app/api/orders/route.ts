import { NextResponse } from "next/server";
import { getCurrentShop } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const shop = await getCurrentShop();
        if (!shop) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all orders for this shop
        const shopOrders = await db
            .select()
            .from(orders)
            .where(eq(orders.shopId, shop.id))
            .orderBy(desc(orders.createdAt));

        // We also want to fetch items for each order.
        // Drizzle relations query could do this cleaner, but we can also just fetch all items for these orders
        // or use a db query builder relational approach. Let's use the standard query approach carefully.

        // Instead of raw query, let's fetch items for the orders.
        const allItems = await db
            .select({
                id: orderItems.id,
                orderId: orderItems.orderId,
                quantity: orderItems.quantity,
                priceAtTime: orderItems.priceAtTime,
                productName: products.name,
            })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .where(
                shopOrders.length > 0
                    ? eq(products.shopId, shop.id) // Ensure we only get items from this shop
                    : eq(orderItems.id, -1) // If no orders, fetch none
            );

        // Group items by order ID
        const ordersWithItems = shopOrders.map((order) => {
            const items = allItems.filter((i) => i.orderId === order.id);
            return {
                ...order,
                items,
            };
        });

        return NextResponse.json(ordersWithItems);
    } catch (error) {
        console.error("[ORDERS_GET]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
