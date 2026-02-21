"use client";

import { useCartStore } from "@/lib/cart-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Minus, Plus, Trash2, ShieldCheck, Lock } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function CartSheet() {
    const router = useRouter();
    const { items, removeItem, updateQuantity, getCartTotal, shopId } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Avoid hydration errors with persist middleware
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <Button variant="outline" size="icon" className="relative group hover:bg-zinc-100">
                <ShoppingBag className="h-5 w-5 text-zinc-700" />
            </Button>
        );
    }

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const total = getCartTotal();

    const handleCheckout = () => {
        setIsOpen(false);
        // Asumimos que podemos recuperar el slug usando el window o pasarlo por props,
        // pero en Next.js App Router es más fácil extraerlo de la URL actual si estamos en /[shopSlug]
        const currentPath = window.location.pathname; // ej: /tienda-123
        router.push(`${currentPath}/checkout`);
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative group hover:bg-zinc-100">
                    <ShoppingBag className="h-5 w-5 text-zinc-700 group-hover:text-zinc-900 transition-colors" />
                    {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
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
                                <li key={item.id} className="flex gap-4 relative">
                                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-zinc-50 border border-zinc-100 flex-shrink-0">
                                        {item.imageUrl ? (
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <ShoppingBag className="h-6 w-6 text-zinc-300" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div className="pr-6">
                                            <h4 className="font-semibold text-sm sm:text-base text-zinc-800 line-clamp-2 leading-tight">{item.name}</h4>
                                            <p className="text-zinc-500 text-sm mt-1 font-medium">
                                                ${item.price.toLocaleString("es-AR")}
                                            </p>
                                        </div>

                                        <button
                                            className="absolute top-1 right-0 text-zinc-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                            onClick={() => removeItem(item.id)}
                                            aria-label="Eliminar producto"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center border border-zinc-200 rounded-md bg-white shadow-sm overflow-hidden h-8">
                                                <button
                                                    className="px-3 h-full hover:bg-zinc-100 transition-colors text-zinc-600 flex items-center justify-center"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-xs font-semibold w-8 text-center text-zinc-800">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    className="px-3 h-full hover:bg-zinc-100 transition-colors text-zinc-600 flex items-center justify-center"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                    <div className="flex flex-col gap-2 mb-4 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                        <div className="flex justify-between text-sm text-zinc-600 font-medium">
                            <span>Subtotal</span>
                            <span>${total.toLocaleString("es-AR")}</span>
                        </div>
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
