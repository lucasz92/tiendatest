"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Ticket, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const couponSchema = z.object({
    code: z.string().min(3, "El código debe tener al menos 3 caracteres").max(20, "El código es muy largo").regex(/^[A-Za-z0-9_-]+$/, "Solo se permiten letras, números, guiones y guiones bajos"),
    type: z.enum(["percentage", "fixed"]),
    value: z.number().min(1, "El valor debe ser mayor a 0"),
    minAmount: z.number().optional(),
    maxUses: z.number().optional(),
    expiresAt: z.string().optional(),
}).refine(data => {
    if (data.type === "percentage" && data.value > 100) {
        return false;
    }
    return true;
}, {
    message: "El porcentaje no puede ser mayor a 100%",
    path: ["value"]
});

type CouponFormValues = z.infer<typeof couponSchema>;

export function CouponDialog() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            code: "",
            type: "percentage",
            value: 10,
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: CouponFormValues) => {
            const res = await fetch("/api/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Clean up optional fields that might be NaN
                body: JSON.stringify({
                    ...data,
                    minAmount: isNaN(data.minAmount as number) || !data.minAmount ? null : data.minAmount,
                    maxUses: isNaN(data.maxUses as number) || !data.maxUses ? null : data.maxUses,
                    // Convert date string from datetime-local to ISO if exists
                    expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null
                }),
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || "Error al crear el cupón");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            toast.success("Cupón creado exitosamente");
            form.reset();
            setOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.message || "Error al crear el cupón");
        }
    });

    function onSubmit(data: CouponFormValues) {
        createMutation.mutate(data);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2">
                    <Plus className="w-4 h-4" />
                    Crear Cupón
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-blue-600" />
                        Nuevo Cupón
                    </DialogTitle>
                    <DialogDescription>
                        Generá un nuevo código de descuento. Escribilo en mayúsculas (ej. VERANO20).
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="EJ: OFERTA50"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                            className="font-mono uppercase"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de descuento</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                                                <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="minAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Compra Mínima ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Opcional"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={e => field.onChange(e.target.valueAsNumber || undefined)}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="maxUses"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Límite de usos</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Opcional"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={e => field.onChange(e.target.valueAsNumber || undefined)}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="expiresAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de Vencimiento</FormLabel>
                                    <FormControl>
                                        {/* HTML Date Input for simplicity in MVP. Standard datetime-local */}
                                        <Input
                                            type="datetime-local"
                                            {...field}
                                            className="w-full"
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Dejar vacío para que no venza nunca.
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cupón
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
