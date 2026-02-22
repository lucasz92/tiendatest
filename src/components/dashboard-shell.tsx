"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Store, ShoppingCart, Settings, ExternalLink, Menu, ShieldAlert, Ticket, ListFilter } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const navItems = [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/inventory", label: "Inventario", icon: Store },
    { href: "/dashboard/categories", label: "Categorías", icon: ListFilter },
    { href: "/dashboard/orders", label: "Pedidos", icon: ShoppingCart },
    { href: "/dashboard/coupons", label: "Cupones", icon: Ticket },
    { href: "/dashboard/settings", label: "Configuración", icon: Settings },
];

export function DashboardShell({
    children,
    shop,
    role
}: {
    children: React.ReactNode;
    shop: { name: string; slug: string };
    role: string | undefined;
}) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Cerrar el menú del celular automáticamente al cambiar de ruta
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
        <>
            <div className="px-4 py-3 mx-3 mt-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-gray-700 font-bold text-sm">{shop.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{shop.name}</p>
                        <p className="text-xs text-gray-400 truncate">Panel de control</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-auto py-4 px-3 space-y-0.5">
                {navItems.map(item => {
                    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all text-sm ${active
                                ? "bg-gray-100 text-gray-900 font-semibold"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                        >
                            <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-gray-700" : "text-gray-400"}`} />
                            {item.label}
                        </Link>
                    )
                })}
                {role === "admin" && (
                    <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-all mt-2">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        Super Admin
                    </Link>
                )}
            </nav>

            <div className="p-3 border-t border-gray-100 space-y-2">
                <Link
                    href={`/${shop.slug}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center w-full gap-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-all"
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver mi Tienda
                </Link>
                <div className="flex items-center gap-2.5 px-2 py-1">
                    <UserButton afterSignOutUrl="/" />
                    <span className="text-xs text-gray-400 truncate">Mi cuenta</span>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-56 flex-shrink-0 border-r border-gray-200 bg-white hidden md:flex flex-col">
                <div className="flex h-14 items-center border-b border-gray-100 px-4">
                    <span className="font-bold text-sm text-gray-900 tracking-tight">
                        TiendaFácil <span className="text-gray-400 font-normal text-xs ml-1.5">Admin</span>
                    </span>
                </div>
                <SidebarContent />
            </aside>

            {/* Main area + Mobile Header */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden flex-shrink-0 shadow-sm z-10 w-full relative">
                    <div className="flex items-center gap-2">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[260px] flex flex-col p-0 bg-white">
                                <SheetHeader className="px-4 py-3.5 border-b border-gray-100 text-left">
                                    <SheetTitle className="font-bold text-sm text-gray-900">
                                        TiendaFácil <span className="text-gray-400 font-normal text-xs ml-1">Admin</span>
                                    </SheetTitle>
                                </SheetHeader>
                                <SidebarContent mobile />
                            </SheetContent>
                        </Sheet>
                        <span className="font-semibold text-gray-900 text-sm">{shop.name}</span>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>
        </>
    );
}
