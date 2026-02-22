import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';

// Shops (The Tenants)
export const shops = pgTable("shops", {
    id: serial("id").primaryKey(),
    ownerId: text("owner_id").notNull(), // Clerk User ID (string)
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(), // The subdomain or path, e.g., 'tejidospro'
    plan: text("plan").default("free"), // free, pro, enterprise
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shopRelations = relations(shops, ({ one, many }) => ({
    settings: one(shopSettings),
    products: many(products),
    categories: many(categories),
    orders: many(orders),
}));

// Categories
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: 'cascade' }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
});

export const categoryRelations = relations(categories, ({ one, many }) => ({
    shop: one(shops, {
        fields: [categories.shopId],
        references: [shops.id],
    }),
    products: many(products),
}));

// Products
export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: 'cascade' }),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: 'set null' }),
    name: text("name").notNull(),
    description: text("description"),
    price: integer("price").notNull(),
    stock: integer("stock").default(0),
    imageUrl: text("image_url"),
    images: jsonb("images").$type<string[]>().default([]),
    variants: jsonb("variants").$type<{ name: string; options: string[] }[]>().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productRelations = relations(products, ({ one, many }) => ({
    shop: one(shops, {
        fields: [products.shopId],
        references: [shops.id],
    }),
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    orderItems: many(orderItems),
}));

// Orders
export const orders = pgTable("orders", {
    id: serial("id").primaryKey(),
    shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: 'cascade' }),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone"),
    shippingAddress: jsonb("shipping_address"), // { country, province, city, street, postal_code }
    trackingCode: text("tracking_code"),
    totalAmount: integer("total_amount").notNull(),
    status: text("status").default("pending"), // pending, paid, processing, shipped, delivered, cancelled
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderRelations = relations(orders, ({ one, many }) => ({
    shop: one(shops, {
        fields: [orders.shopId],
        references: [shops.id],
    }),
    items: many(orderItems),
}));

// Order Items
export const orderItems = pgTable("order_items", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
    productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer("quantity").notNull(),
    priceAtTime: integer("price_at_time").notNull(), // Price at the time of purchase
});

export const orderItemRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [orderItems.productId],
        references: [products.id],
    }),
}));

// Shop Settings
export const shopSettings = pgTable("shop_settings", {
    id: serial("id").primaryKey(),
    shopId: integer("shop_id").unique().notNull().references(() => shops.id, { onDelete: 'cascade' }),
    mpAccessToken: text("mp_access_token"),
    mpPublicKey: text("mp_public_key"),
    isActive: boolean("is_active").default(true),
    heroImage: text("hero_image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shopSettingsRelations = relations(shopSettings, ({ one }) => ({
    shop: one(shops, {
        fields: [shopSettings.shopId],
        references: [shops.id],
    }),
}));

