"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { CategoryDialog } from "@/components/category-dialog";

type Category = {
    id: number;
    name: string;
    slug: string;
};

export default function CategoriesPage() {
    const queryClient = useQueryClient();

    const { data: categories = [], isLoading, isError } = useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await fetch("/api/categories");
            if (!res.ok) throw new Error("Failed to fetch categories");
            return res.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Error al eliminar");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Categoría eliminada exitosamente");
        },
        onError: (err: any) => {
            toast.error(err.message || "No se pudo eliminar la categoría");
        }
    });

    return (
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Categorías</h2>
                    <p className="text-zinc-500 mt-1">
                        Creá y gestioná las categorías para organizar tu tienda.
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <CategoryDialog />
                </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <Table className="min-w-[600px]">
                        <TableHeader className="bg-zinc-50/80">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-semibold text-zinc-900 w-[80px]">ID</TableHead>
                                <TableHead className="font-semibold text-zinc-900">Nombre</TableHead>
                                <TableHead className="font-semibold text-zinc-900">Slug</TableHead>
                                <TableHead className="font-semibold text-zinc-900 text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center text-zinc-500">
                                        Cargando categorías...
                                    </TableCell>
                                </TableRow>
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center text-red-500 font-medium">
                                        Error al cargar las categorías.
                                    </TableCell>
                                </TableRow>
                            ) : categories.length ? (
                                categories.map((c) => (
                                    <TableRow key={c.id} className="group hover:bg-zinc-50/50 transition-colors">
                                        <TableCell className="text-zinc-500 font-mono text-sm">#{c.id}</TableCell>
                                        <TableCell className="font-medium text-zinc-900">{c.name}</TableCell>
                                        <TableCell className="text-zinc-500">
                                            <span className="bg-zinc-100 px-2 py-1 rounded text-xs font-mono">{c.slug}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <CategoryDialog
                                                    categoryToEdit={{ id: c.id, name: c.name }}
                                                    trigger={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => {
                                                        if (window.confirm(`¿Estás seguro de eliminar la categoría ${c.name}?`)) {
                                                            deleteMutation.mutate(c.id);
                                                        }
                                                    }}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center text-zinc-500">
                                            <p className="mb-2">No tenés categorías cargadas.</p>
                                        </div>
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
