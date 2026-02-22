import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentShop } from "@/lib/auth";

export async function GET() {
    try {
        const shop = await getCurrentShop();
        if (!shop) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const allProducts = await db
            .select()
            .from(products)
            .where(eq(products.shopId, shop.id));

        return NextResponse.json(allProducts);
    } catch (error) {
        console.error("Error fetching products:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const shop = await getCurrentShop();
        if (!shop) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { name, price, stock, imageUrl, images, description, variants } = body;

        if (!name || isNaN(price)) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        // images[] is the source of truth; imageUrl = first image for backward compat
        const imagesList: string[] = Array.isArray(images) ? images : (imageUrl ? [imageUrl] : []);
        const mainImageUrl = imagesList[0] || imageUrl || null;

        const newProduct = await db
            .insert(products)
            .values({
                shopId: shop.id,
                name,
                description: description || null,
                price,
                stock: stock || 0,
                imageUrl: mainImageUrl,
                images: imagesList,
                variants: variants || [],
            })
            .returning();

        return NextResponse.json(newProduct[0]);
    } catch (error) {
        console.error("Error creating product:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
