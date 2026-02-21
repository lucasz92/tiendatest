import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default async function SuccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ shopSlug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const p = await params;
    const s = await searchParams;

    // MP envía payment_id, collection_id, status, etc. en la redirección
    const paymentId = s.payment_id || s.collection_id;

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full border-green-100 shadow-sm animate-in fade-in zoom-in duration-500">
                <CardHeader className="text-center pt-8 pb-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">¡Pago Aprobado!</h1>
                    <p className="text-muted-foreground mt-2">
                        Tu compra se ha procesado correctamente.
                    </p>
                </CardHeader>
                <CardContent className="text-sm text-center space-y-4">
                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                        {paymentId && (
                            <p className="font-mono text-xs text-zinc-400 mb-2">Pago #{paymentId}</p>
                        )}
                        <p className="text-zinc-500">
                            En breve recibirás un email con los detalles de tu pedido.
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
