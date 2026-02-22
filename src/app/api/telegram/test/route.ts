import { NextResponse } from "next/server";
import { getCurrentShop } from "@/lib/auth";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(request: Request) {
    try {
        const shop = await getCurrentShop();
        if (!shop) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { botToken, chatId } = body;

        if (!botToken || !chatId) {
            return new NextResponse("Missing Bot Token or Chat ID", { status: 400 });
        }

        const msg = `👋 <b>¡Hola desde TiendaFácil!</b>\n\nEste es un mensaje de prueba para <b>${shop.name}</b>.\nLas notificaciones de Telegram están configuradas correctamente ✅`;

        await sendTelegramMessage(botToken, chatId, msg);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[TELEGRAM_TEST_ERROR]", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
