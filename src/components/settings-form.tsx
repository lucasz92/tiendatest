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
import {
    Loader2, Store, ImageIcon, X, MessageCircle, BarChart2,
    Search, Instagram, Facebook, Youtube, Twitter, AtSign, Bell, Send
} from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";
import { useState as useCollapseState } from "react";

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
        .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
    mpAccessToken: z.string().optional(),
    mpPublicKey: z.string().optional(),
    heroImage: z.string().optional().nullable(),
    whatsappNumber: z.string().optional(),
    whatsappMessage: z.string().optional(),
    metaPixelId: z.string().optional(),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(160).optional(),
    socialLinks: socialLinksSchema.optional(),
    telegramBotToken: z.string().optional(),
    telegramChatId: z.string().optional(),
    telegramLowStockThreshold: z.string().optional(),
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
        telegramBotToken?: string | null;
        telegramChatId?: string | null;
        telegramLowStockThreshold?: string | null;
    };
};

function Section({
    icon: Icon, title, description, children,
}: {
    icon: React.ElementType; title: string; description?: string; children: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm">
                    <Icon className="h-4 w-4" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                    {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
                </div>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isTestingTelegram, setIsTestingTelegram] = useState(false);
    const [heroImageUrl, setHeroImageUrl] = useState<string | null>(initialData.heroImage || null);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData.name,
            slug: initialData.slug,
            mpAccessToken: initialData.mpAccessToken,
            mpPublicKey: initialData.mpPublicKey,
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
            telegramBotToken: initialData.telegramBotToken || "",
            telegramChatId: initialData.telegramChatId || "",
            telegramLowStockThreshold: initialData.telegramLowStockThreshold || "",
        },
    });

    const waNumber = watch("whatsappNumber");
    const waMessage = watch("whatsappMessage");
    const seoTitle = watch("seoTitle");
    const seoDesc = watch("seoDescription");
    const tgBotToken = watch("telegramBotToken");
    const tgChatId = watch("telegramChatId");

    const onSubmit = async (values: FormValues) => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/shop", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...values, heroImage: heroImageUrl }),
            });
            if (!res.ok) throw new Error(await res.text() || "Error al guardar");
            toast.success("Tienda actualizada correctamente");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Ocurrió un error al guardar");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestTelegram = async () => {
        if (!tgBotToken || !tgChatId) {
            toast.error("Falta el Token o el Chat ID");
            return;
        }
        try {
            setIsTestingTelegram(true);
            const res = await fetch("/api/telegram/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ botToken: tgBotToken, chatId: tgChatId }),
            });
            if (!res.ok) throw new Error(await res.text() || "Error al enviar prueba");
            toast.success("¡Mensaje de prueba enviado a Telegram!");
        } catch (error: any) {
            toast.error(error.message || "Error al enviar mensaje");
        } finally {
            setIsTestingTelegram(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* ── Fila 1: Datos básicos + Hero ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Datos básicos */}
                <Section icon={Store} title="Información de la Tienda" description="Nombre y URL pública de tu tienda.">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Nombre de la Tienda</Label>
                            <Input id="name" {...register("name")} placeholder="Ej. Mi Tienda" />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="slug">Link público (Slug)</Label>
                            <div className="flex bg-gray-100 rounded-md items-center text-gray-500 text-sm shadow-sm border border-gray-200">
                                <span className="pl-3 pr-1 shrink-0 select-none">tiendafacil.com/</span>
                                <Input
                                    id="slug"
                                    {...register("slug")}
                                    className="border-0 bg-transparent pl-0 focus-visible:ring-0 shadow-none font-medium text-gray-900"
                                    placeholder="mi-negocio"
                                />
                            </div>
                            <p className="text-xs text-gray-400">Compartí este link con tus clientes.</p>
                            {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                        </div>
                    </div>
                </Section>

                {/* Hero image */}
                <Section icon={ImageIcon} title="Imagen de Cabecera (Hero)" description="Aparece de fondo en la parte superior de tu tienda.">
                    {heroImageUrl ? (
                        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                            <Image src={heroImageUrl} alt="Hero" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                            <Button type="button" variant="destructive" size="icon"
                                className="absolute top-2 right-2 rounded-full shadow-md z-10 w-7 h-7"
                                onClick={() => setHeroImageUrl(null)}>
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ) : (
                        <UploadDropzone
                            endpoint="productImage"
                            onClientUploadComplete={(res) => {
                                if (res && res.length > 0) { setHeroImageUrl(res[0].url); toast.success("Imagen subida"); }
                            }}
                            onUploadError={(error: Error) => { toast.error(`Error: ${error.message}`); }}
                            className="ut-button:bg-gray-900 ut-button:ut-readying:bg-gray-700"
                        />
                    )}
                </Section>
            </div>

            {/* ── Redes Sociales ───────────────────────────────────────── */}
            <Section icon={Instagram} title="Redes Sociales" description="Aparecen en el header y footer de tu tienda.">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs text-gray-600 font-medium"><Instagram className="h-3.5 w-3.5" /> Instagram</Label>
                        <Input {...register("socialLinks.instagram")} placeholder="https://instagram.com/tu-tienda" type="url" className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs text-gray-600 font-medium"><Facebook className="h-3.5 w-3.5" /> Facebook</Label>
                        <Input {...register("socialLinks.facebook")} placeholder="https://facebook.com/tu-tienda" type="url" className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs text-gray-600 font-medium"><AtSign className="h-3.5 w-3.5" /> TikTok</Label>
                        <Input {...register("socialLinks.tiktok")} placeholder="https://tiktok.com/@tu-tienda" type="url" className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs text-gray-600 font-medium"><Twitter className="h-3.5 w-3.5" /> Twitter / X</Label>
                        <Input {...register("socialLinks.twitter")} placeholder="https://x.com/tu-tienda" type="url" className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs text-gray-600 font-medium"><Youtube className="h-3.5 w-3.5" /> YouTube</Label>
                        <Input {...register("socialLinks.youtube")} placeholder="https://youtube.com/@tu-canal" type="url" className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs text-gray-600 font-medium"><AtSign className="h-3.5 w-3.5" /> Email de contacto</Label>
                        <Input {...register("socialLinks.email")} placeholder="hola@tutienda.com" type="email" className="text-sm" />
                    </div>
                </div>
            </Section>

            {/* ── Fila 2: WhatsApp + SEO ───────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* WhatsApp */}
                <Section icon={MessageCircle} title="WhatsApp" description="Botón flotante para que los clientes te escriban.">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="waNumber">Número</Label>
                            <Input id="waNumber" {...register("whatsappNumber")} placeholder="5493472512345" className="text-sm" />
                            <p className="text-xs text-gray-400">Código de país + área + número, sin + ni espacios.</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="waMessage">Mensaje predeterminado</Label>
                            <Textarea id="waMessage" {...register("whatsappMessage")}
                                placeholder="Hola! Me interesa más información sobre {producto}."
                                className="resize-none text-sm" rows={2} />
                            <p className="text-xs text-gray-400">Usá <code className="bg-gray-100 px-1 rounded text-gray-600">{"{producto}"}</code> para el nombre del producto.</p>
                        </div>
                        {waNumber && (
                            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                Preview: <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage || "Hola!")}`} target="_blank" rel="noreferrer" className="underline truncate">{`wa.me/${waNumber}`}</a>
                            </div>
                        )}
                    </div>
                </Section>

                {/* SEO */}
                <Section icon={Search} title="SEO" description="Cómo aparece tu tienda en Google.">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="seoTitle">Título de la página</Label>
                            <Input id="seoTitle" {...register("seoTitle")} placeholder={`${initialData.name} — Tienda Online`} className="text-sm" />
                            <p className="text-xs text-gray-400">{(seoTitle?.length ?? 0)}/70 caracteres</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="seoDescription">Descripción</Label>
                            <Textarea id="seoDescription" {...register("seoDescription")}
                                placeholder="Tienda de productos únicos. Encontrá todo lo que buscás..."
                                className="resize-none text-sm" rows={3} />
                            <p className="text-xs text-gray-400">{(seoDesc?.length ?? 0)}/160 caracteres</p>
                        </div>
                    </div>
                </Section>
            </div>

            {/* ── Fila 4: Meta Pixel + Mercado Pago ───────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Meta Pixel */}
                <Section icon={BarChart2} title="Meta Pixel" description="Rastreá visitas para tus campañas en Facebook/Instagram.">
                    <div className="space-y-1.5">
                        <Label htmlFor="metaPixelId">Pixel ID</Label>
                        <Input id="metaPixelId" {...register("metaPixelId")} placeholder="123456789012345" className="text-sm" />
                        <p className="text-xs text-gray-400">Encontralo en Meta Business Suite → Eventos.</p>
                    </div>
                </Section>

                {/* Mercado Pago */}
                <Section icon={Store} title="Mercado Pago" description="Credenciales para cobrar en tu cuenta (opcional).">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="mpAccessToken">Access Token</Label>
                            <Input id="mpAccessToken" {...register("mpAccessToken")} placeholder="APP_USR-xxxxxxxxx..." type="password" className="text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="mpPublicKey">Public Key</Label>
                            <Input id="mpPublicKey" {...register("mpPublicKey")} placeholder="APP_USR-xxxxxxxxx..." className="text-sm" />
                        </div>
                    </div>
                </Section>
            </div>

            {/* ── Fila 5: Notificaciones Telegram ─────────────────────── */}
            <Section icon={Bell} title="Notificaciones de Telegram" description="Recibí alertas instantáneas de nuevos pedidos y bajo stock en tu celular.">
                <div className="space-y-5">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 space-y-2">
                        <p className="font-semibold">¿Cómo configurarlo?</p>
                        <ol className="list-decimal list-inside space-y-1 ml-1 text-blue-700">
                            <li>Buscá a <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="underline font-medium">@BotFather</a> en Telegram.</li>
                            <li>Escribí <code className="bg-blue-100 px-1 rounded">/newbot</code>, dale un nombre y usuario, y copiá el <strong>Token</strong>.</li>
                            <li>Buscá a tu nuevo bot en Telegram y mandale un mensaje cualquiera (ej. "Hola").</li>
                            <li>Entrá a <a href="https://t.me/JsonDumpBot" target="_blank" rel="noreferrer" className="underline font-medium">@JsonDumpBot</a>, mandale un mensaje y copiá el número que te da (ese es tu <strong>Chat ID</strong>).</li>
                        </ol>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="telegramBotToken">Bot Token</Label>
                            <Input id="telegramBotToken" {...register("telegramBotToken")} placeholder="123456789:ABCdefGhI..." type="password" className="text-sm font-mono" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="telegramChatId">Chat ID</Label>
                            <Input id="telegramChatId" {...register("telegramChatId")} placeholder="123456789" className="text-sm font-mono" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                            <Label htmlFor="telegramLowStockThreshold">Avisar si el stock baja a...</Label>
                            <div className="flex gap-2">
                                <Input id="telegramLowStockThreshold" {...register("telegramLowStockThreshold")} placeholder="Ej. 3" type="number" className="text-sm" />
                                <span className="flex items-center text-sm text-gray-500 whitespace-nowrap">unidades</span>
                            </div>
                            <p className="text-xs text-gray-400">Dejalo vacío para no recibir alertas de stock repuesto.</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleTestTelegram}
                            disabled={!tgBotToken || !tgChatId || isTestingTelegram}
                            className="w-full sm:w-auto text-sm"
                        >
                            {isTestingTelegram ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4 text-blue-600" />}
                            Enviar mensaje de prueba
                        </Button>
                    </div>
                </div>
            </Section>

            {/* Submit */}
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isLoading} className="bg-gray-900 hover:bg-gray-800 text-white px-8">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </div>
        </form>
    );
}
