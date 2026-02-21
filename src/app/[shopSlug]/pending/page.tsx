import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default async function PendingPage({
    params,
    searchParams,
}: {
    params: Promise<{ shopSlug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const p = await params;
    const s = await searchParams;
    const orderId = s.orderId as string | undefined;

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full border-amber-100 shadow-sm animate-in fade-in zoom-in duration-500">
                <CardHeader className="text-center pt-8 pb-4">
                    <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <Clock className="h-8 w-8 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Pago Pendiente</h1>
                    <p className="text-muted-foreground mt-2">
                        Tu pago está siendo procesado por Mercado Pago.
                    </p>
                </CardHeader>
                <CardContent className="text-sm text-center space-y-4">
                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                        <p className="font-medium text-zinc-900 mb-1">
                            Orden #{orderId || "Desconocida"}
                        </p>
                        <p className="text-zinc-500">
                            Te avisaremos por correo cuando tu compra haya sido confirmada.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pb-8">
                    <Link href={`/${p.shopSlug}`} className="w-full">
                        <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm" size="lg">
                            Volver a la tienda
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
