import { Providers } from "@/lib/react-query";
import { Toaster } from "@/components/ui/sonner";

import { UserButton } from "@clerk/nextjs";
import { getCurrentShop } from "@/lib/auth";
import { Store, ShoppingCart, Settings, ExternalLink, Menu } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const shop = await getCurrentShop();

    if (!shop) {
        redirect("/sign-in");
    }

    return (
        <Providers>
            <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
                <div className="flex h-screen">
                    {/* Desktop Sidebar */}
                    <aside className="w-64 flex-shrink-0 border-r border-zinc-200 bg-white hidden md:flex flex-col shadow-sm z-10">
                        <div className="flex h-16 items-center border-b border-zinc-100 px-6">
                            <span className="font-extrabold text-xl tracking-tight text-zinc-900">TiendaFácil <span className="text-zinc-400 font-medium text-sm ml-1">Admin</span></span>
                        </div>
                        <nav className="flex-1 overflow-auto py-6">
                            <div className="px-4 space-y-1.5">
                                <Link href="/dashboard/inventory" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-600 font-medium transition-all hover:bg-zinc-100 hover:text-zinc-900">
                                    <Store className="h-4 w-4" />
                                    Inventario
                                </Link>
                                <Link href="/dashboard/orders" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-600 font-medium transition-all hover:bg-zinc-100 hover:text-zinc-900">
                                    <ShoppingCart className="h-4 w-4" />
                                    Pedidos
                                </Link>
                                <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-600 font-medium transition-all hover:bg-zinc-100 hover:text-zinc-900">
                                    <Settings className="h-4 w-4" />
                                    Configuración
                                </Link>
                            </div>
                        </nav>
                        <div className="mt-auto p-4 border-t border-zinc-100 space-y-4 bg-zinc-50/50">
                            <Link href={`/${shop.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full gap-2 rounded-lg bg-zinc-900 text-white px-3 py-2.5 text-sm font-semibold transition-all hover:bg-zinc-800 shadow-sm">
                                <ExternalLink className="h-4 w-4" />
                                Ver mi Tienda
                            </Link>
                            <div className="flex items-center gap-3 px-2">
                                <UserButton afterSignOutUrl="/" />
                                <span className="text-sm font-bold text-zinc-800 truncate">{shop.name}</span>
                            </div>
                        </div>
                    </aside>

                    {/* Main Workspace Area (Wraps Header and Main Content) */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-50">

                        {/* Mobile Header */}
                        <header className="flex h-16 items-center justify-start border-b border-zinc-200 bg-white px-2 md:hidden flex-shrink-0 z-20 shadow-sm">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 mr-2">
                                        <Menu className="h-6 w-6" />
                                        <span className="sr-only">Toggle navigation menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[280px] flex flex-col p-0 bg-white">
                                    <SheetHeader className="p-5 border-b border-zinc-100 text-left bg-zinc-50/50">
                                        <SheetTitle className="font-extrabold text-xl tracking-tight text-zinc-900">TiendaFácil <span className="text-zinc-400 font-medium text-sm ml-1">Admin</span></SheetTitle>
                                    </SheetHeader>
                                    <nav className="flex-1 overflow-auto py-6">
                                        <div className="px-4 space-y-1.5">
                                            <Link href="/dashboard/inventory" className="flex items-center gap-3 rounded-lg px-3 py-3 text-zinc-600 font-medium transition-all hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-100">
                                                <Store className="h-5 w-5" />
                                                Inventario
                                            </Link>
                                            <Link href="/dashboard/orders" className="flex items-center gap-3 rounded-lg px-3 py-3 text-zinc-600 font-medium transition-all hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-100">
                                                <ShoppingCart className="h-5 w-5" />
                                                Pedidos
                                            </Link>
                                            <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-3 text-zinc-600 font-medium transition-all hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-100">
                                                <Settings className="h-5 w-5" />
                                                Configuración
                                            </Link>
                                        </div>
                                    </nav>
                                    <div className="mt-auto p-5 border-t border-zinc-100 space-y-5 bg-zinc-50/50">
                                        <Link href={`/${shop.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full gap-2 rounded-lg bg-zinc-900 text-white px-3 py-3 text-sm font-semibold transition-all shadow-sm">
                                            <ExternalLink className="h-4 w-4" />
                                            Ver mi Tienda
                                        </Link>
                                        <div className="flex items-center gap-3 px-2">
                                            <UserButton afterSignOutUrl="/" />
                                            <span className="text-sm font-bold text-zinc-800 truncate">{shop.name}</span>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-lg tracking-tight text-zinc-900">TiendaFácil</span>
                            </div>
                        </header>

                        {/* Page Content */}
                        <main className="flex-1 overflow-x-hidden overflow-y-auto">
                            {children}
                        </main>

                    </div>
                </div>
            </div>
            <Toaster />
        </Providers>
    );
}
