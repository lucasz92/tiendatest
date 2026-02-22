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
    categoryId?: number | null;
    description?: string | null;
    imageUrl?: string | null;
    images?: string[] | null;
    variants?: { name: string; options: string[] }[] | null;
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
                                <Image src={url} alt="" fill className="object-cover" sizes="48px" />
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
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

    useEffect(() => {
        setActiveIdx(0);
        // Pre-select first option of each variant when product changes
        if (product?.variants) {
            const initial: Record<string, string> = {};
            product.variants.forEach(v => {
                if (v.options.length > 0) initial[v.name] = v.options[0];
            });
            setSelectedVariants(initial);
        } else {
            setSelectedVariants({});
        }
    }, [product?.id, product?.variants]);

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

            {/* Backdrop */}
            <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-8" onClick={onClose}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal */}
                <div
                    className="relative z-10 w-full lg:w-[920px] xl:w-[1080px] max-h-[92dvh] lg:max-h-[88vh] rounded-t-[2rem] lg:rounded-[2rem] shadow-2xl overflow-hidden grid lg:grid-cols-2 animate-in slide-in-from-bottom duration-300 lg:zoom-in-95"
                    onClick={e => e.stopPropagation()}
                >
                    {/* ── LEFT: Image panel ─────────────────────────────── */}
                    <div className="relative flex flex-col bg-stone-900 overflow-hidden">

                        {/* Main image — mobile: fixed height, desktop: fill full height */}
                        <div
                            className={`relative h-[60vw] max-h-[360px] lg:h-full lg:max-h-none ${allImages.length > 0 ? "cursor-zoom-in" : ""}`}
                            onClick={() => allImages.length > 0 && setLightboxOpen(true)}
                        >
                            {activeImage ? (
                                <Image
                                    src={activeImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-700"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 gap-3">
                                    <ShoppingBag className="h-16 w-16 text-stone-300" />
                                    <p className="text-stone-400 text-sm">Sin imagen</p>
                                </div>
                            )}
                            {/* Bottom gradient overlay */}
                            {activeImage && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                            )}

                            {/* Stock badge — sits on gradient */}
                            {isOutOfStock && (
                                <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full tracking-wider uppercase">
                                    Agotado
                                </div>
                            )}
                            {isLowStock && (
                                <div className="absolute bottom-16 left-4 lg:bottom-4 bg-amber-600/90 backdrop-blur-md border border-amber-400/30 text-white text-xs font-semibold px-4 py-1.5 rounded-full tracking-wider uppercase">
                                    ¡Últimas {product.stock}!
                                </div>
                            )}

                            {/* Zoom icon */}
                            {activeImage && (
                                <div className="absolute top-4 right-14 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full p-2 lg:flex hidden">
                                    <ZoomIn className="h-4 w-4" />
                                </div>
                            )}

                            {/* Mobile close */}
                            <button onClick={onClose} className="lg:hidden absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white rounded-full p-2">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Thumbnail strip */}
                        {allImages.length > 1 && (
                            <div className="absolute bottom-2 left-0 right-0 flex gap-2 justify-center px-4">
                                {allImages.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveIdx(i)}
                                        className={`relative w-11 h-11 flex-shrink-0 rounded-xl overflow-hidden transition-all duration-200 border-2 ${i === activeIdx ? "border-white scale-110 shadow-lg" : "border-white/30 opacity-60 hover:opacity-100 hover:border-white/60"}`}
                                    >
                                        <Image src={url} alt="" fill className="object-cover" sizes="44px" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Details panel ────────────────────────────── */}
                    <div className="flex flex-col overflow-y-auto bg-[#FDFCF9]">
                        {/* Desktop close */}
                        <button
                            onClick={onClose}
                            className="hidden lg:flex absolute top-5 right-5 z-20 w-9 h-9 items-center justify-center bg-stone-900/10 hover:bg-stone-900/20 text-stone-600 rounded-full transition-all"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex flex-col min-h-full p-7 lg:p-10">
                            {/* Eyebrow */}
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700/70 mb-3">
                                ✶ Exclusivo
                            </p>

                            {/* Name */}
                            <h2 className="font-serif text-2xl lg:text-[2rem] font-bold text-stone-900 leading-tight mb-4 pr-10">
                                {product.name}
                            </h2>

                            {/* Price */}
                            <div className="inline-flex items-baseline gap-1 mb-6 self-start">
                                <span className="text-2xl lg:text-3xl font-light text-stone-800 tracking-tight">
                                    {formatMoney(product.price)}
                                </span>
                            </div>

                            {/* Ornamental divider */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-px flex-1 bg-stone-200" />
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-700/50" />
                                <div className="h-px flex-1 bg-stone-200" />
                            </div>
                            {product.description ? (
                                <div className="mb-6">
                                    <p className="text-stone-500 text-sm leading-relaxed whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </div>
                            ) : null}

                            {/* Stock indicator */}
                            {!isOutOfStock && (
                                <div className={`inline-flex items-center gap-2 text-xs mb-6 self-start px-3 py-1.5 rounded-full ${isLowStock ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isLowStock ? "bg-amber-500" : "bg-emerald-500"}`} />
                                    {isLowStock ? `Solo quedan ${product.stock} unidades` : `${product.stock} disponibles`}
                                </div>
                            )}

                            {/* Variants */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="mb-6 space-y-5">
                                    {product.variants.map((variant) => (
                                        <div key={variant.name}>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 mb-2.5">{variant.name}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {variant.options.map((option) => {
                                                    const isSelected = selectedVariants[variant.name] === option;
                                                    return (
                                                        <button
                                                            key={option}
                                                            onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: option }))}
                                                            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-150 ${isSelected
                                                                ? "border-stone-900 bg-stone-900 text-white shadow-md"
                                                                : "border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:shadow-sm"
                                                                }`}
                                                        >
                                                            {option}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex-1" />

                            {/* CTA */}
                            <div className="mt-6 space-y-3">
                                <AddToCartButton
                                    product={{
                                        id: product.id,
                                        name: product.name,
                                        price: product.price,
                                        imageUrl: product.imageUrl ?? null
                                    }}
                                    shopId={shopId}
                                    disabled={isOutOfStock}
                                    selectedVariants={selectedVariants}
                                />
                                {allImages.length > 1 && (
                                    <p className="text-center text-[11px] text-stone-400 tracking-wide">
                                        Clic en la imagen para ver en detalle
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
    categories?: { id: number; name: string; slug: string }[];
}

export function ProductGrid({ products, shopId, categories = [] }: ProductGridProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const filteredProducts = selectedCategoryId
        ? products.filter(p => p.categoryId === selectedCategoryId)
        : products;

    return (
        <>
            {categories.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8 md:mb-12">
                    <button
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategoryId === null
                            ? "bg-amber-800 text-white shadow-md hover:bg-amber-900"
                            : "bg-white text-stone-600 border border-stone-200 hover:border-stone-400 hover:text-stone-900"
                            }`}
                        onClick={() => setSelectedCategoryId(null)}
                    >
                        Todos
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategoryId === cat.id
                                ? "bg-amber-800 text-white shadow-md hover:bg-amber-900"
                                : "bg-white text-stone-600 border border-stone-200 hover:border-stone-400 hover:text-stone-900"
                                }`}
                            onClick={() => setSelectedCategoryId(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            )}

            {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-stone-500 font-medium">No hay productos en esta categoría.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.map((product, index) => {
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
                                        <Image src={mainImage} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" priority={index < 4} />
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
            )}

            {selectedProduct && (
                <ProductDetailModal product={selectedProduct} shopId={shopId} onClose={() => setSelectedProduct(null)} />
            )}
        </>
    );
}
