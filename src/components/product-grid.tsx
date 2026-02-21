"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, X, Tag, Package } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";

// Defined client-side — cannot be passed as a prop from a Server Component
const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number | null;
    description?: string | null;
    imageUrl?: string | null;
}

interface ProductDetailModalProps {
    product: Product | null;
    shopId: number;
    onClose: () => void;
}

function ProductDetailModal({ product, shopId, onClose }: ProductDetailModalProps) {
    if (!product) return null;

    const isOutOfStock = (product.stock ?? 0) === 0;
    const isLowStock = !isOutOfStock && (product.stock ?? 0) <= 5;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-[#FDFBF7] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col sm:flex-row animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-stone-900/10 hover:bg-stone-900/20 text-stone-700 rounded-full p-2 transition-all backdrop-blur-sm"
                    aria-label="Cerrar"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Image Panel */}
                <div className="relative w-full sm:w-[45%] aspect-square sm:aspect-auto flex-shrink-0 bg-stone-100">
                    {product.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                            <ShoppingBag className="h-20 w-20 text-stone-300 opacity-50" />
                        </div>
                    )}

                    {/* Stock badge overlay */}
                    {isOutOfStock && (
                        <div className="absolute top-4 left-4 bg-stone-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md">
                            AGOTADO
                        </div>
                    )}
                    {isLowStock && (
                        <div className="absolute top-4 left-4 bg-amber-700/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md">
                            ¡ÚLTIMOS {product.stock}!
                        </div>
                    )}
                </div>

                {/* Details Panel */}
                <div className="flex flex-col flex-1 p-6 sm:p-8 overflow-y-auto">
                    {/* Name */}
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight mb-3">
                        {product.name}
                    </h2>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-5">
                        <Tag className="h-4 w-4 text-amber-800" />
                        <span className="text-2xl font-medium text-stone-900 tracking-tight">
                            {formatMoney(product.price)}
                        </span>
                    </div>

                    {/* Description */}
                    {product.description ? (
                        <div className="mb-6">
                            <p className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-2">Descripción</p>
                            <p className="text-stone-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <p className="text-stone-400 text-sm italic">Sin descripción disponible.</p>
                        </div>
                    )}

                    {/* Stock info */}
                    {!isOutOfStock && (
                        <div className="flex items-center gap-2 mb-6 text-sm text-stone-500">
                            <Package className="h-4 w-4" />
                            <span>
                                {isLowStock
                                    ? `¡Solo quedan ${product.stock} unidades!`
                                    : `${product.stock} unidades disponibles`}
                            </span>
                        </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Divider */}
                    <div className="border-t border-stone-200 pt-5 mt-2">
                        <div className="[&>button]:w-full [&>button]:rounded-xl [&>button]:bg-stone-900 [&>button:hover]:bg-amber-800 [&>button]:transition-colors [&>button]:shadow-md [&>button]:h-12 [&>button]:text-base">
                            <AddToCartButton
                                product={{ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl ?? null }}
                                shopId={shopId}
                                disabled={isOutOfStock}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ProductGridProps {
    products: Product[];
    shopId: number;
}

export function ProductGrid({ products, shopId }: ProductGridProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="group border-none shadow-none bg-transparent flex flex-col cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                    >
                        <div className="aspect-[4/5] relative bg-stone-100 rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                                    <ShoppingBag className="h-16 w-16 text-stone-300 opacity-50" />
                                </div>
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Ver detalles hint */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="bg-white/90 backdrop-blur-sm text-stone-800 text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                                    Ver detalles
                                </span>
                            </div>

                            {(product.stock ?? 0) === 0 && (
                                <div className="absolute top-4 left-4 bg-stone-900/90 text-[#FDFBF7] text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md">
                                    AGOTADO
                                </div>
                            )}
                            {(product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5 && (
                                <div className="absolute top-4 left-4 bg-amber-700/90 text-[#FDFBF7] text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md">
                                    ¡ÚLTIMOS {product.stock}!
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col flex-1 px-2">
                            <div className="flex justify-between items-start gap-2 mb-1">
                                <h3 className="font-serif font-semibold text-lg line-clamp-2 leading-snug text-stone-800 group-hover:text-amber-800 transition-colors">
                                    {product.name}
                                </h3>
                            </div>

                            {product.description && (
                                <p className="text-sm text-stone-500 line-clamp-2 mt-1 mb-3 font-light">
                                    {product.description}
                                </p>
                            )}

                            <div className="mt-auto pt-2 flex items-center justify-between">
                                <span className="text-xl font-medium text-stone-900 tracking-tight">
                                    {formatMoney(product.price)}
                                </span>
                            </div>
                            <div className="mt-4 w-full" onClick={(e) => e.stopPropagation()}>
                                <div className="[&>button]:w-full [&>button]:rounded-xl [&>button]:bg-stone-900 [&>button:hover]:bg-amber-800 [&>button]:transition-colors [&>button]:shadow-md">
                                    <AddToCartButton
                                        product={{ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl ?? null }}
                                        shopId={shopId}
                                        disabled={(product.stock ?? 0) === 0}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    shopId={shopId}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </>
    );
}
