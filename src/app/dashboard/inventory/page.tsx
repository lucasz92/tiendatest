"use client";

import { useQuery } from "@tanstack/react-query";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { AddProductModal } from "@/components/add-product-modal";
import { ProductActions } from "@/components/product-actions";

type Product = {
    id: number;
    name: string;
    price: number;
    stock: number;
    imageUrl?: string | null;
};

const columns = [
    {
        accessorKey: "name",
        header: "Producto",
    },
    {
        accessorKey: "price",
        header: "Precio",
        cell: ({ row }: any) => {
            const amount = parseFloat(row.getValue("price"));
            const formatted = new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
            }).format(amount);
            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: "stock",
        header: "Stock",
    },
    {
        id: "actions",
        cell: ({ row }: any) => {
            const product = row.original;
            return <ProductActions product={product} />;
        },
    },
];

export default function InventoryPage() {
    const { data: products = [], isLoading, isError } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const res = await fetch("/api/products");
            if (!res.ok) throw new Error("Failed to fetch products");
            return res.json() as Promise<Product[]>;
        },
    });

    const table = useReactTable({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Inventario</h2>
                    <p className="text-muted-foreground">
                        Gestioná tus productos y controlá el stock.
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <AddProductModal />
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <Table className="min-w-[600px]">
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
                                        Cargando productos...
                                    </TableCell>
                                </TableRow>
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-red-500">
                                        Error al cargar el inventario.
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
                                        No tenés productos cargados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
