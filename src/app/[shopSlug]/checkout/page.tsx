"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, ArrowLeft, ShieldCheck, Lock, CreditCard, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function CheckoutPage() {
    const router = useRouter();
    const params = useParams();
    const shopSlug = params.shopSlug as string;

    const { items, getCartTotal, shopId } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        province: "",
        zipCode: "",
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const total = getCartTotal();

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 max-w-sm w-full flex flex-col items-center">
                    <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag className="h-10 w-10 text-zinc-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-800 mb-2">Tu carrito está vacío</h2>
                    <p className="text-zinc-500 mb-8 max-w-xs">Agrega algunos productos antes de proceder al pago seguro.</p>
                    <Link href={`/${shopSlug}`} className="w-full">
                        <Button className="w-full h-12 text-base font-semibold">Volver a la tienda</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            toast.success("¡Datos seguros! Preparando tu pago...");

            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customerInfo: formData,
                    items,
                    shopId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al procesar el checkout");
            }

            if (data.initPoint) {
                window.location.href = data.initPoint;
            } else {
                throw new Error("No se recibió el link de pago seguro");
            }
        } catch (error: any) {
            console.error("Checkout error:", error);
            toast.error(error.message || "Hubo un error al procesar tu pedido.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-800 selection:bg-zinc-200">
            {/* Header Seguro e Minimalista */}
            <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-sm">
                <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between max-w-6xl">
                    <Link href={`/${shopSlug}`} className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-colors py-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Volver a la tienda</span>
                    </Link>
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        <Lock className="h-4 w-4" />
                        <span>Checkout Seguro</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 sm:py-10 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start flex-col-reverse lg:flex-row">

                    {/* Formulario de Checkout */}
                    <div className="lg:col-span-7 order-2 lg:order-1">
                        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

                            {/* Datos de Contacto */}
                            <Card className="shadow-sm border-zinc-200 overflow-hidden">
                                <CardHeader className="bg-white border-b border-zinc-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-zinc-900 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                                        <CardTitle className="text-lg sm:text-xl font-bold">Datos de contacto</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 bg-white space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-semibold text-zinc-700">Correo electrónico</Label>
                                        <Input id="email" type="email" name="email" required placeholder="tu@email.com" value={formData.email} onChange={handleInputChange} className="h-12 bg-zinc-50 focus-visible:ring-zinc-900 text-base" />
                                        <p className="text-xs text-zinc-500 font-medium">Enviaremos el recibo e información del pedido a este correo.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="font-semibold text-zinc-700">Nombre completo</Label>
                                            <Input id="name" name="name" required placeholder="Ej. Juan Pérez" value={formData.name} onChange={handleInputChange} className="h-12 bg-zinc-50 focus-visible:ring-zinc-900 text-base" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="font-semibold text-zinc-700">Teléfono (WhatsApp)</Label>
                                            <Input id="phone" name="phone" required placeholder="Ej. 11 2345 6789" value={formData.phone} onChange={handleInputChange} className="h-12 bg-zinc-50 focus-visible:ring-zinc-900 text-base" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Datos de Envío */}
                            <Card className="shadow-sm border-zinc-200 overflow-hidden">
                                <CardHeader className="bg-white border-b border-zinc-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-zinc-900 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                                        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                            Dirección de envío
                                            <Truck className="h-5 w-5 text-zinc-400 hidden sm:inline" />
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 bg-white space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="street" className="font-semibold text-zinc-700">Calle, número y piso/depto</Label>
                                        <Input id="street" name="street" required placeholder="Ej. Av. Corrientes 1234, Piso 2, Dpto B" value={formData.street} onChange={handleInputChange} className="h-12 bg-zinc-50 focus-visible:ring-zinc-900 text-base" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        <div className="sm:col-span-1 lg:col-span-2 space-y-2">
                                            <Label htmlFor="city" className="font-semibold text-zinc-700">Ciudad</Label>
                                            <Input id="city" name="city" required placeholder="Ej. CABA" value={formData.city} onChange={handleInputChange} className="h-12 bg-zinc-50 focus-visible:ring-zinc-900 text-base" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="zipCode" className="font-semibold text-zinc-700">Código Postal</Label>
                                            <Input id="zipCode" name="zipCode" required placeholder="Ej. 1043" value={formData.zipCode} onChange={handleInputChange} className="h-12 bg-zinc-50 focus-visible:ring-zinc-900 text-base uppercase" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="province" className="font-semibold text-zinc-700">Provincia</Label>
                                        <Input id="province" name="province" required placeholder="Ej. Buenos Aires" value={formData.province} onChange={handleInputChange} className="h-12 bg-zinc-50 focus-visible:ring-zinc-900 text-base" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Boton de Pago */}
                            <div className="pt-4">
                                <Button type="submit" className="w-full h-16 sm:h-20 text-lg sm:text-xl font-bold shadow-xl bg-[#009EE3] hover:bg-[#008EE3] text-white transition-all hover:-translate-y-1 active:scale-[0.98]" disabled={isLoading}>
                                    {isLoading ? (
                                        "Generando plataforma de pago..."
                                    ) : (
                                        <div className="flex items-center justify-center gap-3">
                                            <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
                                            Confirmar Pedido (${total.toLocaleString("es-AR")})
                                        </div>
                                    )}
                                </Button>
                                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6">
                                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-500">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        <span>Pagos Encriptados (SSL)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-500">
                                        <CreditCard className="h-4 w-4 text-zinc-400" />
                                        <span>Tarjetas y Efectivo via MercadoPago</span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Resumen del Pedido (Sidebar) */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <div className="sticky top-28">
                            <Card className="shadow-lg border-zinc-200/60 overflow-hidden bg-white">
                                <CardHeader className="bg-zinc-50/80 border-b border-zinc-100 py-5">
                                    <CardTitle className="text-lg font-bold flex items-center justify-between">
                                        <span>Resumen de compra</span>
                                        <span className="text-sm font-medium bg-zinc-200 text-zinc-800 px-2.5 py-1 rounded-full">{items.length} ítems</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="max-h-[40vh] lg:max-h-[500px] overflow-y-auto p-5 sm:p-6 space-y-5">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200/50">
                                                    {item.imageUrl ? (
                                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <ShoppingBag className="h-6 w-6 text-zinc-300" />
                                                        </div>
                                                    )}
                                                    <span className="absolute -top-1.5 -right-1.5 bg-zinc-800 text-white text-[11px] font-bold h-6 w-6 shadow-sm rounded-full flex items-center justify-center ring-2 ring-white">
                                                        {item.quantity}
                                                    </span>
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <h4 className="font-semibold text-sm sm:text-base text-zinc-800 line-clamp-2 leading-tight">{item.name}</h4>
                                                    <p className="text-zinc-500 text-sm mt-1 font-medium">
                                                        ${item.price.toLocaleString("es-AR")} c/u
                                                    </p>
                                                </div>
                                                <div className="font-bold text-zinc-900 self-center">
                                                    ${(item.price * item.quantity).toLocaleString("es-AR")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-zinc-50 p-5 sm:p-6 border-t border-zinc-100">
                                        <div className="space-y-3 mb-4">
                                            <div className="flex justify-between text-zinc-500 font-medium">
                                                <span>Subtotal</span>
                                                <span>${total.toLocaleString("es-AR")}</span>
                                            </div>
                                            <div className="flex justify-between text-zinc-500 font-medium">
                                                <span>Costo de envío</span>
                                                <span className="text-zinc-400">Calculado después</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end pt-4 border-t border-zinc-200/80">
                                            <span className="text-sm font-semibold text-zinc-600">Total a pagar</span>
                                            <span className="text-2xl font-black text-zinc-900 tracking-tight">
                                                ${total.toLocaleString("es-AR")}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex items-center justify-center gap-2 text-zinc-400 text-xs font-medium pb-8 lg:pb-0">
                                <Lock className="h-3.5 w-3.5" />
                                <span>Información protegida mediante cifrado de extremo a extremo.</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
