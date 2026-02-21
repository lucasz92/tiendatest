import { NextResponse } from "next/server";
import { db } from "@/db";
import { shops } from "@/db/schema";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const allShops = await db.select().from(shops);
        return NextResponse.json(allShops);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
