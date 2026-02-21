import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string | null;
    shopId: number;
}

interface CartState {
    items: CartItem[];
    shopId: number | null; // Cart binds to a single shop instance
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            shopId: null,

            addItem: (product) => {
                const { items, shopId } = get();

                // If cart belongs to another shop, clear it first
                let currentItems = items;
                if (shopId !== null && shopId !== product.shopId) {
                    currentItems = [];
                }

                const existingItemIndex = currentItems.findIndex((i) => i.id === product.id);

                if (existingItemIndex > -1) {
                    // Increase quantity
                    const updatedItems = [...currentItems];
                    updatedItems[existingItemIndex].quantity += 1;
                    set({ items: updatedItems, shopId: product.shopId });
                } else {
                    // Add new product
                    set({
                        items: [...currentItems, { ...product, quantity: 1 }],
                        shopId: product.shopId,
                    });
                }
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                }));
            },

            updateQuantity: (id, quantity) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
                    ),
                }));
            },

            clearCart: () => set({ items: [], shopId: null }),

            getCartTotal: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },
        }),
        {
            name: 'tienda-cart-storage', // Key localStorage name
        }
    )
);
