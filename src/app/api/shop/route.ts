import { NextResponse } from "next/server";
import { db } from "@/db";
import { shops, shopSettings } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { getCurrentShop } from "@/lib/auth";

export async function PUT(request: Request) {
    try {
        const shop = await getCurrentShop();
        if (!shop) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { name, slug } = body;

        if (!name || !slug) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        // Validate slug formatting (lowercase, no spaces, no special chars)
        const slugPattern = /^[a-z0-9-]+$/;
        if (!slugPattern.test(slug)) {
            return new NextResponse("Invalid slug format", { status: 400 });
        }

        // Check if slug is already taken by another shop
        const existingShop = await db
            .select()
            .from(shops)
            .where(and(eq(shops.slug, slug), ne(shops.id, shop.id)));

        if (existingShop.length > 0) {
            return new NextResponse("Slug is already in use", { status: 409 });
        }

        const updatedShop = await db
            .update(shops)
            .set({
                name,
                slug,
            })
            .where(eq(shops.id, shop.id))
            .returning();

        const settingsPayload = {
            shopId: shop.id,
            mpAccessToken: body.mpAccessToken || null,
            mpPublicKey: body.mpPublicKey || null,
            heroImage: body.heroImage || null,
            whatsappNumber: body.whatsappNumber || null,
            whatsappMessage: body.whatsappMessage || null,
            metaPixelId: body.metaPixelId || null,
            seoTitle: body.seoTitle || null,
            seoDescription: body.seoDescription || null,
            socialLinks: body.socialLinks || {},
            telegramBotToken: body.telegramBotToken || null,
            telegramChatId: body.telegramChatId || null,
            telegramLowStockThreshold: body.telegramLowStockThreshold ? parseInt(body.telegramLowStockThreshold) : null,
        };

        await db.insert(shopSettings)
            .values(settingsPayload)
            .onConflictDoUpdate({
                target: shopSettings.shopId,
                set: {
                    mpAccessToken: settingsPayload.mpAccessToken,
                    mpPublicKey: settingsPayload.mpPublicKey,
                    heroImage: settingsPayload.heroImage,
                    whatsappNumber: settingsPayload.whatsappNumber,
                    whatsappMessage: settingsPayload.whatsappMessage,
                    metaPixelId: settingsPayload.metaPixelId,
                    seoTitle: settingsPayload.seoTitle,
                    seoDescription: settingsPayload.seoDescription,
                    socialLinks: settingsPayload.socialLinks,
                    telegramBotToken: settingsPayload.telegramBotToken,
                    telegramChatId: settingsPayload.telegramChatId,
                    telegramLowStockThreshold: settingsPayload.telegramLowStockThreshold,
                }
            });

        return NextResponse.json(updatedShop[0]);
    } catch (error) {
        console.error("Error updating shop:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
