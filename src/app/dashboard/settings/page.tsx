import { redirect } from "next/navigation";
import { getCurrentShop } from "@/lib/auth";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
    const shop = await getCurrentShop();

    if (!shop) {
        redirect("/sign-in");
    }

    return (
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
                <p className="text-muted-foreground">
                    Administrá los detalles de tu tienda y preferencias.
                </p>
            </div>

            <SettingsForm initialData={shop} />
        </div>
    );
}
