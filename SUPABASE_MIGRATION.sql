-- ========================================
-- SUPABASE DATABASE MIGRATION
-- Complete SQL Schema for Motiv E-commerce
-- ========================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- https://supabase.com/dashboard/project/aaltkprawfanoajoevcp/editor

-- Drop existing tables if any (optional, be careful!)
-- DROP TABLE IF EXISTS "OrderItem" CASCADE;
-- DROP TABLE IF EXISTS "Order" CASCADE;
-- DROP TABLE IF EXISTS "Transaction" CASCADE;
-- DROP TABLE IF EXISTS "CartItem" CASCADE;
-- DROP TABLE IF EXISTS "ShippingAddress" CASCADE;
-- DROP TABLE IF EXISTS "ProductVariant" CASCADE;
-- DROP TABLE IF EXISTS "Product" CASCADE;
-- DROP TABLE IF EXISTS "B2BRequest" CASCADE;
-- DROP TABLE IF EXISTS "Story" CASCADE;
-- DROP TABLE IF EXISTS "Voucher" CASCADE;
-- DROP TABLE IF EXISTS "User" CASCADE;

-- ========================================
-- 1. USER TABLE
-- ========================================
CREATE TABLE "User" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'B2C',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    "businessName" TEXT,
    phone TEXT,
    address TEXT,
    discount DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX "User_email_idx" ON "User"(email);
CREATE INDEX "User_role_idx" ON "User"(role);

-- ========================================
-- 2. PRODUCT TABLE
-- ========================================
CREATE TABLE "Product" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    category TEXT NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for category and search
CREATE INDEX "Product_category_idx" ON "Product"(category);
CREATE INDEX "Product_name_idx" ON "Product"(name);

-- ========================================
-- 3. PRODUCT VARIANT TABLE
-- ========================================
CREATE TABLE "ProductVariant" (
    id TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL,
    size TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    stock INTEGER NOT NULL,
    sku TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "ProductVariant_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Index for product lookup
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- ========================================
-- 4. CART ITEM TABLE
-- ========================================
CREATE TABLE "CartItem" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "CartItem_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_variantId_fkey" 
        FOREIGN KEY ("variantId") REFERENCES "ProductVariant"(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Composite unique constraint
CREATE UNIQUE INDEX "CartItem_userId_variantId_key" ON "CartItem"("userId", "variantId");
CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");

-- ========================================
-- 5. SHIPPING ADDRESS TABLE
-- ========================================
CREATE TABLE "ShippingAddress" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Indonesia',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "ShippingAddress_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Index for user lookup
CREATE INDEX "ShippingAddress_userId_idx" ON "ShippingAddress"("userId");

-- ========================================
-- 6. ORDER TABLE
-- ========================================
CREATE TABLE "Order" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderNumber" TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "shippingMethod" TEXT,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingAddress" JSONB NOT NULL,
    subtotal DOUBLE PRECISION NOT NULL,
    discount DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voucherCode" TEXT,
    total DOUBLE PRECISION NOT NULL,
    notes TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    
    CONSTRAINT "Order_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Indexes for orders
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_status_idx" ON "Order"(status);
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- ========================================
-- 7. ORDER ITEM TABLE
-- ========================================
CREATE TABLE "OrderItem" (
    id TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    "productSnapshot" JSONB NOT NULL,
    
    CONSTRAINT "OrderItem_orderId_fkey" 
        FOREIGN KEY ("orderId") REFERENCES "Order"(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_variantId_fkey" 
        FOREIGN KEY ("variantId") REFERENCES "ProductVariant"(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Index for order lookup
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- ========================================
-- 8. TRANSACTION TABLE (Midtrans)
-- ========================================
CREATE TABLE "Transaction" (
    id TEXT PRIMARY KEY,
    "orderId" TEXT UNIQUE NOT NULL,
    "transactionId" TEXT UNIQUE NOT NULL,
    "paymentType" TEXT,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "fraudStatus" TEXT,
    "transactionTime" TIMESTAMP(3),
    "settlementTime" TIMESTAMP(3),
    metadata JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "Transaction_orderId_fkey" 
        FOREIGN KEY ("orderId") REFERENCES "Order"(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for transactions
CREATE UNIQUE INDEX "Transaction_orderId_key" ON "Transaction"("orderId");
CREATE UNIQUE INDEX "Transaction_transactionId_key" ON "Transaction"("transactionId");

-- ========================================
-- 9. B2B REQUEST TABLE
-- ========================================
CREATE TABLE "B2BRequest" (
    id TEXT PRIMARY KEY,
    "userId" TEXT UNIQUE NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessAddress" TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    "taxId" TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    
    CONSTRAINT "B2BRequest_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Index for user lookup
CREATE UNIQUE INDEX "B2BRequest_userId_key" ON "B2BRequest"("userId");
CREATE INDEX "B2BRequest_status_idx" ON "B2BRequest"(status);

-- ========================================
-- 10. VOUCHER TABLE
-- ========================================
CREATE TABLE "Voucher" (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    "minPurchase" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDiscount" DOUBLE PRECISION,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for vouchers
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"(code);
CREATE INDEX "Voucher_isActive_idx" ON "Voucher"("isActive");

-- ========================================
-- 11. STORY TABLE (Blog/Content)
-- ========================================
CREATE TABLE "Story" (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    "featuredImage" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for published stories
CREATE INDEX "Story_isPublished_idx" ON "Story"("isPublished");
CREATE INDEX "Story_publishedAt_idx" ON "Story"("publishedAt");

-- ========================================
-- SEED DATA: Insert Admin User
-- ========================================
-- Password: admin123 (hashed with bcrypt)
INSERT INTO "User" (id, name, email, password, role, status, "createdAt", "updatedAt")
VALUES (
    'admin-001',
    'Admin',
    'admin@motiv.com',
    '$2a$10$rGwEHmVHw8K.3qX5y/4cE.6h3nLJOxRKZQa3ZU8qYF.yF/vxPQi7O',
    'ADMIN',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- ========================================
-- SEED DATA: Insert Sample B2C User
-- ========================================
-- Password: user123
INSERT INTO "User" (id, name, email, password, role, status, "createdAt", "updatedAt")
VALUES (
    'user-001',
    'Test User',
    'user@test.com',
    '$2a$10$YourHashedPasswordHere',
    'B2C',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- ========================================
-- SEED DATA: Insert Sample B2B User
-- ========================================
-- Password: b2b123
INSERT INTO "User" (id, name, email, password, role, status, "businessName", discount, "createdAt", "updatedAt")
VALUES (
    'b2b-001',
    'B2B Customer',
    'b2b@test.com',
    '$2a$10$YourHashedPasswordHere',
    'B2B',
    'ACTIVE',
    'PT Test Business',
    15,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- ========================================
-- SEED DATA: Sample Product
-- ========================================
INSERT INTO "Product" (id, name, description, images, category, features, "createdAt", "updatedAt")
VALUES (
    'prod-001',
    'Premium Coffee Beans',
    'High quality arabica coffee beans from Indonesian highlands',
    ARRAY['/images/coffee-1.jpg', '/images/coffee-2.jpg'],
    'Coffee Beans',
    ARRAY['100% Arabica', 'Medium Roast', 'Single Origin', 'Fair Trade'],
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Sample Product Variant
INSERT INTO "ProductVariant" (id, "productId", size, price, stock, sku, "createdAt", "updatedAt")
VALUES 
    ('var-001', 'prod-001', '250g', 75000, 100, 'COFFEE-250G', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('var-002', 'prod-001', '500g', 140000, 50, 'COFFEE-500G', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('var-003', 'prod-001', '1kg', 260000, 30, 'COFFEE-1KG', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- SEED DATA: Sample Voucher
-- ========================================
INSERT INTO "Voucher" (id, code, description, type, value, "minPurchase", "maxDiscount", "usageLimit", "startDate", "endDate", "isActive", "createdAt", "updatedAt")
VALUES (
    'vouch-001',
    'WELCOME10',
    'Welcome discount 10% for new customers',
    'PERCENTAGE',
    10,
    100000,
    50000,
    100,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (code) DO NOTHING;

-- ========================================
-- SEED DATA: Sample Story
-- ========================================
INSERT INTO "Story" (id, title, content, excerpt, "featuredImage", "isPublished", "publishedAt", "createdAt", "updatedAt")
VALUES (
    'story-001',
    'Welcome to Motiv Coffee',
    'Discover the journey of our premium coffee beans from farm to cup. We source only the finest arabica beans from Indonesian highlands...',
    'Discover the journey of our premium coffee beans from farm to cup.',
    '/images/story-1.jpg',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify data:

-- Check all tables
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count records in each table
SELECT 'User' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Product', COUNT(*) FROM "Product"
UNION ALL
SELECT 'ProductVariant', COUNT(*) FROM "ProductVariant"
UNION ALL
SELECT 'CartItem', COUNT(*) FROM "CartItem"
UNION ALL
SELECT 'Order', COUNT(*) FROM "Order"
UNION ALL
SELECT 'OrderItem', COUNT(*) FROM "OrderItem"
UNION ALL
SELECT 'Transaction', COUNT(*) FROM "Transaction"
UNION ALL
SELECT 'ShippingAddress', COUNT(*) FROM "ShippingAddress"
UNION ALL
SELECT 'B2BRequest', COUNT(*) FROM "B2BRequest"
UNION ALL
SELECT 'Voucher', COUNT(*) FROM "Voucher"
UNION ALL
SELECT 'Story', COUNT(*) FROM "Story";

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
-- If all queries run successfully, your database is ready!
-- 
-- Default Login Credentials:
-- ---------------------------
-- Admin: admin@motiv.com / admin123
-- B2C User: user@test.com / user123
-- B2B User: b2b@test.com / b2b123
-- 
-- Next Steps:
-- 1. Go to https://motivcompany.vercel.app/login
-- 2. Login with admin credentials
-- 3. Add more products via admin panel
-- 4. Test complete order flow
-- 
-- ========================================
