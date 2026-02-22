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
import { Loader2, Store, ImageIcon, X } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";

const formSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    slug: z.string()
        .min(3, "El link debe tener al menos 3 caracteres")
        .regex(/^[a-z0-9-]+$/, "El link solo puede contener minúsculas, números y guiones"),
    mpAccessToken: z.string().optional(),
    mpPublicKey: z.string().optional(),
    heroImage: z.string().optional().nullable(),
});

type SettingsFormProps = {
    initialData: {
        id: number;
        name: string;
        slug: string;
        mpAccessToken: string;
        mpPublicKey: string;
        heroImage?: string | null;
    };
};

export function SettingsForm({ initialData }: SettingsFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [heroImageUrl, setHeroImageUrl] = useState<string | null>(initialData.heroImage || null);

    const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData.name,
            slug: initialData.slug,
            mpAccessToken: initialData.mpAccessToken,
            mpPublicKey: initialData.mpPublicKey,
            heroImage: initialData.heroImage || null,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            const payload = {
                ...values,
                heroImage: heroImageUrl,
            };

            const res = await fetch("/api/shop", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
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

                    <div className="pt-4 border-t border-zinc-100 flex flex-col gap-4">
                        <div>
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                Imagen de Cabecera (Hero)
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Esta imagen aparecerá de fondo en la parte superior de tu tienda pública.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {heroImageUrl ? (
                                <div className="relative aspect-[21/9] w-full max-w-xl overflow-hidden rounded-xl border border-border shadow-sm">
                                    <Image
                                        src={heroImageUrl}
                                        alt="Hero Image"
                                        fill
                                        className="object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 rounded-full shadow-md z-10"
                                        onClick={() => setHeroImageUrl(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <UploadDropzone
                                    endpoint="productImage"
                                    onClientUploadComplete={(res) => {
                                        if (res && res.length > 0) {
                                            setHeroImageUrl(res[0].url);
                                            toast.success("Imagen subida correctamente");
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        toast.error(`Error al subir imagen: ${error.message}`);
                                    }}
                                    className="ut-button:bg-zinc-900 ut-button:ut-readying:bg-zinc-800"
                                />
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 flex flex-col gap-4">
                        <div>
                            <h3 className="text-lg font-medium">Mercado Pago (Opcional)</h3>
                            <p className="text-sm text-muted-foreground">Credenciales para cobrar con Mercado Pago directamente en tu cuenta.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="mpAccessToken">Access Token</Label>
                                <Input
                                    id="mpAccessToken"
                                    {...register("mpAccessToken")}
                                    placeholder="APP_USR-xxxxxxxxx-xxxx-xxxx-xxxx"
                                    type="password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mpPublicKey">Public Key</Label>
                                <Input
                                    id="mpPublicKey"
                                    {...register("mpPublicKey")}
                                    placeholder="APP_USR-xxxxxxxxx-xxxx-xxxx-xxxx"
                                />
                            </div>
                        </div>
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
