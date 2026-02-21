"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ShoppingBag, X, ChevronLeft, ChevronRight, ZoomIn, ShoppingCart, Package } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";

const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number | null;
    description?: string | null;
    imageUrl?: string | null;
    images?: string[] | null;
}

function getImages(product: Product): string[] {
    if (product.images && product.images.length > 0) return product.images;
    if (product.imageUrl) return [product.imageUrl];
    return [];
}

// ─── Lightbox ───────────────────────────────────────────────────────────────
interface LightboxProps {
    images: string[];
    initialIndex: number;
    productName: string;
    onClose: () => void;
}

function Lightbox({ images, initialIndex, productName, onClose }: LightboxProps) {
    const [current, setCurrent] = useState(initialIndex);
    const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
    const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose, prev, next]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95" onClick={onClose}>
            <button onClick={onClose} className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-all z-10">
                <X className="h-5 w-5" />
            </button>
            {images.length > 1 && (
                <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm bg-white/10 px-3 py-1 rounded-full">
                    {current + 1} / {images.length}
                </div>
            )}
            <div className="relative w-full h-full max-w-4xl max-h-[90vh] mx-8 flex items-center justify-center" onClick={e => e.stopPropagation()}>
                <Image src={images[current]} alt={`${productName} ${current + 1}`} fill className="object-contain" sizes="90vw" priority />
            </div>
            {images.length > 1 && (
                <>
                    <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((url, i) => (
                            <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i); }} className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === current ? "border-white scale-110" : "border-white/30 hover:border-white/60"}`}>
                                <Image src={url} alt="" fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Product Detail Modal ────────────────────────────────────────────────────
interface ProductDetailModalProps {
    product: Product | null;
    shopId: number;
    onClose: () => void;
}

function ProductDetailModal({ product, shopId, onClose }: ProductDetailModalProps) {
    const [activeIdx, setActiveIdx] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    useEffect(() => { setActiveIdx(0); }, [product?.id]);

    if (!product) return null;

    const isOutOfStock = (product.stock ?? 0) === 0;
    const isLowStock = !isOutOfStock && (product.stock ?? 0) <= 5;
    const allImages = getImages(product);
    const activeImage = allImages[activeIdx] ?? null;

    return (
        <>
            {lightboxOpen && allImages.length > 0 && (
                <Lightbox images={allImages} initialIndex={activeIdx} productName={product.name} onClose={() => setLightboxOpen(false)} />
            )}

            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

                {/* Modal container */}
                <div
                    className="relative bg-white w-full sm:max-w-3xl max-h-[95dvh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row animate-in slide-in-from-bottom sm:zoom-in-95 duration-300"
                    onClick={e => e.stopPropagation()}
                >
                    {/* ── LEFT: Image panel ────────────────────────────── */}
                    <div className="relative w-full sm:w-[52%] flex-shrink-0 flex flex-col bg-stone-100">

                        {/* Main image */}
                        <div
                            className={`relative flex-1 min-h-[280px] sm:min-h-0 sm:aspect-auto ${allImages.length > 0 ? "cursor-zoom-in" : ""}`}
                            onClick={() => allImages.length > 0 && setLightboxOpen(true)}
                        >
                            {activeImage ? (
                                <Image
                                    src={activeImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, 52vw"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 gap-3">
                                    <ShoppingBag className="h-16 w-16 text-stone-300" />
                                    <p className="text-stone-400 text-sm">Sin imagen</p>
                                </div>
                            )}

                            {/* Zoom hint overlay */}
                            {activeImage && (
                                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <div className="opacity-0 hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-stone-800 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium shadow-lg">
                                        <ZoomIn className="h-4 w-4" /> Ampliar
                                    </div>
                                </div>
                            )}

                            {/* Stock badge */}
                            {isOutOfStock && (
                                <div className="absolute top-4 left-4 bg-stone-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-full">AGOTADO</div>
                            )}
                            {isLowStock && (
                                <div className="absolute top-4 left-4 bg-amber-700/90 text-white text-xs font-bold px-3 py-1.5 rounded-full">¡ÚLTIMOS {product.stock}!</div>
                            )}

                            {/* Close button (mobile) */}
                            <button onClick={onClose} className="sm:hidden absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-stone-700 rounded-full p-2 shadow-md">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Thumbnail strip */}
                        {allImages.length > 1 && (
                            <div className="flex gap-1.5 p-2.5 bg-white/80 backdrop-blur-sm border-t border-stone-100 overflow-x-auto">
                                {allImages.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveIdx(i)}
                                        className={`relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden transition-all ${i === activeIdx ? "ring-2 ring-amber-700 ring-offset-1" : "opacity-60 hover:opacity-100"}`}
                                    >
                                        <Image src={url} alt="" fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Details panel ─────────────────────────── */}
                    <div className="flex flex-col flex-1 overflow-y-auto">
                        {/* Close (desktop) */}
                        <button onClick={onClose} className="hidden sm:flex absolute top-4 right-4 z-10 items-center justify-center bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full p-2 transition-all">
                            <X className="h-4 w-4" />
                        </button>

                        <div className="p-6 sm:p-8 flex flex-col h-full">
                            {/* Name */}
                            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight mb-2 pr-8">
                                {product.name}
                            </h2>

                            {/* Price */}
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-3xl font-light text-stone-900 tracking-tight">
                                    {formatMoney(product.price)}
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-stone-100 mb-5" />

                            {/* Description */}
                            {product.description ? (
                                <div className="mb-5">
                                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Descripción</p>
                                    <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </div>
                            ) : null}

                            {/* Stock */}
                            {!isOutOfStock && (
                                <div className="flex items-center gap-2 text-xs text-stone-400 mb-5">
                                    <Package className="h-3.5 w-3.5" />
                                    <span>
                                        {isLowStock ? `Solo quedan ${product.stock} unidades` : `${product.stock} disponibles`}
                                    </span>
                                </div>
                            )}

                            <div className="flex-1" />

                            {/* Add to cart */}
                            <div className="pt-4 border-t border-stone-100 space-y-3">
                                <div className="[&>button]:w-full [&>button]:h-12 [&>button]:rounded-xl [&>button]:bg-stone-900 [&>button:not(:disabled):hover]:bg-amber-800 [&>button]:transition-colors [&>button]:font-semibold [&>button]:text-sm [&>button]:tracking-wide [&>button]:shadow-md">
                                    <AddToCartButton
                                        product={{ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl ?? null }}
                                        shopId={shopId}
                                        disabled={isOutOfStock}
                                    />
                                </div>
                                {allImages.length > 1 && (
                                    <p className="text-center text-xs text-stone-400">
                                        <ZoomIn className="h-3 w-3 inline mr-1" />
                                        Hacé clic en la imagen para ampliarla
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Product Grid ────────────────────────────────────────────────────────────
interface ProductGridProps {
    products: Product[];
    shopId: number;
}

export function ProductGrid({ products, shopId }: ProductGridProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => {
                    const images = getImages(product);
                    const mainImage = images[0] ?? null;

                    return (
                        <div
                            key={product.id}
                            className="group flex flex-col cursor-pointer"
                            onClick={() => setSelectedProduct(product)}
                        >
                            <div className="aspect-[4/5] relative bg-stone-100 rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                {mainImage ? (
                                    <Image src={mainImage} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                                        <ShoppingBag className="h-16 w-16 text-stone-300 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="bg-white/90 backdrop-blur-sm text-stone-800 text-xs font-semibold px-4 py-2 rounded-full shadow-lg">Ver detalles</span>
                                </div>
                                {images.length > 1 && (
                                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        +{images.length - 1} fotos
                                    </div>
                                )}
                                {(product.stock ?? 0) === 0 && (
                                    <div className="absolute top-4 left-4 bg-stone-900/90 text-[#FDFBF7] text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md">AGOTADO</div>
                                )}
                                {(product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5 && (
                                    <div className="absolute top-4 left-4 bg-amber-700/90 text-[#FDFBF7] text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md">¡ÚLTIMOS {product.stock}!</div>
                                )}
                            </div>
                            <div className="flex flex-col flex-1 px-1">
                                <h3 className="font-serif font-semibold text-lg line-clamp-2 leading-snug text-stone-800 group-hover:text-amber-800 transition-colors mb-1">
                                    {product.name}
                                </h3>
                                {product.description && (
                                    <p className="text-sm text-stone-500 line-clamp-2 mb-3 font-light">{product.description}</p>
                                )}
                                <div className="mt-auto pt-2 flex items-center justify-between mb-3">
                                    <span className="text-xl font-medium text-stone-900 tracking-tight">{formatMoney(product.price)}</span>
                                </div>
                                <div onClick={e => e.stopPropagation()}>
                                    <div className="[&>button]:w-full [&>button]:rounded-xl [&>button]:bg-stone-900 [&>button:not(:disabled):hover]:bg-amber-800 [&>button]:transition-colors [&>button]:shadow-md">
                                        <AddToCartButton
                                            product={{ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl ?? null }}
                                            shopId={shopId}
                                            disabled={(product.stock ?? 0) === 0}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedProduct && (
                <ProductDetailModal product={selectedProduct} shopId={shopId} onClose={() => setSelectedProduct(null)} />
            )}
        </>
    );
}
