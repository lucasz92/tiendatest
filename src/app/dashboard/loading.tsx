import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 h-full min-h-[60vh] opacity-50 duration-500 animate-in fade-in">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <p className="mt-4 text-sm font-medium text-gray-500">Cargando datos...</p>
        </div>
    );
}
