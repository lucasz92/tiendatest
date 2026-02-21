"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";
import { X } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const productSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    price: z.coerce.number().min(1, "El precio debe ser mayor a 0."),
    stock: z.coerce.number().min(0, "El stock no puede ser negativo."),
    description: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface EditProductModalProps {
    product: {
        id: number;
        name: string;
        price: number;
        stock: number;
        description?: string | null;
        imageUrl?: string | null;
    };
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProductModal({ product, open, onOpenChange }: EditProductModalProps) {
    const queryClient = useQueryClient();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: product.name,
            price: product.price,
            stock: product.stock,
            description: product.description || "",
            imageUrl: product.imageUrl || "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: ProductFormValues) => {
            const res = await fetch(`/api/products/${product.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error("Error al actualizar producto");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Producto actualizado exitosamente");
            onOpenChange(false);
        },
        onError: () => {
            toast.error("Ocurrió un error al actualizar el producto.");
        },
    });

    function onSubmit(data: ProductFormValues) {
        mutation.mutate(data);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[520px] p-0 gap-0 shadow-2xl border-zinc-200 rounded-2xl"
                aria-describedby="edit-product-description"
            >
                <DialogHeader className="p-6 pb-4 border-b border-zinc-100 bg-white rounded-t-2xl">
                    <DialogTitle className="text-xl font-bold text-zinc-900">Editar Producto</DialogTitle>
                    <DialogDescription id="edit-product-description" className="text-zinc-500 text-sm mt-1">
                        Modificá los detalles de este producto.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-6 bg-zinc-50/50 max-h-[75vh] overflow-y-auto rounded-b-2xl">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            {/* Nombre */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-zinc-700">Nombre del producto</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: Pasmina de Lino"
                                                {...field}
                                                className="bg-white border-zinc-200 focus:border-[#009EE3] focus:ring-[#009EE3]/20 transition-all rounded-lg h-11"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Descripción */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-zinc-700">Descripción <span className="text-zinc-400 font-normal">(opcional)</span></FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describí el material, medidas, colores disponibles..."
                                                {...field}
                                                value={field.value ?? ""}
                                                rows={3}
                                                className="bg-white border-zinc-200 focus:border-[#009EE3] focus:ring-[#009EE3]/20 transition-all rounded-lg resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Precio y Stock */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-zinc-700">Precio ($)</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">$</span>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        className="pl-7 bg-white border-zinc-200 focus:border-[#009EE3] focus:ring-[#009EE3]/20 transition-all rounded-lg h-11"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-zinc-700">Stock disponible</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    className="bg-white border-zinc-200 focus:border-[#009EE3] focus:ring-[#009EE3]/20 transition-all rounded-lg h-11"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Imagen */}
                            <div className="space-y-3">
                                <p className="font-semibold text-zinc-700 text-sm">Imagen del producto</p>
                                {form.watch("imageUrl") ? (
                                    <div className="relative h-48 w-full rounded-xl overflow-hidden bg-white border border-zinc-200 flex items-center justify-center shadow-sm group">
                                        <Image
                                            src={form.watch("imageUrl") as string}
                                            alt="Imagen del producto"
                                            fill
                                            className="object-contain p-2"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => form.setValue("imageUrl", "")}
                                                className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-transform hover:scale-110 shadow-lg flex items-center gap-2 font-medium text-sm"
                                            >
                                                <X className="h-4 w-4" /> Eliminar foto
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed rounded-xl p-1 bg-white border-zinc-200 hover:border-[#009EE3]/50 transition-colors">
                                        <UploadDropzone
                                            endpoint="productImage"
                                            onClientUploadComplete={(res) => {
                                                if (res && res[0]) {
                                                    form.setValue("imageUrl", res[0].url);
                                                    toast.success("Imagen subida con éxito");
                                                }
                                            }}
                                            onUploadError={(error: Error) => {
                                                toast.error(`Error al subir: ${error.message}`);
                                            }}
                                            content={{
                                                label: "Subir imagen",
                                                allowedContent: "Permitido: JPG, PNG, WEBP max 4MB"
                                            }}
                                            appearance={{
                                                button: "bg-zinc-900 text-white hover:bg-zinc-800 h-10 px-5 text-sm mt-4 font-semibold rounded-lg shadow-sm transition-all",
                                                container: "border-none p-6 min-h-[140px] flex flex-col justify-center",
                                                label: "text-sm font-medium text-[#009EE3] hover:text-[#008EE3] cursor-pointer",
                                                allowedContent: "text-xs mt-2 text-zinc-500 font-medium",
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-zinc-200 mt-2">
                                <Button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="w-full sm:w-auto bg-[#009EE3] hover:bg-[#008EE3] text-white font-semibold shadow-md transition-all rounded-lg h-11 px-8 text-base"
                                >
                                    {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
