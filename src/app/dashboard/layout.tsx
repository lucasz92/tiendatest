import { Providers } from "@/lib/react-query";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@clerk/nextjs/server";
import { getCurrentShop } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const shop = await getCurrentShop();
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!shop) redirect("/sign-in");

    // Pass shop data with only serializable fields to Client component
    const shopData = {
        name: shop.name,
        slug: shop.slug,
    };

    return (
        <Providers>
            <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
                <div className="flex h-screen">
                    <DashboardShell shop={shopData} role={role}>
                        {children}
                    </DashboardShell>
                </div>
            </div>
            <Toaster />
        </Providers>
    );
}
