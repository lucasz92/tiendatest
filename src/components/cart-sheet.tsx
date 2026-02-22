"use client";

import { useCartStore } from "@/lib/cart-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Minus, Plus, Trash2, ShieldCheck, Lock, Ticket, XCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function CartSheet() {
    const router = useRouter();
    const { items, removeItem, updateQuantity, getCartTotal, shopId, coupon, applyCoupon, removeCoupon } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Coupon state
    const [couponInput, setCouponInput] = useState("");
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    // Avoid hydration errors with persist middleware
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <Button variant="outline" className="relative group hover:bg-zinc-100 gap-2">
                <ShoppingBag className="h-4 w-4 text-zinc-700" />
                <span className="text-sm font-medium text-zinc-700">Mi carrito</span>
            </Button>
        );
    }

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const total = getCartTotal();

    const handleCheckout = () => {
        setIsOpen(false);
        const currentPath = window.location.pathname;
        router.push(`${currentPath}/checkout`);
    };

    const handleApplyCoupon = async () => {
        if (!couponInput.trim() || !shopId) return;

        setIsValidatingCoupon(true);
        try {
            const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
            const res = await fetch(`/api/shop/${shopId}/validate-coupon`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponInput, cartTotal: subtotal })
            });

            const data = await res.json();

            if (data.valid) {
                applyCoupon({ code: data.code, discountAmount: data.discountAmount });
                setCouponInput("");
                toast.success(`¡Cupón ${data.code} aplicado con éxito!`);
            } else {
                toast.error(data.error || "Código inválido");
            }
        } catch (error) {
            toast.error("Error al validar el cupón");
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    // If cart contents change, re-validate or remove coupon if minAmount is no longer met.
    // simpler approach: recalculate discountAmount or clear the coupon if items change significantly
    // For MVP we just keep the coupon applied until checkout where it is fully verified again.

    // The previous cart total calculation without coupon (subtotal)
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="relative group hover:bg-zinc-100 gap-2 pr-4">
                    <ShoppingBag className="h-4 w-4 text-zinc-700 group-hover:text-zinc-900 transition-colors" />
                    <span className="text-sm font-medium text-zinc-700">Mi carrito</span>
                    {itemCount > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0">
                            {itemCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent className="flex flex-col w-[90%] sm:max-w-md p-4 sm:p-6 bg-white">
                <SheetHeader className="pb-4 border-b">
                    <SheetTitle className="flex items-center gap-2 text-xl font-bold text-zinc-800">
                        <ShoppingBag className="h-5 w-5" />
                        Tu Carrito ({itemCount})
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto mt-4 pr-2">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4">
                            <ShoppingBag className="h-20 w-20 stroke-[1]" />
                            <p className="text-sm font-medium">Tu carrito está vacío</p>
                        </div>
                    ) : (
                        <ul className="space-y-6">
                            {items.map((item) => (
                                <li key={item.cartItemId} className="flex gap-4 relative">
                                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                                        {item.imageUrl ? (
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                                                <ShoppingBag className="h-7 w-7 text-stone-300" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div className="pr-6">
                                            <h4 className="font-semibold text-sm sm:text-base text-zinc-800 line-clamp-2 leading-tight">{item.name}</h4>
                                            {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                                                <div className="text-xs text-zinc-500 mt-1 flex flex-wrap gap-x-2 gap-y-1">
                                                    {Object.entries(item.selectedVariants).map(([k, v]) => (
                                                        <span key={k} className="bg-zinc-100 px-1.5 py-0.5 rounded-sm">
                                                            {k}: <span className="font-semibold text-zinc-700">{v}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-zinc-700 text-sm mt-1.5 font-semibold">
                                                ${item.price.toLocaleString("es-AR")}
                                            </p>
                                        </div>

                                        <button
                                            className="absolute top-1 right-0 text-zinc-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                            onClick={() => removeItem(item.cartItemId)}
                                            aria-label="Eliminar producto"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center border border-zinc-200 rounded-md bg-white shadow-sm overflow-hidden h-8">
                                                <button
                                                    className="px-3 h-full hover:bg-zinc-100 transition-colors text-zinc-600 flex items-center justify-center"
                                                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-xs font-semibold w-8 text-center text-zinc-800">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    className="px-3 h-full hover:bg-zinc-100 transition-colors text-zinc-600 flex items-center justify-center"
                                                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="border-t pt-5 mt-4">
                    {/* Coupon Input Area */}
                    {!coupon && items.length > 0 && (
                        <div className="mb-4 flex gap-2">
                            <div className="relative flex-1 text-zinc-500 flex items-center">
                                <Ticket className="absolute left-3 w-4 h-4" />
                                <Input
                                    className="pl-9 h-10 font-mono text-sm uppercase placeholder:normal-case"
                                    placeholder="Código de descuento"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                />
                            </div>
                            <Button
                                variant="secondary"
                                className="h-10 px-4 font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200"
                                onClick={handleApplyCoupon}
                                disabled={isValidatingCoupon || !couponInput.trim()}
                            >
                                {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                            </Button>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 mb-4 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                        <div className="flex justify-between text-sm text-zinc-600 font-medium">
                            <span>Subtotal</span>
                            <span>${subtotal.toLocaleString("es-AR")}</span>
                        </div>
                        {coupon && (
                            <div className="flex justify-between text-sm text-green-600 font-medium shrink-0 flex-wrap">
                                <span className="flex items-center gap-1.5 break-all max-w-[80%]">
                                    <Ticket className="w-4 h-4 shrink-0" />
                                    <span>Cupón ({coupon.code})</span>
                                    <button
                                        onClick={removeCoupon}
                                        className="text-zinc-400 hover:text-red-500 ml-1 shrink-0 transition-colors"
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                                <span className="shrink-0">-${coupon.discountAmount.toLocaleString("es-AR")}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-zinc-600 font-medium">
                            <span>Envío</span>
                            <span className="text-zinc-400">Calculado en el checkout</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-zinc-900 pt-2 border-t mt-1">
                            <span>Total Estimado</span>
                            <span>${total.toLocaleString("es-AR")}</span>
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 text-base font-semibold shadow-md gap-2 bg-[#009EE3] hover:bg-[#008EE3] text-white"
                        disabled={items.length === 0}
                        onClick={handleCheckout}
                    >
                        <Lock className="h-4 w-4" />
                        Pagar y Confirmar
                    </Button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-zinc-500 font-medium pb-2 sm:pb-0">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        Transacción 100% segura
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
