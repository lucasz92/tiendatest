"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ShoppingBag, X, Tag, Package, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
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
    images?: string[] | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns the unified image array for a product */
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

    // Keyboard navigation
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
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Close */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-10"
                aria-label="Cerrar zoom"
            >
                <X className="h-6 w-6" />
            </button>

            {/* Counter */}
            {images.length > 1 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
                    {current + 1} / {images.length}
                </div>
            )}

            {/* Main image */}
            <div
                className="relative w-full h-full max-w-4xl max-h-[90vh] mx-4 flex items-center justify-center"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative w-full h-full">
                    <Image
                        src={images[current]}
                        alt={`${productName} — imagen ${current + 1}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 80vw"
                        priority
                    />
                </div>
            </div>

            {/* Prev/Next arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={e => { e.stopPropagation(); prev(); }}
                        className="absolute left-3 sm:left-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/25 rounded-full p-3 transition-all"
                        aria-label="Imagen anterior"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); next(); }}
                        className="absolute right-3 sm:right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/25 rounded-full p-3 transition-all"
                        aria-label="Imagen siguiente"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((url, i) => (
                        <button
                            key={i}
                            onClick={e => { e.stopPropagation(); setCurrent(i); }}
                            className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === current ? "border-white scale-110" : "border-white/30 hover:border-white/60"}`}
                        >
                            <Image src={url} alt="" fill className="object-cover" />
                        </button>
                    ))}
                </div>
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
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Reset active image when product changes
    useEffect(() => { setActiveImageIndex(0); }, [product?.id]);

    if (!product) return null;

    const isOutOfStock = (product.stock ?? 0) === 0;
    const isLowStock = !isOutOfStock && (product.stock ?? 0) <= 5;
    const allImages = getImages(product);
    const activeImage = allImages[activeImageIndex] ?? null;

    return (
        <>
            {/* Lightbox */}
            {lightboxOpen && allImages.length > 0 && (
                <Lightbox
                    images={allImages}
                    initialIndex={activeImageIndex}
                    productName={product.name}
                    onClose={() => setLightboxOpen(false)}
                />
            )}

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal */}
                <div
                    className="relative bg-[#FDFBF7] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col sm:flex-row animate-in fade-in zoom-in-95 duration-200"
                    onClick={e => e.stopPropagation()}
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
                    <div className="relative w-full sm:w-[45%] flex-shrink-0 flex flex-col">
                        {/* Main image */}
                        <div
                            className={`relative flex-1 aspect-square sm:aspect-auto bg-stone-100 ${allImages.length > 0 ? "cursor-zoom-in" : ""}`}
                            onClick={() => allImages.length > 0 && setLightboxOpen(true)}
                            title={allImages.length > 0 ? "Clic para ampliar" : undefined}
                        >
                            {activeImage ? (
                                <>
                                    <Image
                                        src={activeImage}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Zoom hint */}
                                    <div className="absolute bottom-2 right-2 bg-black/40 text-white rounded-full p-1.5 backdrop-blur-sm">
                                        <ZoomIn className="h-4 w-4" />
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                                    <ShoppingBag className="h-20 w-20 text-stone-300 opacity-50" />
                                </div>
                            )}

                            {/* Stock badge */}
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

                        {/* Thumbnail strip — shown if more than 1 image */}
                        {allImages.length > 1 && (
                            <div className="flex gap-1.5 p-2 bg-stone-50 overflow-x-auto">
                                {allImages.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImageIndex(i)}
                                        className={`relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === activeImageIndex ? "border-amber-700 scale-95" : "border-transparent hover:border-stone-300"}`}
                                        aria-label={`Ver imagen ${i + 1}`}
                                    >
                                        <Image src={url} alt="" fill className="object-cover" />
                                    </button>
                                ))}
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

                        {/* Add to cart */}
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
                            className="group border-none shadow-none bg-transparent flex flex-col cursor-pointer"
                            onClick={() => setSelectedProduct(product)}
                        >
                            <div className="aspect-[4/5] relative bg-stone-100 rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                {mainImage ? (
                                    <Image
                                        src={mainImage}
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

                                {/* Multi-image indicator */}
                                {images.length > 1 && (
                                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        +{images.length - 1} fotos
                                    </div>
                                )}

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
                    );
                })}
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
