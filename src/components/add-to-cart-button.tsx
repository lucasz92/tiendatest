"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, CartItem } from "@/lib/cart-store";
import { toast } from "sonner";

export function AddToCartButton({
    product,
    shopId,
    disabled,
    selectedVariants,
}: {
    product: { id: number; name: string; price: number; imageUrl: string | null };
    shopId: number;
    disabled?: boolean;
    selectedVariants?: Record<string, string>;
}) {
    const addItem = useCartStore((state) => state.addItem);

    const handleAdd = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            shopId,
            selectedVariants,
        });
        toast.success(`${product.name} agregado al carrito`);
    };

    return (
        <Button
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-sm transition-all"
            disabled={disabled}
            onClick={handleAdd}
        >
            <ShoppingBag className="mr-2 h-4 w-4" />
            {disabled ? "Sin stock" : "Agregar al carrito"}
        </Button>
    );
}
