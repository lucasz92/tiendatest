/**
 * Sends a message via Telegram Bot API.
 * Uses MarkdownV2 — caller should pass pre-escaped text or use sendPlainMessage.
 */
export async function sendTelegramMessage(
    botToken: string,
    chatId: string,
    text: string,
    parseMode: "HTML" | "Markdown" | undefined = "HTML"
): Promise<void> {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: parseMode,
            disable_web_page_preview: true,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("[TELEGRAM] Error sending message:", err);
        throw new Error(`Telegram API error: ${err}`);
    }
}

/**
 * Builds the order notification message (HTML format).
 */
export function buildOrderMessage(
    shopName: string,
    orderId: number,
    customerName: string,
    customerEmail: string,
    items: Array<{ name: string; quantity: number; price: number }>,
    totalAmount: number,
    shippingAddress?: { street?: string; city?: string; province?: string } | null,
    dashboardUrl?: string
): string {
    const currency = (n: number) =>
        new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

    const itemLines = items
        .map(i => `  📦 ${i.quantity}× ${i.name} — ${currency(i.price * i.quantity)}`)
        .join("\n");

    const addressLine = shippingAddress?.city
        ? `\n📍 <b>Envío:</b> ${[shippingAddress.street, shippingAddress.city, shippingAddress.province].filter(Boolean).join(", ")}`
        : "\n📍 <b>Entrega:</b> Retiro / A acordar";

    const dashLink = dashboardUrl
        ? `\n\n<a href="${dashboardUrl}">👉 Ver pedido en el panel</a>`
        : "";

    return (
        `🛒 <b>Nuevo pedido #${orderId}</b> — ${shopName}\n\n` +
        `👤 <b>${customerName}</b> (${customerEmail})\n\n` +
        `${itemLines}\n\n` +
        `💰 <b>Total: ${currency(totalAmount)}</b>` +
        addressLine +
        dashLink
    );
}

/**
 * Builds a low-stock alert message (HTML format).
 */
export function buildLowStockMessage(
    shopName: string,
    alerts: Array<{ name: string; stock: number }>,
    dashboardUrl?: string
): string {
    const lines = alerts.map(p => `  ⚠️ <b>${p.name}</b>: ${p.stock} unidad${p.stock === 1 ? "" : "es"} restante${p.stock === 1 ? "" : "s"}`).join("\n");
    const link = dashboardUrl ? `\n\n<a href="${dashboardUrl}">👉 Ver inventario</a>` : "";
    return `📉 <b>Stock bajo</b> — ${shopName}\n\n${lines}${link}`;
}
