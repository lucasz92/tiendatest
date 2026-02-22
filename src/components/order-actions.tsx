"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Truck, Package, CheckCircle, PackageOpen, XCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OrderActions({ order }: { order: any }) {
    const queryClient = useQueryClient();
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [trackingCode, setTrackingCode] = useState(order.trackingCode || "");

    const updateOrderMutation = useMutation({
        mutationFn: async (data: { status?: string; trackingCode?: string }) => {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update order");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            setIsTrackingModalOpen(false);
            setIsCancelModalOpen(false);
            setIsReturnModalOpen(false);
        },
    });

    const handleStatusChange = (status: string) => {
        updateOrderMutation.mutate({ status });
    };

    const handleSaveTracking = () => {
        updateOrderMutation.mutate({
            status: "shipped",
            trackingCode
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleStatusChange("processing")}>
                        <PackageOpen className="mr-2 h-4 w-4" />
                        Marcar En Preparación
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsTrackingModalOpen(true)}>
                        <Truck className="mr-2 h-4 w-4" />
                        Despachar (Cargar Tracking)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("delivered")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar Entregado
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => setIsCancelModalOpen(true)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar pedido
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => setIsReturnModalOpen(true)}
                        className="text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Marcar como Devuelto
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isTrackingModalOpen} onOpenChange={setIsTrackingModalOpen}>
                <DialogContent aria-describedby="order-tracking-description">
                    <DialogHeader>
                        <DialogTitle>Despachar Pedido #{order.id}</DialogTitle>
                        <DialogDescription id="order-tracking-description">
                            Ingresa el código de seguimiento del envío (OCA, Correo Argentino, Andreani, etc). Al guardar, el estado del pedido cambiará a "Despachado".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tracking" className="text-right">
                                Tracking ID
                            </Label>
                            <Input
                                id="tracking"
                                placeholder="Ej: AR123456789"
                                value={trackingCode}
                                onChange={(e) => setTrackingCode(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTrackingModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSaveTracking}
                            disabled={updateOrderMutation.isPending || !trackingCode.trim()}
                        >
                            {updateOrderMutation.isPending ? "Guardando..." : "Guardar y Despachar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Order Dialog */}
            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancelar Pedido #{order.id}</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de cancelar este pedido?<br /><br />
                            <strong className="text-gray-900 font-medium">✨ Al cancelar este pedido, se restaurará automáticamente el stock de los {order.items?.length || 0} producto(s) incluidos.</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>Mantener</Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleStatusChange("canceled")}
                            disabled={updateOrderMutation.isPending}
                        >
                            {updateOrderMutation.isPending ? "Cancelando..." : "Sí, Cancelar pedido"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Return Order Dialog */}
            <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Devolver Pedido #{order.id}</DialogTitle>
                        <DialogDescription>
                            ¿Confirmás que el cliente devolvió este pedido?<br /><br />
                            <strong className="text-gray-900 font-medium">✨ Al marcar como devuelto, se restaurará automáticamente el stock de los {order.items?.length || 0} producto(s) incluidos.</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReturnModalOpen(false)}>Cancelar</Button>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => handleStatusChange("returned")}
                            disabled={updateOrderMutation.isPending}
                        >
                            {updateOrderMutation.isPending ? "Marcando..." : "Sí, Marcar Devuelto"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
