"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function AdminShopActions({ shopId, isActive, shopSlug }: { shopId: number, isActive: boolean, shopSlug: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const toggleStatus = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/shop/${shopId}/toggle`, {
                method: "POST",
            });
            if (!res.ok) throw new Error("Error al cambiar estado");

            toast.success(`Tienda ${isActive ? "suspendida" : "activada"} correctamente`);
            router.refresh();
        } catch (error) {
            toast.error("Ocurrió un error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Badge variant={isActive ? "default" : "destructive"}>
                {isActive ? "Activa" : "Suspendida"}
            </Badge>
            <Button
                variant={isActive ? "destructive" : "default"}
                size="sm"
                onClick={toggleStatus}
                disabled={loading}
                className="h-8"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    isActive ? <PowerOff className="h-4 w-4 mr-1" /> : <Power className="h-4 w-4 mr-1" />
                )}
                {isActive ? "Suspender" : "Activar"}
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => window.open(`/${shopSlug}`, "_blank")}
            >
                Visitar
            </Button>
        </div>
    );
}
