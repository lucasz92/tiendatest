"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Store } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    slug: z.string()
        .min(3, "El link debe tener al menos 3 caracteres")
        .regex(/^[a-z0-9-]+$/, "El link solo puede contener minúsculas, números y guiones"),
});

type SettingsFormProps = {
    initialData: {
        id: number;
        name: string;
        slug: string;
    };
};

export function SettingsForm({ initialData }: SettingsFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData.name,
            slug: initialData.slug,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/shop", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const errorMessage = await res.text();
                throw new Error(errorMessage || "Failed to update shop");
            }

            toast.success("Tienda actualizada correctamente");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Ocurrió un error al guardar");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Información de la Tienda
                </CardTitle>
                <CardDescription>
                    Actualizá el nombre y el link público de tu tienda.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la Tienda</Label>
                        <Input
                            id="name"
                            {...register("name")}
                            placeholder="Ej. Tejidos Pro"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Link Personalizado (Slug)</Label>
                        <div className="flex bg-muted text-muted-foreground rounded-md items-center shadow-sm">
                            <span className="pl-3 pr-1 text-sm select-none">tiendafacil.com/</span>
                            <Input
                                id="slug"
                                {...register("slug")}
                                className="border-0 bg-transparent pl-1 focus-visible:ring-0 shadow-none font-medium text-foreground"
                                placeholder="mi-negocio"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Este será el enlace que compartirás con tus clientes.
                        </p>
                        {errors.slug && (
                            <p className="text-sm text-red-500">{errors.slug.message}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
