import { Providers } from "@/lib/react-query";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { getCurrentShop } from "@/lib/auth";
import {
    LayoutDashboard, Store, ShoppingCart, Settings,
    ExternalLink, Menu, ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { headers } from "next/headers";

const navItems = [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/inventory", label: "Inventario", icon: Store },
    { href: "/dashboard/orders", label: "Pedidos", icon: ShoppingCart },
    { href: "/dashboard/settings", label: "Configuración", icon: Settings },
];

function NavLink({
    href, label, icon: Icon, pathname, exact = false, mobile = false,
}: {
    href: string; label: string; icon: React.ElementType;
    pathname: string; exact?: boolean; mobile?: boolean;
}) {
    const active = exact ? pathname === href : pathname.startsWith(href);
    const base = mobile
        ? "flex items-center gap-3 rounded-xl px-3 py-3 font-medium transition-all"
        : "flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-all text-sm";

    return (
        <Link
            href={href}
            className={`${base} ${active
                    ? "bg-amber-50 text-amber-900 font-semibold"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                }`}
        >
            <Icon className={`${mobile ? "h-5 w-5" : "h-4 w-4"} shrink-0 ${active ? "text-amber-700" : ""}`} />
            {label}
            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-700" />}
        </Link>
    );
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const shop = await getCurrentShop();
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!shop) redirect("/sign-in");

    // Get pathname server-side from headers
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || "/dashboard";

    const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
        <>
            <nav className="flex-1 overflow-auto py-5">
                <div className="px-3 space-y-1">
                    {navItems.map(item => (
                        <NavLink key={item.href} {...item} pathname={pathname} mobile={mobile} />
                    ))}
                    {role === "admin" && (
                        <Link
                            href="/admin"
                            className={`flex items-center gap-3 rounded-xl px-3 ${mobile ? "py-3" : "py-2.5"} text-sm font-medium text-blue-600 hover:bg-blue-50 mt-3 transition-all`}
                        >
                            <ShieldAlert className={`${mobile ? "h-5 w-5" : "h-4 w-4"} shrink-0`} />
                            Super Admin
                        </Link>
                    )}
                </div>
            </nav>
            <div className="p-3 border-t border-stone-100 space-y-3">
                <Link
                    href={`/${shop.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full gap-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white px-3 py-2.5 text-sm font-semibold transition-all shadow-sm"
                >
                    <ExternalLink className="h-4 w-4" />
                    Ver mi Tienda
                </Link>
                <div className="flex items-center gap-3 px-1 py-1">
                    <UserButton afterSignOutUrl="/" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-stone-800 truncate">{shop.name}</span>
                        <span className="text-xs text-stone-400 truncate">Panel de control</span>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <Providers>
            <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
                <div className="flex h-screen">

                    {/* Desktop Sidebar */}
                    <aside className="w-60 flex-shrink-0 border-r border-stone-200 bg-white hidden md:flex flex-col shadow-sm z-10">
                        <div className="flex h-16 items-center border-b border-stone-100 px-5 gap-2.5">
                            <div className="w-7 h-7 bg-amber-800 rounded-lg flex items-center justify-center shrink-0">
                                <Store className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="font-bold text-base tracking-tight text-stone-900">
                                TiendaFácil
                                <span className="text-stone-400 font-normal text-xs ml-1.5">Admin</span>
                            </span>
                        </div>
                        <SidebarContent />
                    </aside>

                    {/* Main area */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                        {/* Mobile Header */}
                        <header className="flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4 md:hidden flex-shrink-0 z-20 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                                            <Menu className="h-5 w-5" />
                                            <span className="sr-only">Menú</span>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[270px] flex flex-col p-0 bg-white">
                                        <SheetHeader className="px-5 py-4 border-b border-stone-100 text-left">
                                            <SheetTitle className="flex items-center gap-2.5 font-bold text-base">
                                                <div className="w-7 h-7 bg-amber-800 rounded-lg flex items-center justify-center shrink-0">
                                                    <Store className="h-3.5 w-3.5 text-white" />
                                                </div>
                                                TiendaFácil <span className="text-stone-400 font-normal text-xs ml-0.5">Admin</span>
                                            </SheetTitle>
                                        </SheetHeader>
                                        <SidebarContent mobile />
                                    </SheetContent>
                                </Sheet>
                                <span className="font-bold text-stone-900">{shop.name}</span>
                            </div>
                            <UserButton afterSignOutUrl="/" />
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
