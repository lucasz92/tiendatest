import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // shopSlug actually, it's called id in some routes, let's just receive what it is
) {
    try {
        const { id: shopIdStr } = await params;
        const shopId = parseInt(shopIdStr);

        if (isNaN(shopId)) {
            return new NextResponse("Invalid Shop ID", { status: 400 });
        }

        const body = await request.json();
        const { code, cartTotal } = body;

        if (!code || typeof cartTotal !== "number") {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const normalizedCode = code.toUpperCase().trim();

        // Find the coupon
        const [coupon] = await db
            .select()
            .from(coupons)
            .where(and(
                eq(coupons.shopId, shopId),
                eq(coupons.code, normalizedCode)
            ));

        if (!coupon) {
            return NextResponse.json({ valid: false, error: "El código ingresado no existe." }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ valid: false, error: "Este código ya no está activo." }, { status: 400 });
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return NextResponse.json({ valid: false, error: "Este código ha vencido." }, { status: 400 });
        }

        if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
            return NextResponse.json({ valid: false, error: "El código ha alcanzado su límite de usos." }, { status: 400 });
        }

        if (coupon.minAmount && cartTotal < coupon.minAmount) {
            return NextResponse.json({ valid: false, error: `Este cupón requiere una compra mínima de $${coupon.minAmount}.` }, { status: 400 });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (coupon.type === "percentage") {
            discountAmount = Math.round(cartTotal * (coupon.value / 100));
        } else if (coupon.type === "fixed") {
            discountAmount = coupon.value;
            // Don't discount more than the cart total
            if (discountAmount > cartTotal) {
                discountAmount = cartTotal;
            }
        }

        return NextResponse.json({
            valid: true,
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discountAmount: discountAmount
        });

    } catch (error) {
        console.error("[VALIDATE_COUPON]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
