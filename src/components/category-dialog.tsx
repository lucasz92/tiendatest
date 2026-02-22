"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Edit } from "lucide-react";

const categorySchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
    categoryToEdit?: { id: number; name: string } | null;
    trigger?: React.ReactNode;
}

export function CategoryDialog({ categoryToEdit, trigger }: CategoryDialogProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const isEditing = !!categoryToEdit;

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: categoryToEdit?.name || "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: CategoryFormValues) => {
            const url = isEditing ? `/api/categories/${categoryToEdit.id}` : "/api/categories";
            const method = isEditing ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || "Error al procesar la categoría");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success(isEditing ? "Categoría actualizada" : "Categoría creada exitosamente");
            setOpen(false);
            if (!isEditing) form.reset();
        },
        onError: (error: any) => {
            toast.error(error.message || "Ocurrió un error.");
        },
    });

    function onSubmit(data: CategoryFormValues) {
        mutation.mutate(data);
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (val && categoryToEdit) {
                form.reset({ name: categoryToEdit.name });
            } else if (val && !categoryToEdit) {
                form.reset({ name: "" });
            }
        }}>
            <DialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Cambiá el nombre de la categoría." : "Creá una nueva categoría para organizar tus productos."}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: Remeras, Accesorios..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="w-full sm:w-auto"
                                >
                                    {mutation.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {isEditing ? "Guardar cambios" : "Crear categoría"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
