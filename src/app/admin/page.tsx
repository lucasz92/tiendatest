import { db } from "@/db";
import { shops } from "@/db/schema";
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
import Link from "next/link";
import { Building2, ExternalLink } from "lucide-react";

export default async function AdminDashboard() {
    // Extra layer of protection in the Server Component
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
        redirect("/dashboard/inventory");
    }

    const allShops = await db.select().from(shops);

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
                            {allShops.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Todavía no hay tiendas registradas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                allShops.map((shop) => (
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
                                            <Link
                                                href={`/${shop.slug}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                            >
                                                Visitar
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
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
