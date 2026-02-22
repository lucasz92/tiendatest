import { NextResponse } from "next/server";
import { getCurrentShop } from "@/lib/auth";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const shop = await getCurrentShop();

        if (!shop) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const shopCoupons = await db
            .select()
            .from(coupons)
            .where(eq(coupons.shopId, shop.id))
            .orderBy(desc(coupons.createdAt));

        return NextResponse.json(shopCoupons);
    } catch (error) {
        console.error("[COUPONS_GET]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const shop = await getCurrentShop();

        if (!shop) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { code, type, value, minAmount, maxUses, expiresAt, isActive } = body;

        if (!code || !type || !value) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Normalize code to uppercase
        const normalizedCode = code.toUpperCase().trim();

        // Check if code already exists for this shop
        const existingCoupon = await db
            .select()
            .from(coupons)
            .where(eq(coupons.code, normalizedCode));

        // Note: although codes could theoretically be the same in different shops,
        // it's generally safer to either make them globally unique or check by shopId + code.
        // We will make it unique per shop.
        const shopExistingCoupon = existingCoupon.find(c => c.shopId === shop.id);

        if (shopExistingCoupon) {
            return new NextResponse("Ya existe un cupón con este código.", { status: 400 });
        }

        const [newCoupon] = await db
            .insert(coupons)
            .values({
                shopId: shop.id,
                code: normalizedCode,
                type,
                value: parseInt(value),
                minAmount: minAmount ? parseInt(minAmount) : null,
                maxUses: maxUses ? parseInt(maxUses) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive: isActive ?? true,
            })
            .returning();

        return NextResponse.json(newCoupon);
    } catch (error) {
        console.error("[COUPONS_POST]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
