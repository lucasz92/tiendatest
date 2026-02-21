import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentShop } from "@/lib/auth";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const shop = await getCurrentShop();
        if (!shop) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const productId = parseInt(id);

        if (isNaN(productId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }

        await db
            .delete(products)
            .where(
                and(eq(products.id, productId), eq(products.shopId, shop.id))
            );

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting product:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const shop = await getCurrentShop();
        if (!shop) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const productId = parseInt(id);

        if (isNaN(productId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }

        const body = await request.json();
        const { name, price, stock, imageUrl, description } = body;

        const updatedProduct = await db
            .update(products)
            .set({
                name,
                description: description || null,
                price,
                stock,
                imageUrl,
            })
            .where(
                and(eq(products.id, productId), eq(products.shopId, shop.id))
            )
            .returning();

        if (!updatedProduct.length) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(updatedProduct[0]);
    } catch (error) {
        console.error("Error updating product:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
