import Link from "next/link";
import { XCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default async function FailurePage({
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
            <Card className="max-w-md w-full border-red-100 shadow-sm animate-in fade-in zoom-in duration-500">
                <CardHeader className="text-center pt-8 pb-4">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Pago Rechazado</h1>
                    <p className="text-muted-foreground mt-2">
                        Hubo un problema al procesar tu pago.
                    </p>
                </CardHeader>
                <CardContent className="text-sm text-center space-y-4">
                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                        <p className="font-medium text-zinc-900 mb-1">
                            Orden #{orderId || "Desconocida"}
                        </p>
                        <p className="text-zinc-500">
                            Tu compra no pudo ser concretada. Intenta nuevamente con otro medio de pago.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pb-8">
                    <Link href={`/${p.shopSlug}/checkout`} className="w-full">
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-sm" size="lg">
                            <RefreshCcw className="mr-2 h-4 w-4" /> Intentar de nuevo
                        </Button>
                    </Link>
                    <Link href={`/${p.shopSlug}`} className="w-full">
                        <Button variant="outline" className="w-full text-zinc-600" size="lg">
                            Volver a la tienda
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
