import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Store,
    BarChart,
    CreditCard,
    Smartphone,
    CheckCircle2,
    Rocket,
    ArrowRight,
    TrendingUp,
} from "lucide-react";

const features = [
    {
        icon: Store,
        title: "Tu e-commerce en minutos",
        description: "Creá tu cuenta y tenés tu tienda online funcionando al instante con tu propio link, lista para vender.",
    },
    {
        icon: CreditCard,
        title: "Cobrá fácil y seguro",
        description: "Integrado nativamente con Mercado Pago y otras pasarelas para que recibas el dinero directo en tu cuenta.",
    },
    {
        icon: BarChart,
        title: "Gestión de stock inteligente",
        description: "Controlá tu inventario desde un panel fácil de usar. Recibí alertas cuando tus productos estén por agotarse.",
    },
    {
        icon: Smartphone,
        title: "Diseño 100% móvil",
        description: "Tu tienda se verá increíble en cualquier celular. Fundamental hoy en día donde el 80% de las ventas suceden ahí.",
    },
    {
        icon: TrendingUp,
        title: "Reportes claros",
        description: "Entendé cuáles son tus productos estrella y analizá tus métricas de ventas sin tener que ser un experto.",
    },
    {
        icon: Rocket,
        title: "Escalabilidad asegurada",
        description: "Nuestra infraestructura soporta desde 10 ventas al mes hasta picos masivos de tráfico en fechas especiales.",
    },
];

const plans = [
    {
        name: "Emprendedor",
        price: "Gratis",
        description: "Empezá sin inversión inicial.",
        features: [
            "Catálogo de hasta 50 productos",
            "Link personalizado (tumarca.tiendafacil.com)",
            "Pagos habilitados",
            "Soporte básico",
        ],
        cta: "Comenzar gratis",
        highlight: false,
    },
    {
        name: "Crecimiento",
        price: "$14.999",
        period: "/mes",
        description: "Ganá profesionalismo.",
        features: [
            "Productos ilimitados",
            "Dominio propio (www.tumarca.com)",
            "Sin comisiones por venta adicionales",
            "Soporte prioritario",
        ],
        cta: "Prueba gratis por 14 días",
        highlight: true,
    },
];

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                            TF
                        </div>
                        <span className="text-xl font-bold tracking-tight">TiendaFácil</span>
                    </Link>
                    <nav className="hidden md:flex gap-6 text-sm font-medium">
                        <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Características</Link>
                        <Link href="/demo/tejidos" className="text-muted-foreground hover:text-foreground transition-colors">Ver Demo</Link>
                        <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Planes</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <SignedOut>
                            <Link href="/sign-in" className="text-sm font-medium hover:underline hidden sm:block">
                                Iniciar Sesión
                            </Link>
                            <Link href="/sign-up">
                                <Button>Crear mi tienda</Button>
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <Link href="/dashboard/inventory">
                                <Button variant="outline">Ir a mi Panel</Button>
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20">
                            🚀 La plataforma preferida por miles de emprendedores
                        </Badge>
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                            Tu negocio en línea, <span className="text-primary">fácil</span> y rápido.
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                            Creá tu tienda online profesional en minutos. Cargá tus productos, conectá tus métodos de pago y empezá a vender hoy mismo. Sin conocimientos técnicos.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <SignedOut>
                                <Link href="/sign-up" className="w-full sm:w-auto">
                                    <Button size="lg" className="h-14 px-8 text-base w-full">
                                        Empezar gratis ahora
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/shop/tejidos">
                                    <Button variant="outline" size="lg" className="h-14 px-8 text-base w-full sm:w-auto">
                                        Ver tienda de ejemplo
                                    </Button>
                                </Link>
                            </SignedOut>
                            <SignedIn>
                                <Link href="/dashboard/inventory" className="w-full sm:w-auto">
                                    <Button size="lg" className="h-14 px-8 text-base w-full">
                                        Ir a mi Panel
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/shop/tejidos">
                                    <Button variant="outline" size="lg" className="h-14 px-8 text-base w-full sm:w-auto">
                                        Ver mi tienda
                                    </Button>
                                </Link>
                            </SignedIn>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            No requiere tarjeta de crédito para empezar
                        </p>
                    </div>

                    <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none">
                        {/* Background decorative blob */}
                        <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-blue-400/20 rounded-[3rem] blur-2xl -z-10" />
                        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 aspect-[4/3] bg-muted">
                            <Image
                                src="/generic_hero.png"
                                alt="Panel de control e-commerce SaaS genérico"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-muted/50 border-y">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Todo lo que necesitás para potenciar tus ventas
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Dejá de manejar tu inventario en Excel y tus pedidos por WhatsApp. TiendaFácil automatiza el proceso para que te enfoques en crecer.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <Card key={idx} className="border-none shadow-md hover:shadow-lg transition-shadow bg-background">
                                <CardHeader>
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle>{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Planes que crecen con vos
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Precios simples, diseñados para emprendedores de todos los tamaños.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
                        {plans.map((plan) => (
                            <Card
                                key={plan.name}
                                className={`relative flex flex-col h-full ${plan.highlight ? 'border-primary shadow-xl scale-105 z-10' : 'border-border shadow-sm'}`}
                            >
                                {plan.highlight && (
                                    <div className="absolute px-4 py-1 text-xs font-semibold top-0 right-8 -translate-y-1/2 bg-primary text-primary-foreground rounded-full">
                                        El más elegido
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-xl text-muted-foreground">{plan.name}</CardTitle>
                                    <div className="flex items-baseline gap-1 mt-4">
                                        <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                                        {plan.period && <span className="text-muted-foreground font-medium">{plan.period}</span>}
                                    </div>
                                    <p className="text-sm mt-2 text-muted-foreground">{plan.description}</p>
                                </CardHeader>
                                <CardContent className="flex flex-col flex-1">
                                    <ul className="space-y-4 flex-1 mt-4">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-8">
                                        <Link href="/sign-up" className="w-full">
                                            <Button variant={plan.highlight ? "default" : "outline"} className="w-full h-12 text-base">
                                                {plan.cta}
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-muted/30">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-foreground text-background flex items-center justify-center font-bold text-xs">
                            TF
                        </div>
                        <span className="font-semibold text-lg">TiendaFácil.</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © 2026 TiendaFácil SaaS. Diseñado para apoyar al pequeño comercio.
                    </p>
                    <div className="flex gap-6 text-sm font-medium">
                        <Link href="#" className="hover:text-primary transition-colors">Términos</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Privacidad</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
