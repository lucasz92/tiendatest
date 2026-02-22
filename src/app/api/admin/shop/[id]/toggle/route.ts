import { NextResponse } from "next/server";
import { db } from "@/db";
import { shopSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        if (role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const shopId = parseInt(id);

        if (isNaN(shopId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }

        // Fetch current status
        const currentData = await db.select().from(shopSettings).where(eq(shopSettings.shopId, shopId));
        let isActive = true;

        if (currentData.length === 0) {
            // No settings yet, create them and set to suspended (isActive false because we toggle it)
            await db.insert(shopSettings).values({
                shopId,
                isActive: false,
            });
            isActive = false;
        } else {
            // Toggle
            const newStatus = !(currentData[0].isActive ?? true);
            await db.update(shopSettings)
                .set({ isActive: newStatus })
                .where(eq(shopSettings.shopId, shopId));
            isActive = newStatus;
        }

        return NextResponse.json({ success: true, isActive });
    } catch (error) {
        console.error("Error toggling shop status:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
