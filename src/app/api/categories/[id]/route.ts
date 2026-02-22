import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { shops, categories, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        const shopData = await db.select().from(shops).where(eq(shops.ownerId, userId));
        if (shopData.length === 0) {
            return new NextResponse("Tienda no encontrada", { status: 404 });
        }
        const shop = shopData[0];

        // Ensure category belongs to shop
        const categoryData = await db
            .select()
            .from(categories)
            .where(and(eq(categories.id, parseInt(id)), eq(categories.shopId, shop.id)));

        if (categoryData.length === 0) {
            return new NextResponse("Categoría no encontrada o no te pertenece", { status: 404 });
        }

        await db.delete(categories).where(eq(categories.id, parseInt(id)));

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[CATEGORY_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return new NextResponse("El nombre es requerido", { status: 400 });
        }

        const shopData = await db.select().from(shops).where(eq(shops.ownerId, userId));
        if (shopData.length === 0) {
            return new NextResponse("Tienda no encontrada", { status: 404 });
        }
        const shop = shopData[0];

        // Ensure category belongs to shop
        const categoryData = await db
            .select()
            .from(categories)
            .where(and(eq(categories.id, parseInt(id)), eq(categories.shopId, shop.id)));

        if (categoryData.length === 0) {
            return new NextResponse("Categoría no encontrada o no te pertenece", { status: 404 });
        }

        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const [updatedCategory] = await db
            .update(categories)
            .set({ name, slug })
            .where(eq(categories.id, parseInt(id)))
            .returning();

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error("[CATEGORY_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
