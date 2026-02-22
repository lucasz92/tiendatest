"use client";

import { useQuery } from "@tanstack/react-query";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";

import { OrderActions } from "@/components/order-actions";

type Order = {
    id: number;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    trackingCode: string | null;
    shippingAddress: any;
    createdAt: string;
    items: any[];
};

const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" | "canceled" | "returned" }> = {
    pending: { label: "Pendiente", variant: "secondary" },
    paid: { label: "Pagado", variant: "default" },
    processing: { label: "En Preparación", variant: "outline" },
    shipped: { label: "Despachado", variant: "default" },
    delivered: { label: "Entregado", variant: "default" },
    canceled: { label: "Cancelado", variant: "canceled" },
    returned: { label: "Devuelto", variant: "returned" },
};

const columns = [
    {
        accessorKey: "id",
        header: "Nro. Pedido",
        cell: ({ row }: any) => <span className="font-bold">#{row.getValue("id")}</span>,
    },
    {
        accessorKey: "createdAt",
        header: "Fecha",
        cell: ({ row }: any) => new Date(row.getValue("createdAt")).toLocaleDateString("es-AR"),
    },
    {
        accessorKey: "customerName",
        header: "Cliente",
        cell: ({ row }: any) => (
            <div>
                <div className="font-medium">{row.getValue("customerName")}</div>
                <div className="text-xs text-muted-foreground">{row.original.customerEmail}</div>
            </div>
        )
    },
    {
        accessorKey: "shippingAddress",
        header: "Envío",
        cell: ({ row }: any) => {
            const addr = row.getValue("shippingAddress");
            if (!addr) return <span className="text-muted-foreground italic">Retiro / Acordar</span>;
            return (
                <div className="text-sm">
                    {addr.calle && <div>{addr.calle}</div>}
                    <div className="text-xs text-muted-foreground">{addr.ciudad}, {addr.provincia} ({addr.cp})</div>
                    {row.original.trackingCode && (
                        <div className="mt-1 text-xs font-mono bg-muted inline-block px-1 rounded">TRK: {row.original.trackingCode}</div>
                    )}
                </div>
            )
        },
    },
    {
        id: "items",
        header: "Artículos",
        cell: ({ row }: any) => {
            const items = row.original.items || [];
            return (
                <div className="flex flex-col gap-1 text-sm max-w-[250px]">
                    {items.map((it: any, i: number) => {
                        const hasVariants = it.variants && Object.keys(it.variants).length > 0;
                        const variantsStr = hasVariants
                            ? Object.entries(it.variants).map(([k, v]) => `${k}: ${v}`).join(', ')
                            : '';
                        return (
                            <div key={i} className="flex flex-col border-b border-zinc-100 last:border-0 pb-1 last:pb-0">
                                <div><span className="font-semibold">{it.quantity}x</span> <span className="text-zinc-700 font-medium">{it.productName || 'Producto Eliminado'}</span></div>
                                {hasVariants && <div className="text-xs text-amber-600/90 font-medium bg-amber-50 self-start px-1.5 rounded">{variantsStr}</div>}
                            </div>
                        );
                    })}
                </div>
            )
        }
    },
    {
        accessorKey: "totalAmount",
        header: "Total",
        cell: ({ row }: any) => {
            const amount = parseFloat(row.getValue("totalAmount"));
            const formatted = new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
            }).format(amount);
            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }: any) => {
            const status = row.getValue("status") as string;
            const config = statusMap[status] || { label: status, variant: "secondary" };

            // We apply standard variants or custom classes for the new ones
            const isCanceled = config.variant === "canceled";
            const isReturned = config.variant === "returned";

            if (isCanceled) return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">{config.label}</Badge>;
            if (isReturned) return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-none">{config.label}</Badge>;

            return <Badge variant={config.variant as any}>{config.label}</Badge>;
        },
    },
    {
        id: "actions",
        cell: ({ row }: any) => {
            const order = row.original;
            return <OrderActions order={order} />;
        },
    },
];

export default function OrdersPage() {
    const { data: orders = [], isLoading, isError } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const res = await fetch("/api/orders");
            if (!res.ok) throw new Error("Failed to fetch orders");
            return res.json() as Promise<Order[]>;
        },
    });

    const [activeTab, setActiveTab] = useState("all");

    const filteredOrders = useMemo(() => {
        if (activeTab === "all") return orders;
        if (activeTab === "paid") return orders.filter(o => o.status === "paid" || o.status === "processing");
        if (activeTab === "pending") return orders.filter(o => o.status === "pending");
        if (activeTab === "shipped") return orders.filter(o => o.status === "shipped" || o.status === "delivered");
        if (activeTab === "canceled") return orders.filter(o => o.status === "canceled" || o.status === "returned");
        return orders;
    }, [orders, activeTab]);

    const table = useReactTable({
        data: filteredOrders,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestor de Pedidos</h2>
                    <p className="text-muted-foreground">
                        Revisá tus nuevos pedidos, armá los paquetes y cargá los envíos.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4 bg-gray-100/80 p-1">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="paid">Por Preparar</TabsTrigger>
                    <TabsTrigger value="pending">No Pagados</TabsTrigger>
                    <TabsTrigger value="shipped">Despachados</TabsTrigger>
                    <TabsTrigger value="canceled">Cancelados / Devueltos</TabsTrigger>
                </TabsList>

                <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[800px]">
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            Cargando pedidos...
                                        </TableCell>
                                    </TableRow>
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center text-red-500">
                                            Error al cargar tus pedidos.
                                        </TableCell>
                                    </TableRow>
                                ) : table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                            Todavía no recibiste ningún pedido.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
