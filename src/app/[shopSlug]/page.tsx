import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingBag, Star, PackageSearch, Heart, Scissors, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartSheet } from "@/components/cart-sheet";
import { ProductGrid } from "@/components/product-grid";

import { db } from "@/db";
import { shops, products } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function TenantStorefront({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = await params;

  // 1. Buscamos la tienda por su Slug
  const shopData = await db.select().from(shops).where(eq(shops.slug, shopSlug));

  if (shopData.length === 0) {
    notFound(); // Devuelve 404 si la tienda no existe
  }

  const shop = shopData[0];

  // 2. Buscamos los productos asociados a esta tienda
  const shopProducts = await db
    .select()
    .from(products)
    .where(eq(products.shopId, shop.id));

  // Funciones formateadoras — used server-side for display
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans antialiased text-stone-800">
      {/* Header Premium y Cálido */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200/60 shadow-sm transition-all">
        <div className="container mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
          <Link href={`/${shop.slug}`} className="flex items-center gap-2 md:gap-3">
            <div className="h-8 w-8 md:h-10 md:w-10 bg-amber-800 rounded-full flex items-center justify-center shadow-inner shrink-0">
              <span className="text-[#FDFBF7] font-serif font-bold text-lg md:text-xl">{shop.name.charAt(0)}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl md:text-2xl tracking-wide text-stone-900 leading-none truncate max-w-[150px] sm:max-w-[300px]">{shop.name}</span>
              <span className="text-[10px] md:text-xs text-amber-800/80 uppercase tracking-widest font-medium mt-0.5 md:mt-1">Hecho a mano</span>
            </div>
          </Link>

          <div className="flex items-center gap-3 md:gap-4">
            <nav className="hidden lg:flex gap-6 mr-4 text-sm font-medium tracking-wide text-stone-600">
              <Link href="#coleccion" className="hover:text-amber-800 transition-colors">Colección</Link>
              <Link href="#historia" className="hover:text-amber-800 transition-colors">Nuestra Historia</Link>
            </nav>
            <CartSheet />
          </div>
        </div>
      </header>

      {/* Hero Elegante */}
      <section className="relative w-full overflow-hidden bg-stone-100">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-[#FDFBF7] opacity-90 z-0"></div>
        {/* Decoración sutil de fondo para similar hilos/tejidos */}
        <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-32 flex flex-col items-center text-center">
          <Badge className="bg-amber-100/50 text-amber-900 border border-amber-200/50 mb-6 md:mb-8 hover:bg-amber-100 px-3 md:px-4 py-1 md:py-1.5 text-[10px] md:text-xs tracking-widest uppercase font-semibold">
            Nueva Colección Disponible
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-stone-900 max-w-4xl leading-[1.1] md:leading-[1.15] mb-4 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Artesanía y dedicación en cada <span className="text-amber-800 italic">hilo</span>.
          </h1>
          <p className="text-stone-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-8 md:mb-10 px-2 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-forwards opacity-0">
            Descubre nuestra selección exclusiva de tejidos hechos a mano. Piezas únicas, diseñadas para brindarte calidez, estilo y confort con materiales 100% naturales.
          </p>
          <div className="flex w-full sm:w-auto gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-forwards opacity-0">
            <Link href="#coleccion" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-amber-800 hover:bg-amber-900 text-[#FDFBF7] rounded-full px-8 h-12 md:h-14 text-sm md:text-base font-medium shadow-xl shadow-amber-900/20 transition-all hover:-translate-y-1 active:scale-95">
                Ver Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Valores / Historia */}
      <section id="historia" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10 lg:gap-16 max-w-5xl mx-auto text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 mb-2">
                <Heart className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-stone-900">Pasión Artesanal</h3>
              <p className="text-stone-600 text-sm leading-relaxed">Cada pieza es tejida a mano con amor, cuidando hasta el último detalle para asegurar la máxima calidad.</p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 mb-2">
                <Sparkles className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-stone-900">Materiales Premium</h3>
              <p className="text-stone-600 text-sm leading-relaxed">Seleccionamos cuidadosamente fibras naturales y lanas suaves que respetan tu piel y el medio ambiente.</p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 mb-2">
                <Scissors className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-stone-900">Diseño Único</h3>
              <p className="text-stone-600 text-sm leading-relaxed">No hay dos iguales. Al ser hechas a mano, cada prenda tiene su propia identidad y personalidad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo de Productos */}
      <main id="coleccion" className="container mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="flex flex-col items-center justify-center mb-10 md:mb-16 space-y-3 md:space-y-4 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-stone-900">Colección Exclusiva</h2>
          <div className="h-1 w-16 md:w-24 bg-amber-800/30 rounded-full mx-auto"></div>
          <p className="text-stone-500 max-w-xl text-sm md:text-base px-4">
            Explora nuestra variedad de productos. {shopProducts.length} artículos disponibles esperando por ti.
          </p>
        </div>

        {shopProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 px-4 text-center bg-stone-50 rounded-3xl border border-stone-200/60 shadow-inner mx-2 md:mx-0">
            <PackageSearch className="h-16 w-16 md:h-20 md:w-20 text-stone-300 mb-4 md:mb-6" />
            <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-700">Aún estamos tejiendo...</h3>
            <p className="text-stone-500 mt-2 max-w-sm md:max-w-md text-sm md:text-base">
              Pronto subiremos nuestros primeros productos a la tienda. ¡Vuelve en unos días!
            </p>
          </div>
        ) : (
          <ProductGrid
            products={shopProducts}
            shopId={shop.id}
          />
        )}
      </main>

      {/* Footer Elegante */}
      <footer className="bg-stone-900 text-stone-400 py-12 md:py-16 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex flex-col gap-3">
            <Link href={`/${shop.slug}`} className="inline-flex items-center gap-3 justify-center md:justify-start">
              <div className="h-8 w-8 bg-amber-800/20 text-amber-600 rounded-full flex items-center justify-center">
                <span className="font-serif font-bold text-sm">{shop.name.charAt(0)}</span>
              </div>
              <span className="font-serif font-bold text-xl text-stone-200 tracking-wide">{shop.name}</span>
            </Link>
            <p className="text-sm max-w-[250px] md:max-w-xs mx-auto md:mx-0">
              Tejidos artesanales creados para acompañarte en tus mejores momentos.
            </p>
          </div>

          <div className="flex flex-col gap-6 items-center md:items-end">
            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm font-medium">
              <Link href="#" className="hover:text-stone-200 transition-colors py-2 md:py-0">Instagram</Link>
              <Link href="#" className="hover:text-stone-200 transition-colors py-2 md:py-0">Facebook</Link>
              <Link href="#" className="hover:text-stone-200 transition-colors py-2 md:py-0">Contacto</Link>
            </div>
            <p className="text-xs text-stone-500 px-4 md:px-0 leading-relaxed">
              © {new Date().getFullYear()} {shop.name}. Todos los derechos reservados.<br />
              <span className="opacity-60">Impulsado por TiendaFácil.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
