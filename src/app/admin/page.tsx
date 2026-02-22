import { db } from "@/db";
import { shops, shopSettings, orders } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, ShoppingBag } from "lucide-react";
import { eq, sql } from "drizzle-orm";
import { AdminShopActions } from "@/components/admin-shop-actions";

export default async function AdminDashboard() {
    // Extra layer of protection in the Server Component
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
        redirect("/dashboard/inventory");
    }

    const allShopsData = await db
        .select({
            id: shops.id,
            name: shops.name,
            slug: shops.slug,
            ownerId: shops.ownerId,
            plan: shops.plan,
            isActive: shopSettings.isActive,
        })
        .from(shops)
        .leftJoin(shopSettings, eq(shops.id, shopSettings.shopId));

    const [totalRevenueData] = await db
        .select({ total: sql<number>`SUM(${orders.totalAmount})` })
        .from(orders)
        .where(eq(orders.status, "paid"));

    const [totalOrdersData] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders);

    const totalRevenue = totalRevenueData?.total || 0;
    const totalOrders = totalOrdersData?.count || 0;
    const formattedRevenue = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(totalRevenue);

    return (
        <div className="min-h-screen bg-muted/40 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Super Admin Panel</h1>
                        <p className="text-muted-foreground">Gestiona todos los clientes (tenants) registrados en la plataforma SaaS.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Tiendas Activas</p>
                            <h3 className="text-2xl font-bold">{allShopsData.length}</h3>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-full">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Ingresos Globales</p>
                            <h3 className="text-2xl font-bold">{formattedRevenue}</h3>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-full">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Órdenes Totales</p>
                            <h3 className="text-2xl font-bold">{totalOrders}</h3>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>ID de Tienda</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Slug (Subdominio)</TableHead>
                                <TableHead>Owner ID (Clerk)</TableHead>
                                <TableHead>Plan Actual</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allShopsData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Todavía no hay tiendas registradas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                allShopsData.map((shop) => (
                                    <TableRow key={shop.id}>
                                        <TableCell className="font-medium text-muted-foreground">#{shop.id}</TableCell>
                                        <TableCell className="font-bold">{shop.name}</TableCell>
                                        <TableCell>
                                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                                                /{shop.slug}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground font-mono">{shop.ownerId}</TableCell>
                                        <TableCell>
                                            <Badge variant={shop.plan === 'pro' ? 'default' : 'secondary'}>
                                                {(shop.plan || 'freemium').toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AdminShopActions
                                                shopId={shop.id}
                                                isActive={shop.isActive ?? true}
                                                shopSlug={shop.slug}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
