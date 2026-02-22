import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { shops, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const shopData = await db.select().from(shops).where(eq(shops.ownerId, userId));
        if (shopData.length === 0) {
            return new NextResponse("Tienda no encontrada", { status: 404 });
        }
        const shop = shopData[0];

        const allCategories = await db.select().from(categories).where(eq(categories.shopId, shop.id));

        return NextResponse.json(allCategories);
    } catch (error) {
        console.error("[CATEGORIES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

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

        // Slugify name roughly
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Check for duplicate in shop
        const existingCategory = await db
            .select()
            .from(categories)
            .where(and(eq(categories.shopId, shop.id), eq(categories.slug, slug)));

        if (existingCategory.length > 0) {
            return new NextResponse("Ya existe una categoría con este nombre.", { status: 400 });
        }

        const [newCategory] = await db.insert(categories).values({
            shopId: shop.id,
            name,
            slug
        }).returning();

        return NextResponse.json(newCategory);
    } catch (error) {
        console.error("[CATEGORIES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
