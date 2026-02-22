import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string | null;
    shopId: number;
    selectedVariants?: Record<string, string>;
    cartItemId: string; // Unique combination of id + variants
}

export interface CouponState {
    code: string;
    discountAmount: number;
}

interface CartState {
    items: CartItem[];
    shopId: number | null; // Cart binds to a single shop instance
    addItem: (item: Omit<CartItem, 'quantity' | 'cartItemId'>) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;

    // Coupon state
    coupon: CouponState | null;
    applyCoupon: (coupon: CouponState) => void;
    removeCoupon: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            shopId: null,
            coupon: null,

            addItem: (product) => {
                const { items, shopId } = get();

                // If cart belongs to another shop, clear it first
                let currentItems = items;
                if (shopId !== null && shopId !== product.shopId) {
                    currentItems = [];
                }

                // Generate a unique cartItemId for the product + variants combination
                const variantString = product.selectedVariants
                    ? Object.entries(product.selectedVariants).sort().toString()
                    : "";
                const cartItemId = `${product.id}-${variantString}`;

                const existingItemIndex = currentItems.findIndex((i) => i.cartItemId === cartItemId);

                if (existingItemIndex > -1) {
                    // Increase quantity
                    const updatedItems = [...currentItems];
                    updatedItems[existingItemIndex].quantity += 1;
                    set({ items: updatedItems, shopId: product.shopId });
                } else {
                    // Add new product
                    set({
                        items: [...currentItems, { ...product, quantity: 1, cartItemId }],
                        shopId: product.shopId,
                    });
                }
            },

            removeItem: (cartItemId) => {
                set((state) => ({
                    items: state.items.filter((i) => i.cartItemId !== cartItemId),
                }));
            },

            updateQuantity: (cartItemId, quantity) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.cartItemId === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
                    ),
                }));
            },

            clearCart: () => set({ items: [], shopId: null, coupon: null }),

            getCartTotal: () => {
                const subtotal = get().items.reduce((total, item) => total + item.price * item.quantity, 0);
                const coupon = get().coupon;
                if (coupon) {
                    return Math.max(0, subtotal - coupon.discountAmount);
                }
                return subtotal;
            },

            applyCoupon: (coupon) => set({ coupon }),
            removeCoupon: () => set({ coupon: null }),
        }),
        {
            name: 'tienda-cart-storage', // Key localStorage name
        }
    )
);
