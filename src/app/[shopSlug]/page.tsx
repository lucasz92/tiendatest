import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ShoppingBag, Star, PackageSearch, Heart, Scissors, Sparkles, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartSheet } from "@/components/cart-sheet";
import { ProductGrid } from "@/components/product-grid";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { db } from "@/db";
import { shops, products, shopSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

// ──── SVG social icons (lucide doesn't have TikTok) ────────────────────────
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// ──── Dynamic metadata ──────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ shopSlug: string }> }): Promise<Metadata> {
  const { shopSlug } = await params;
  const shopData = await db
    .select({ name: shops.name, seoTitle: shopSettings.seoTitle, seoDescription: shopSettings.seoDescription })
    .from(shops)
    .leftJoin(shopSettings, eq(shops.id, shopSettings.shopId))
    .where(eq(shops.slug, shopSlug));

  if (!shopData[0]) return {};
  const s = shopData[0];
  return {
    title: s.seoTitle || `${s.name} — Tienda Online`,
    description: s.seoDescription || `Tienda online de ${s.name}`,
  };
}

// ──── Page ──────────────────────────────────────────────────────────────────
export default async function TenantStorefront({ params }: { params: Promise<{ shopSlug: string }> }) {
  const { shopSlug } = await params;

  const shopData = await db
    .select({
      id: shops.id,
      name: shops.name,
      slug: shops.slug,
      isActive: shopSettings.isActive,
      heroImage: shopSettings.heroImage,
      whatsappNumber: shopSettings.whatsappNumber,
      whatsappMessage: shopSettings.whatsappMessage,
      metaPixelId: shopSettings.metaPixelId,
      socialLinks: shopSettings.socialLinks,
    })
    .from(shops)
    .leftJoin(shopSettings, eq(shops.id, shopSettings.shopId))
    .where(eq(shops.slug, shopSlug));

  if (shopData.length === 0) notFound();

  const shop = shopData[0];
  const social = (shop.socialLinks as any) || {};

  if (shop.isActive === false) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h1 className="text-3xl font-serif font-bold text-stone-900">Tienda Suspendida</h1>
        <p className="text-stone-600 max-w-md">Esta tienda se encuentra temporalmente inactiva. Volvé más tarde o contactá al administrador.</p>
        <Link href="/"><Button variant="outline" className="mt-4 border-stone-300 text-stone-700 hover:bg-stone-100">Volver al Inicio</Button></Link>
      </div>
    );
  }

  const shopProducts = await db.select().from(products).where(eq(products.shopId, shop.id));

  // Social links list (only those with a value)
  const socialItems = [
    { key: "instagram", Icon: InstagramIcon, label: "Instagram", href: social.instagram },
    { key: "facebook", Icon: FacebookIcon, label: "Facebook", href: social.facebook },
    { key: "tiktok", Icon: TikTokIcon, label: "TikTok", href: social.tiktok },
    { key: "twitter", Icon: XIcon, label: "X / Twitter", href: social.twitter },
    { key: "youtube", Icon: YoutubeIcon, label: "YouTube", href: social.youtube },
  ].filter(s => s.href);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans antialiased text-stone-800">

      {/* ── Meta Pixel ──────────────────────────────────────────── */}
      {shop.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
                    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                    document,'script','https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${shop.metaPixelId}');
                    fbq('track', 'PageView');
                `}</Script>
      )}

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200/60 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
          <Link href={`/${shop.slug}`} className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="h-8 w-8 md:h-10 md:w-10 bg-amber-800 rounded-full flex items-center justify-center shadow-inner shrink-0">
              <span className="text-[#FDFBF7] font-serif font-bold text-lg md:text-xl">{shop.name.charAt(0)}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-xl md:text-2xl tracking-wide text-stone-900 leading-none truncate max-w-[150px] sm:max-w-[260px]">{shop.name}</span>
              <span className="text-[10px] md:text-xs text-amber-800/80 uppercase tracking-widest font-medium mt-0.5">Hecho a mano</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Social pills in header */}
            {socialItems.length > 0 && (
              <div className="flex items-center gap-2">
                {socialItems.slice(0, 3).map(({ key, Icon, label, href }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 rounded-full
                               text-stone-600 hover:text-stone-900 hover:border-stone-300 hover:shadow-sm
                               transition-all duration-150 text-sm font-medium"
                  >
                    <Icon />
                    <span className="hidden lg:inline">{label}</span>
                  </a>
                ))}
              </div>
            )}

            <CartSheet />
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-stone-100">
        {shop.heroImage ? (
          <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-multiply" style={{ backgroundImage: `url(${shop.heroImage})` }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-[#FDFBF7] opacity-90 z-0" />
        )}
        <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg,#000 25%,transparent 25%,transparent 75%,#000 75%,#000),repeating-linear-gradient(45deg,#000 25%,transparent 25%,transparent 75%,#000 75%,#000)', backgroundPosition: '0 0,10px 10px', backgroundSize: '20px 20px' }} />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-32 flex flex-col items-center text-center">
          <Badge className="bg-amber-100/50 text-amber-900 border border-amber-200/50 mb-6 hover:bg-amber-100 px-4 py-1.5 text-[10px] tracking-widest uppercase font-semibold">
            Nueva Colección Disponible
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-stone-900 max-w-4xl leading-[1.1] mb-4 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Artesanía y dedicación en cada <span className="text-amber-800 italic">hilo</span>.
          </h1>
          <p className="text-stone-600 text-base sm:text-lg md:text-xl max-w-2xl font-light leading-relaxed mb-8 px-2 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
            Descubre nuestra selección exclusiva de tejidos hechos a mano. Piezas únicas, diseñadas para brindarte calidez, estilo y confort.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link href="#coleccion">
              <Button className="bg-amber-800 hover:bg-amber-900 text-[#FDFBF7] rounded-full px-8 h-12 md:h-14 text-sm md:text-base font-medium shadow-xl shadow-amber-900/20 transition-all hover:-translate-y-1 active:scale-95">
                Ver Catálogo
              </Button>
            </Link>
            {shop.whatsappNumber && (
              <Link href="#contacto">
                <Button variant="outline" className="rounded-full px-8 h-12 md:h-14 text-sm md:text-base border-stone-300 text-stone-700 hover:bg-stone-100 hover:-translate-y-1 active:scale-95 transition-all">
                  Contactanos
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Historia / Valores ──────────────────────────────────── */}
      <section id="historia" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10 lg:gap-16 max-w-5xl mx-auto text-center">
            {[
              { Icon: Heart, title: "Pasión Artesanal", desc: "Cada pieza es tejida a mano con amor, cuidando hasta el último detalle para asegurar la máxima calidad.", bg: "bg-amber-50", text: "text-amber-800" },
              { Icon: Sparkles, title: "Materiales Premium", desc: "Seleccionamos cuidadosamente fibras naturales y lanas suaves que respetan tu piel y el medio ambiente.", bg: "bg-stone-100", text: "text-stone-600" },
              { Icon: Scissors, title: "Diseño Único", desc: "No hay dos iguales. Al ser hechas a mano, cada prenda tiene su propia identidad y personalidad.", bg: "bg-amber-50", text: "text-amber-800" },
            ].map(({ Icon, title, desc, bg, text }) => (
              <div key={title} className="flex flex-col items-center space-y-4">
                <div className={`h-16 w-16 rounded-full ${bg} flex items-center justify-center ${text} mb-2`}>
                  <Icon className="h-8 w-8 stroke-[1.5]" />
                </div>
                <h3 className="font-serif font-semibold text-xl text-stone-900">{title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Catálogo ────────────────────────────────────────────── */}
      <main id="coleccion" className="container mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="flex flex-col items-center justify-center mb-10 md:mb-16 space-y-3 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-stone-900">Colección Exclusiva</h2>
          <div className="h-1 w-16 md:w-24 bg-amber-800/30 rounded-full mx-auto" />
          <p className="text-stone-500 max-w-xl text-sm md:text-base px-4">
            Explora nuestra variedad de productos. {shopProducts.length} artículos disponibles.
          </p>
        </div>

        {shopProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 px-4 text-center bg-stone-50 rounded-3xl border border-stone-200/60 shadow-inner mx-2 md:mx-0">
            <PackageSearch className="h-16 w-16 md:h-20 md:w-20 text-stone-300 mb-4 md:mb-6" />
            <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-700">Aún estamos tejiendo...</h3>
            <p className="text-stone-500 mt-2 max-w-sm md:max-w-md text-sm md:text-base">Pronto subiremos nuestros primeros productos. ¡Volvé en unos días!</p>
          </div>
        ) : (
          <ProductGrid products={shopProducts} shopId={shop.id} />
        )}
      </main>

      {/* ── Contacto ────────────────────────────────────────────── */}
      {(shop.whatsappNumber || social.email || socialItems.length > 0) && (
        <section id="contacto" className="py-20 bg-stone-50 border-t border-stone-100">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-3">Ponete en Contacto</h2>
              <div className="h-1 w-16 bg-amber-800/30 rounded-full mx-auto mb-4" />
              <p className="text-stone-500 text-sm md:text-base max-w-md mx-auto">
                ¿Tenés alguna consulta? Estamos para ayudarte.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {/* WhatsApp card */}
              {shop.whatsappNumber && (
                <a
                  href={`https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(shop.whatsappMessage || "Hola! Me gustaría más información.")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-stone-900 group-hover:bg-amber-900 rounded-full flex items-center justify-center text-white transition-colors">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-stone-800 text-sm">WhatsApp</p>
                    <p className="text-xs text-stone-400 mt-0.5">Consultá ahora</p>
                  </div>
                </a>
              )}

              {/* Email card */}
              {social.email && (
                <a href={`mailto:${social.email}`}
                  className="group flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-stone-100 group-hover:bg-amber-100 rounded-full flex items-center justify-center text-stone-700 group-hover:text-amber-800 transition-colors">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-stone-800 text-sm">Email</p>
                    <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[160px]">{social.email}</p>
                  </div>
                </a>
              )}

              {/* Instagram card (solo si existe) */}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-stone-100 group-hover:bg-amber-100 rounded-full flex items-center justify-center text-stone-700 group-hover:text-amber-800 transition-colors">
                    <InstagramIcon />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-stone-800 text-sm">Instagram</p>
                    <p className="text-xs text-stone-400 mt-0.5">Seguinos</p>
                  </div>
                </a>
              )}
            </div>

            {/* All social links row */}
            {socialItems.length > 1 && (
              <div className="flex flex-wrap justify-center gap-3">
                {socialItems.map(({ key, Icon, label, href }) => (
                  <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-full text-stone-600 hover:text-amber-800 hover:border-amber-300 hover:shadow-sm transition-all text-sm font-medium">
                    <Icon />
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Footer ──────────────────────────────────────────────── */}
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

          <div className="flex flex-col gap-5 items-center md:items-end">
            {/* Social links in footer */}
            {socialItems.length > 0 && (
              <div className="flex items-center gap-2">
                {socialItems.map(({ key, Icon, label, href }) => (
                  <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-9 h-9 flex items-center justify-center text-stone-500 hover:text-stone-200 hover:bg-stone-800 rounded-full transition-all">
                    <Icon />
                  </a>
                ))}
              </div>
            )}
            {/* Nav links */}
            <div className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2 text-sm font-medium">
              <Link href="#coleccion" className="hover:text-stone-200 transition-colors">Colección</Link>
              <Link href="#historia" className="hover:text-stone-200 transition-colors">Historia</Link>
              <Link href="#contacto" className="hover:text-stone-200 transition-colors">Contacto</Link>
              {social.email && (
                <a href={`mailto:${social.email}`} className="hover:text-stone-200 transition-colors">Email</a>
              )}
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              © {new Date().getFullYear()} {shop.name}. Todos los derechos reservados.<br />
              <span className="opacity-60">Impulsado por TiendaFácil.</span>
            </p>
          </div>
        </div>
      </footer>

      {/* ── WhatsApp flotante ────────────────────────────────────── */}
      {shop.whatsappNumber && (
        <WhatsAppButton number={shop.whatsappNumber} message={shop.whatsappMessage} />
      )}
    </div>
  );
}
