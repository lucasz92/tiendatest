import { NextResponse } from "next/server";
import { getCurrentShop } from "@/lib/auth";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
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
        const { isActive } = body;

        const [updatedCoupon] = await db
            .update(coupons)
            .set({ isActive })
            .where(and(
                eq(coupons.id, parseInt(id)),
                eq(coupons.shopId, shop.id)
            ))
            .returning();

        if (!updatedCoupon) {
            return new NextResponse("Coupon not found or unauthorized", { status: 404 });
        }

        return NextResponse.json(updatedCoupon);
    } catch (error) {
        console.error("[COUPONS_PATCH]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const shop = await getCurrentShop();

        if (!shop) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const [deletedCoupon] = await db
            .delete(coupons)
            .where(and(
                eq(coupons.id, parseInt(id)),
                eq(coupons.shopId, shop.id)
            ))
            .returning();

        if (!deletedCoupon) {
            return new NextResponse("Coupon not found or unauthorized", { status: 404 });
        }

        return NextResponse.json(deletedCoupon);
    } catch (error) {
        console.error("[COUPONS_DELETE]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
