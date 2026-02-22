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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Loader2, Store, ImageIcon, X, MessageCircle, BarChart2,
    Search, Instagram, Facebook, Youtube, Twitter, AtSign
} from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";

const socialLinksSchema = z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
});

const formSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    slug: z.string()
        .min(3, "El link debe tener al menos 3 caracteres")
        .regex(/^[a-z0-9-]+$/, "El link solo puede contener minúsculas, números y guiones"),
    mpAccessToken: z.string().optional(),
    mpPublicKey: z.string().optional(),
    heroImage: z.string().optional().nullable(),
    // WhatsApp
    whatsappNumber: z.string().optional(),
    whatsappMessage: z.string().optional(),
    // Marketing
    metaPixelId: z.string().optional(),
    // SEO
    seoTitle: z.string().max(70, "Máximo 70 caracteres").optional(),
    seoDescription: z.string().max(160, "Máximo 160 caracteres").optional(),
    // Social
    socialLinks: socialLinksSchema.optional(),
});

type FormValues = z.infer<typeof formSchema>;

type SettingsFormProps = {
    initialData: {
        id: number;
        name: string;
        slug: string;
        mpAccessToken: string;
        mpPublicKey: string;
        heroImage?: string | null;
        whatsappNumber?: string | null;
        whatsappMessage?: string | null;
        metaPixelId?: string | null;
        seoTitle?: string | null;
        seoDescription?: string | null;
        socialLinks?: {
            instagram?: string;
            facebook?: string;
            tiktok?: string;
            twitter?: string;
            youtube?: string;
            email?: string;
        } | null;
    };
};

export function SettingsForm({ initialData }: SettingsFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [heroImageUrl, setHeroImageUrl] = useState<string | null>(initialData.heroImage || null);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData.name,
            slug: initialData.slug,
            mpAccessToken: initialData.mpAccessToken,
            mpPublicKey: initialData.mpPublicKey,
            heroImage: initialData.heroImage || null,
            whatsappNumber: initialData.whatsappNumber || "",
            whatsappMessage: initialData.whatsappMessage || "",
            metaPixelId: initialData.metaPixelId || "",
            seoTitle: initialData.seoTitle || "",
            seoDescription: initialData.seoDescription || "",
            socialLinks: {
                instagram: initialData.socialLinks?.instagram || "",
                facebook: initialData.socialLinks?.facebook || "",
                tiktok: initialData.socialLinks?.tiktok || "",
                twitter: initialData.socialLinks?.twitter || "",
                youtube: initialData.socialLinks?.youtube || "",
                email: initialData.socialLinks?.email || "",
            },
        },
    });

    const waNumber = watch("whatsappNumber");
    const waMessage = watch("whatsappMessage");
    const seoTitle = watch("seoTitle");
    const seoDesc = watch("seoDescription");

    const onSubmit = async (values: FormValues) => {
        try {
            setIsLoading(true);
            const payload = { ...values, heroImage: heroImageUrl };

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

    const SectionHeader = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) => (
        <div className="pt-6 border-t border-zinc-100">
            <h3 className="text-lg font-medium flex items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                {title}
            </h3>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
    );

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Configuración de la Tienda
                </CardTitle>
                <CardDescription>
                    Personalizá tu tienda, contacto, redes sociales y marketing.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">

                    {/* ── Nombre y Slug ─────────────────────────────────── */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la Tienda</Label>
                        <Input id="name" {...register("name")} placeholder="Ej. Tejidos Pro" />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
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
                        <p className="text-xs text-muted-foreground">Este será el enlace que compartirás con tus clientes.</p>
                        {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
                    </div>

                    {/* ── Hero Image ────────────────────────────────────── */}
                    <div className="flex flex-col gap-4">
                        <SectionHeader icon={ImageIcon} title="Imagen de Cabecera (Hero)" description="Aparecerá de fondo en la parte superior de tu tienda." />
                        <div className="space-y-4">
                            {heroImageUrl ? (
                                <div className="relative aspect-[21/9] w-full max-w-xl overflow-hidden rounded-xl border border-border shadow-sm">
                                    <Image src={heroImageUrl} alt="Hero Image" fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" />
                                    <Button
                                        type="button" variant="destructive" size="icon"
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
                                        if (res && res.length > 0) { setHeroImageUrl(res[0].url); toast.success("Imagen subida"); }
                                    }}
                                    onUploadError={(error: Error) => { toast.error(`Error: ${error.message}`); }}
                                    className="ut-button:bg-zinc-900 ut-button:ut-readying:bg-zinc-800"
                                />
                            )}
                        </div>
                    </div>

                    {/* ── Redes Sociales ────────────────────────────────── */}
                    <div className="flex flex-col gap-4">
                        <SectionHeader icon={Instagram} title="Redes Sociales" description="Tus redes aparecerán en el header y footer de tu tienda." />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5 text-sm"><Instagram className="h-3.5 w-3.5" /> Instagram</Label>
                                <Input {...register("socialLinks.instagram")} placeholder="https://instagram.com/tu-tienda" type="url" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5 text-sm"><Facebook className="h-3.5 w-3.5" /> Facebook</Label>
                                <Input {...register("socialLinks.facebook")} placeholder="https://facebook.com/tu-tienda" type="url" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5 text-sm"><AtSign className="h-3.5 w-3.5" /> TikTok</Label>
                                <Input {...register("socialLinks.tiktok")} placeholder="https://tiktok.com/@tu-tienda" type="url" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5 text-sm"><Twitter className="h-3.5 w-3.5" /> Twitter / X</Label>
                                <Input {...register("socialLinks.twitter")} placeholder="https://x.com/tu-tienda" type="url" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5 text-sm"><Youtube className="h-3.5 w-3.5" /> YouTube</Label>
                                <Input {...register("socialLinks.youtube")} placeholder="https://youtube.com/@tu-canal" type="url" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5 text-sm"><AtSign className="h-3.5 w-3.5" /> Email de contacto</Label>
                                <Input {...register("socialLinks.email")} placeholder="hola@tutienda.com" type="email" />
                            </div>
                        </div>
                    </div>

                    {/* ── WhatsApp ──────────────────────────────────────── */}
                    <div className="flex flex-col gap-4">
                        <SectionHeader icon={MessageCircle} title="WhatsApp" description="Mostrará un botón flotante en tu tienda para que los clientes te escriban." />
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="waNumber">Número de WhatsApp</Label>
                                <Input
                                    id="waNumber"
                                    {...register("whatsappNumber")}
                                    placeholder="5493472512345 (código país + área + número, sin + ni espacios)"
                                />
                                <p className="text-xs text-muted-foreground">Ejemplo: 5493472512345 (Argentina, sin el 0 ni el 15)</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="waMessage">Mensaje predeterminado</Label>
                                <Textarea
                                    id="waMessage"
                                    {...register("whatsappMessage")}
                                    placeholder="Hola! Me interesa más información sobre {producto}."
                                    className="resize-none"
                                    rows={2}
                                />
                                <p className="text-xs text-muted-foreground">Usá <code className="bg-muted px-1 rounded">{"{producto}"}</code> para insertar el nombre del producto.</p>
                            </div>
                            {waNumber && (
                                <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                    Preview: <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage || "Hola!")}`} target="_blank" rel="noreferrer" className="underline truncate">{`wa.me/${waNumber}`}</a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── SEO ───────────────────────────────────────────── */}
                    <div className="flex flex-col gap-4">
                        <SectionHeader icon={Search} title="SEO" description="Mejorá cómo aparece tu tienda en Google y otros buscadores." />
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="seoTitle">Título de la página</Label>
                                <Input id="seoTitle" {...register("seoTitle")} placeholder={`${initialData.name} — Tienda Online`} />
                                <p className="text-xs text-muted-foreground">{(seoTitle?.length ?? 0)}/70 caracteres recomendados</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="seoDescription">Descripción</Label>
                                <Textarea
                                    id="seoDescription"
                                    {...register("seoDescription")}
                                    placeholder="Tienda de productos artesanales hechos a mano. Encontrá tejidos únicos..."
                                    className="resize-none"
                                    rows={3}
                                />
                                <p className="text-xs text-muted-foreground">{(seoDesc?.length ?? 0)}/160 caracteres recomendados</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Meta Pixel ────────────────────────────────────── */}
                    <div className="flex flex-col gap-4">
                        <SectionHeader icon={BarChart2} title="Meta Pixel (Facebook / Instagram Ads)" description="Rastrea visitas y conversiones para tus campañas publicitarias." />
                        <div className="space-y-2">
                            <Label htmlFor="metaPixelId">Pixel ID</Label>
                            <Input id="metaPixelId" {...register("metaPixelId")} placeholder="123456789012345" />
                            <p className="text-xs text-muted-foreground">Encontrá tu Pixel ID en Meta Business Suite → Eventos.</p>
                        </div>
                    </div>

                    {/* ── Mercado Pago ──────────────────────────────────── */}
                    <div className="flex flex-col gap-4">
                        <SectionHeader icon={Store} title="Mercado Pago (Opcional)" description="Credenciales para cobrar con Mercado Pago en tu cuenta." />
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="mpAccessToken">Access Token</Label>
                                <Input id="mpAccessToken" {...register("mpAccessToken")} placeholder="APP_USR-xxxxxxxxx-xxxx-xxxx-xxxx" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mpPublicKey">Public Key</Label>
                                <Input id="mpPublicKey" {...register("mpPublicKey")} placeholder="APP_USR-xxxxxxxxx-xxxx-xxxx-xxxx" />
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
