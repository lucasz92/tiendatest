import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { shops } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentShop() {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    // Find the user's shop
    let userShops = await db.select().from(shops).where(eq(shops.ownerId, userId));

    if (userShops.length === 0) {
        // If the user doesn't have a shop yet, auto-create a default one
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const newShops = await db.insert(shops).values({
            ownerId: userId,
            name: "Mi Tienda",
            slug: `tienda-${randomSuffix}`,
        }).returning();

        return newShops[0];
    }

    return userShops[0];
}
