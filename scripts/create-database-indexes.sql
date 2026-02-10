-- ============================================
-- DATABASE INDEXES FOR PERFORMANCE OPTIMIZATION
-- Meningkatkan performa query dengan menambahkan index
-- pada kolom yang sering digunakan dalam query
-- ============================================

-- ============================================
-- USER TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON "User"("createdAt");

-- ============================================
-- CART ITEM INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON "CartItem"("userId");
CREATE INDEX IF NOT EXISTS idx_cart_variant_id ON "CartItem"("variantId");
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON "CartItem"("productId");
CREATE INDEX IF NOT EXISTS idx_cart_user_variant ON "CartItem"("userId", "variantId");

-- ============================================
-- PRODUCT INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_product_category_id ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS idx_product_is_active ON "Product"("isActive");
CREATE INDEX IF NOT EXISTS idx_product_created_at ON "Product"("createdAt");
CREATE INDEX IF NOT EXISTS idx_product_category_active ON "Product"("categoryId", "isActive");

-- ============================================
-- PRODUCT VARIANT INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_variant_product_id ON "ProductVariant"("productId");
CREATE INDEX IF NOT EXISTS idx_variant_stock ON "ProductVariant"(stock);
CREATE INDEX IF NOT EXISTS idx_variant_product_stock ON "ProductVariant"("productId", stock);

-- ============================================
-- ORDER INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_order_user_id ON "Order"("userId");
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order"(status);
CREATE INDEX IF NOT EXISTS idx_order_payment_status ON "Order"("paymentStatus");
CREATE INDEX IF NOT EXISTS idx_order_created_at ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS idx_order_user_status ON "Order"("userId", status);
CREATE INDEX IF NOT EXISTS idx_order_user_created ON "Order"("userId", "createdAt");

-- ============================================
-- ORDER ITEM INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_order_item_order_id ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS idx_order_item_product_id ON "OrderItem"("productId");
CREATE INDEX IF NOT EXISTS idx_order_item_variant_id ON "OrderItem"("variantId");

-- ============================================
-- TRANSACTION INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transaction_order_id ON "Transaction"("orderId");
CREATE INDEX IF NOT EXISTS idx_transaction_status ON "Transaction"(status);
CREATE INDEX IF NOT EXISTS idx_transaction_created_at ON "Transaction"("createdAt");

-- ============================================
-- SHIPPING ADDRESS INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_shipping_user_id ON "ShippingAddress"("userId");
CREATE INDEX IF NOT EXISTS idx_shipping_is_default ON "ShippingAddress"("isDefault");
CREATE INDEX IF NOT EXISTS idx_shipping_user_default ON "ShippingAddress"("userId", "isDefault");

-- ============================================
-- VOUCHER INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_voucher_code ON "Voucher"(code);
CREATE INDEX IF NOT EXISTS idx_voucher_is_active ON "Voucher"("isActive");
CREATE INDEX IF NOT EXISTS idx_voucher_valid_from ON "Voucher"("validFrom");
CREATE INDEX IF NOT EXISTS idx_voucher_valid_until ON "Voucher"("validUntil");

-- ============================================
-- STORY INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_story_is_published ON "Story"("isPublished");
CREATE INDEX IF NOT EXISTS idx_story_published_at ON "Story"("publishedAt");
CREATE INDEX IF NOT EXISTS idx_story_created_at ON "Story"("createdAt");

-- ============================================
-- B2B REQUEST INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_b2b_user_id ON "B2BRequest"("userId");
CREATE INDEX IF NOT EXISTS idx_b2b_status ON "B2BRequest"(status);
CREATE INDEX IF NOT EXISTS idx_b2b_created_at ON "B2BRequest"("createdAt");

-- ============================================
-- CATEGORY INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_category_name ON "Category"(name);
CREATE INDEX IF NOT EXISTS idx_category_is_active ON "Category"("isActive");

-- ============================================
-- VERIFICATION - List all indexes
-- ============================================
-- SELECT 
--     tablename, 
--     indexname, 
--     indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;

-- ============================================
-- PERFORMANCE NOTES:
-- ============================================
-- ✅ Index pada foreign keys untuk JOIN cepat
-- ✅ Index pada kolom filter (status, isActive, role)
-- ✅ Index pada kolom sorting (createdAt, publishedAt)
-- ✅ Composite index untuk query kombinasi
-- ✅ Menggunakan IF NOT EXISTS untuk safety
-- ============================================
