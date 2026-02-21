"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";
import { X, ImagePlus } from "lucide-react";

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
    price: z.number().min(1, "El precio debe ser mayor a 0."),
    stock: z.number().min(0, "El stock no puede ser negativo."),
    description: z.string().optional().nullable(),
    images: z.array(z.string()),
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
        images?: string[] | null;
    };
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProductModal({ product, open, onOpenChange }: EditProductModalProps) {
    const queryClient = useQueryClient();

    // Resolve initial images array: prefer images[], fall back to imageUrl
    const initialImages = (): string[] => {
        if (product.images && product.images.length > 0) return product.images;
        if (product.imageUrl) return [product.imageUrl];
        return [];
    };

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: product.name,
            price: product.price,
            stock: product.stock,
            description: product.description || "",
            images: initialImages(),
        },
    });

    // Reset form when product changes
    useEffect(() => {
        form.reset({
            name: product.name,
            price: product.price,
            stock: product.stock,
            description: product.description || "",
            images: initialImages(),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product.id]);

    const images = form.watch("images");

    const removeImage = (index: number) => {
        const current = form.getValues("images");
        form.setValue("images", current.filter((_, i) => i !== index), {
            shouldDirty: true,
        });
    };

    const mutation = useMutation({
        mutationFn: async (values: ProductFormValues) => {
            const res = await fetch(`/api/products/${product.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    imageUrl: values.images[0] || null,
                }),
            });
            if (!res.ok) throw new Error("Error al actualizar producto");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Producto actualizado");
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
                        Modificá los datos de &ldquo;{product.name}&rdquo;
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
                                    render={({ field: { value, onChange, ...fieldProps } }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-zinc-700">Precio ($)</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">$</span>
                                                    <Input
                                                        type="number"
                                                        {...fieldProps}
                                                        value={value}
                                                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : 0)}
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
                                    render={({ field: { value, onChange, ...fieldProps } }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-zinc-700">Stock</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...fieldProps}
                                                    value={value}
                                                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : 0)}
                                                    className="bg-white border-zinc-200 focus:border-[#009EE3] focus:ring-[#009EE3]/20 transition-all rounded-lg h-11"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Imágenes */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-zinc-700 text-sm">
                                        Imágenes del producto
                                        <span className="text-zinc-400 font-normal ml-1">({images.length}/5)</span>
                                    </p>
                                    {images.length > 0 && (
                                        <span className="text-xs text-zinc-400">La primera es la imagen principal</span>
                                    )}
                                </div>

                                {/* Grid de imágenes */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {images.map((url, index) => (
                                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 group shadow-sm">
                                                <Image src={url} alt={`Imagen ${index + 1}`} fill className="object-cover" />
                                                {index === 0 && (
                                                    <div className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                                        PRINCIPAL
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload zone */}
                                {images.length < 5 && (
                                    <div className="border-2 border-dashed rounded-xl p-1 bg-white border-zinc-200 hover:border-[#009EE3]/50 transition-colors">
                                        <UploadDropzone
                                            endpoint="productImage"
                                            onClientUploadComplete={(res) => {
                                                if (res && res.length > 0) {
                                                    const newUrls = res.map(f => f.url);
                                                    const current = form.getValues("images");
                                                    const updated = [...current, ...newUrls].slice(0, 5);
                                                    form.setValue("images", updated, {
                                                        shouldValidate: true,
                                                        shouldDirty: true,
                                                        shouldTouch: true,
                                                    });
                                                    toast.success(`${res.length} imagen${res.length > 1 ? "es" : ""} subida${res.length > 1 ? "s" : ""} con éxito`);
                                                }
                                            }}
                                            onUploadError={(error: Error) => {
                                                toast.error(`Error al subir: ${error.message}`);
                                            }}
                                            content={{
                                                label: images.length === 0 ? "Subir imágenes" : <><ImagePlus className="h-4 w-4 inline mr-1" />Agregar más</>,
                                                allowedContent: `JPG, PNG, WEBP max 4MB (${5 - images.length} restante${5 - images.length !== 1 ? "s" : ""})`
                                            }}
                                            appearance={{
                                                button: "bg-zinc-900 text-white hover:bg-zinc-800 h-10 px-5 text-sm mt-4 font-semibold rounded-lg shadow-sm transition-all",
                                                container: "border-none p-4 min-h-[100px] flex flex-col justify-center",
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
