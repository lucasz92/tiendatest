"use server"

import { db } from "@/db";
import { products } from "@/db/schema";
import { revalidatePath } from "next/cache";

import { getCurrentShop } from "@/lib/auth";

export async function createProduct(formData: FormData) {
    const shop = await getCurrentShop();
    if (!shop) {
        throw new Error("No estás autenticado o no se pudo cargar tu tienda.");
    }
    const shopId = shop.id;

    // Extract and validate data
    const name = formData.get("name") as string;
    const price = parseInt(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string) || 0;

    if (!name || isNaN(price)) {
        throw new Error("Faltan campos obligatorios");
    }

    // Insert into DB
    try {
        const newProduct = await db.insert(products).values({
            shopId,
            name,
            price,
            stock,
        }).returning();

        // Refresh the route to show changes in UI
        revalidatePath("/");

        return { success: true, product: newProduct[0] };
    } catch (error) {
        console.error("Error al crear producto:", error);
        return { success: false, error: "Hubo un error al crear el producto." };
    }
}
