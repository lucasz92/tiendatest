import { redirect } from "next/navigation";
import { getCurrentShop } from "@/lib/auth";
import { SettingsForm } from "@/components/settings-form";
import { db } from "@/db";
import { shopSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function SettingsPage() {
    const shop = await getCurrentShop();

    if (!shop) {
        redirect("/sign-in");
    }

    const settings = await db.select().from(shopSettings).where(eq(shopSettings.shopId, shop.id));
    const s = settings[0] || {};

    const initialData = {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        mpAccessToken: s.mpAccessToken || "",
        mpPublicKey: s.mpPublicKey || "",
        heroImage: s.heroImage || null,
        whatsappNumber: s.whatsappNumber || "",
        whatsappMessage: s.whatsappMessage || "",
        metaPixelId: s.metaPixelId || "",
        seoTitle: s.seoTitle || "",
        seoDescription: s.seoDescription || "",
        socialLinks: (s.socialLinks as any) || {},
    };

    return (
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
                <p className="text-muted-foreground">
                    Administrá los detalles de tu tienda y preferencias.
                </p>
            </div>

            <SettingsForm initialData={initialData} />
        </div>
    );
}
