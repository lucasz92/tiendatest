"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Ticket, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CouponDialog } from "@/components/coupon-dialog";

export type Coupon = {
    id: number;
    code: string;
    type: "percentage" | "fixed";
    value: number;
    minAmount: number | null;
    maxUses: number | null;
    usesCount: number;
    expiresAt: string | null;
    isActive: boolean;
    createdAt: string;
};

export default function CouponsPage() {
    const queryClient = useQueryClient();

    const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
        queryKey: ["coupons"],
        queryFn: async () => {
            const res = await fetch("/api/coupons");
            if (!res.ok) throw new Error("Failed to fetch coupons");
            return res.json();
        },
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
            const res = await fetch(`/api/coupons/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive }),
            });
            if (!res.ok) throw new Error("Failed to update coupon");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            toast.success("Estado del cupón actualizado");
        },
        onError: () => {
            toast.error("Error al actualizar el cupón");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/coupons/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete coupon");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            toast.success("Cupón eliminado");
        },
        onError: () => {
            toast.error("Error al eliminar el cupón");
        }
    });

    const formatValue = (type: string, value: number) => {
        if (type === "percentage") return `${value}% OFF`;
        return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value) + " OFF";
    };

    return (
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex sm:flex-row flex-col items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Ticket className="w-6 h-6 text-gray-500" />
                        Cupones de Descuento
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Creá códigos promocionales para incentivar las ventas y premiar a tus clientes.
                    </p>
                </div>
                <CouponDialog />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <Table className="min-w-[800px]">
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="font-semibold text-gray-900">Código</TableHead>
                                <TableHead className="font-semibold text-gray-900">Descuento</TableHead>
                                <TableHead className="font-semibold text-gray-900">Limites</TableHead>
                                <TableHead className="font-semibold text-gray-900">Vencimiento</TableHead>
                                <TableHead className="font-semibold text-gray-900">Usos</TableHead>
                                <TableHead className="font-semibold text-gray-900">Estado</TableHead>
                                <TableHead className="font-semibold text-gray-900 text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                                        Cargando cupones...
                                    </TableCell>
                                </TableRow>
                            ) : coupons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Ticket className="h-8 w-8 text-gray-400 mb-2" />
                                            <p>No tenés cupones activos.</p>
                                            <p className="text-sm">Hacé click en "Crear Cupón" para empezar.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                coupons.map((coupon) => {
                                    const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                                    const isDepleted = coupon.maxUses && coupon.usesCount >= coupon.maxUses;
                                    const isEffectivelyActive = coupon.isActive && !isExpired && !isDepleted;

                                    return (
                                        <TableRow key={coupon.id}>
                                            <TableCell className="font-mono font-bold text-gray-900">
                                                {coupon.code}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                                                    {formatValue(coupon.type, coupon.value)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {coupon.minAmount ? `Mínimo $${coupon.minAmount}` : 'Sin mínimo'}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {coupon.expiresAt ? (
                                                    <span className={isExpired ? "text-red-500 font-medium flex items-center gap-1" : "text-gray-500"}>
                                                        {isExpired && <XCircle className="w-3 h-3" />}
                                                        {format(new Date(coupon.expiresAt), "dd MMM yyyy", { locale: es })}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic">No vence</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{coupon.usesCount}</span>
                                                    <span className="text-gray-400 text-xs text-nowrap">
                                                        {coupon.maxUses ? `/ ${coupon.maxUses}` : 'ilimitado'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={coupon.isActive}
                                                        onCheckedChange={(checked) => toggleMutation.mutate({ id: coupon.id, isActive: checked })}
                                                        disabled={toggleMutation.isPending || !!isExpired || !!isDepleted}
                                                    />
                                                    <span className="text-xs">
                                                        {isEffectivelyActive ? (
                                                            <span className="text-emerald-600 font-medium">Activo</span>
                                                        ) : (
                                                            <span className="text-gray-400">Inactivo</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                                                        onClick={() => {
                                                            if (window.confirm(`¿Estás seguro de eliminar el cupón ${coupon.code}?`)) {
                                                                deleteMutation.mutate(coupon.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
