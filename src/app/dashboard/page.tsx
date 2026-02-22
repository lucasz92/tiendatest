import { redirect } from "next/navigation";
import { getCurrentShop } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, products, shops } from "@/db/schema";
import { eq, sql, and, gte, inArray } from "drizzle-orm";
import Link from "next/link";
import {
    Package, ShoppingCart, TrendingUp, AlertTriangle,
    DollarSign, BarChart3, ArrowRight, Plus, Settings, ExternalLink, Clock
} from "lucide-react";

const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);

export default async function DashboardPage() {
    const shop = await getCurrentShop();
    if (!shop) redirect("/sign-in");

    // ── Date helpers ────────────────────────────────────────────
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // ── Parallel DB queries ──────────────────────────────────────
    const [
        allProducts,
        allOrdersThisMonth,
        recentOrders,
    ] = await Promise.all([
        db.select({
            id: products.id,
            name: products.name,
            price: products.price,
            stock: products.stock,
        }).from(products).where(eq(products.shopId, shop.id)),

        db.select({
            id: orders.id,
            totalAmount: orders.totalAmount,
            status: orders.status,
        }).from(orders).where(
            and(
                eq(orders.shopId, shop.id),
                gte(orders.createdAt, startOfMonth)
            )
        ),

        db.select({
            id: orders.id,
            customerName: orders.customerName,
            totalAmount: orders.totalAmount,
            status: orders.status,
            createdAt: orders.createdAt,
        }).from(orders)
            .where(eq(orders.shopId, shop.id))
            .orderBy(sql`${orders.createdAt} desc`)
            .limit(5),
    ]);

    // ── Computed KPIs ────────────────────────────────────────────
    const totalProducts = allProducts.length;
    const totalStock = allProducts.reduce((acc, p) => acc + (p.stock ?? 0), 0);
    const stockValue = allProducts.reduce((acc, p) => acc + (p.price * (p.stock ?? 0)), 0);
    const outOfStock = allProducts.filter(p => (p.stock ?? 0) === 0).length;

    const paidStatuses = ["paid", "processing", "shipped", "delivered"];
    const ordersThisMonth = allOrdersThisMonth.length;
    const revenueThisMonth = allOrdersThisMonth
        .filter(o => paidStatuses.includes(o.status ?? ""))
        .reduce((acc, o) => acc + (o.totalAmount ?? 0), 0);

    // ── Status styles ────────────────────────────────────────────
    const statusStyles: Record<string, { label: string; cls: string }> = {
        pending: { label: "Pendiente", cls: "bg-amber-100 text-amber-800" },
        paid: { label: "Pagado", cls: "bg-emerald-100 text-emerald-800" },
        processing: { label: "En preparación", cls: "bg-blue-100 text-blue-800" },
        shipped: { label: "Despachado", cls: "bg-purple-100 text-purple-800" },
        delivered: { label: "Entregado", cls: "bg-stone-100 text-stone-700" },
        cancelled: { label: "Cancelado", cls: "bg-red-100 text-red-700" },
    };

    const kpis = [
        {
            icon: Package,
            label: "Productos publicados",
            value: totalProducts.toString(),
            sub: `${outOfStock > 0 ? `${outOfStock} sin stock` : "Todos con stock"}`,
            accent: outOfStock > 0 ? "text-amber-600" : "text-emerald-600",
            iconBg: "bg-gray-100 text-gray-600",
            href: "/dashboard/inventory",
        },
        {
            icon: BarChart3,
            label: "Unidades en stock",
            value: totalStock.toLocaleString("es-AR"),
            sub: "Total acumulado",
            accent: "text-gray-400",
            iconBg: "bg-gray-100 text-gray-600",
            href: "/dashboard/inventory",
        },
        {
            icon: DollarSign,
            label: "Valor del inventario",
            value: formatMoney(stockValue),
            sub: "Precio × unidades",
            accent: "text-gray-400",
            iconBg: "bg-gray-100 text-gray-600",
            href: "/dashboard/inventory",
        },
        {
            icon: ShoppingCart,
            label: "Pedidos este mes",
            value: ordersThisMonth.toString(),
            sub: new Date().toLocaleString("es-AR", { month: "long", year: "numeric" }),
            accent: "text-gray-400",
            iconBg: "bg-gray-100 text-gray-600",
            href: "/dashboard/orders",
        },
        {
            icon: TrendingUp,
            label: "Ingresos este mes",
            value: formatMoney(revenueThisMonth),
            sub: "Pedidos pagados/enviados",
            accent: "text-emerald-600",
            iconBg: "bg-gray-100 text-gray-600",
            href: "/dashboard/orders",
        },
        {
            icon: AlertTriangle,
            label: "Sin stock",
            value: outOfStock.toString(),
            sub: outOfStock > 0 ? "Revisá tu inventario" : "Todo en orden ✓",
            accent: outOfStock > 0 ? "text-amber-600" : "text-emerald-600",
            iconBg: outOfStock > 0 ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500",
            href: "/dashboard/inventory",
        },
    ];

    const quickActions = [
        { label: "Agregar producto", href: "/dashboard/inventory", icon: Plus, primary: true },
        { label: "Ver pedidos", href: "/dashboard/orders", icon: ShoppingCart, primary: false },
        { label: "Configuración", href: "/dashboard/settings", icon: Settings, primary: false },
        { label: "Ir a la tienda", href: `/${shop.slug}`, icon: ExternalLink, primary: false, external: true },
    ];

    return (
        <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">

            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                    Bienvenido 👋
                </h1>
                <p className="text-stone-500 mt-1 text-sm sm:text-base">
                    Acá está el resumen de <span className="font-semibold text-stone-700">{shop.name}</span> al día de hoy.
                </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {kpis.map(({ icon: Icon, label, value, sub, accent, iconBg, href }) => (
                    <Link key={label} href={href}
                        className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-0.5 leading-none">{value}</div>
                        <div className="text-sm text-gray-600 mb-1">{label}</div>
                        <div className={`text-xs font-medium ${accent}`}>{sub}</div>
                    </Link>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Últimos pedidos */}
                <div className="lg:col-span-2 bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                        <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-stone-400" />
                            Últimos pedidos
                        </h2>
                        <Link href="/dashboard/orders"
                            className="text-xs font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
                            Ver todos <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                            <ShoppingCart className="w-10 h-10 text-gray-200 mb-3" />
                            <p className="font-medium text-gray-500">Aún no hay pedidos</p>
                            <p className="text-sm text-gray-400 mt-1">Los nuevos pedidos aparecerán aquí</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {recentOrders.map(order => {
                                const s = statusStyles[order.status ?? "pending"] ?? statusStyles.pending;
                                return (
                                    <div key={order.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/60 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0">
                                                #{order.id}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-stone-900 text-sm truncate">{order.customerName}</p>
                                                <p className="text-xs text-stone-400">
                                                    {new Date(order.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 ml-3">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                                            <span className="font-bold text-stone-800 text-sm">{formatMoney(order.totalAmount)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Accesos rápidos */}
                <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-stone-100">
                        <h2 className="font-semibold text-stone-900">Accesos rápidos</h2>
                    </div>
                    <div className="p-4 space-y-2">
                        {quickActions.map(({ label, href, icon: Icon, primary, external }) => (
                            <Link
                                key={label}
                                href={href}
                                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${primary
                                    ? "bg-stone-900 text-white hover:bg-stone-800 shadow-sm"
                                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                                    }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                {label}
                                {external && <ExternalLink className="w-3 h-3 ml-auto opacity-50" />}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
