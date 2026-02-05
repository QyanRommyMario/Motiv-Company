-- ========================================
-- DEBUG PAYMENT & STOCK ISSUE
-- Order: ORD-1770266710052-TOA7PG
-- ========================================

-- 1. CHECK ORDER STATUS
SELECT 
  o."id" as order_id,
  o."orderNumber",
  o."status" as order_status,
  o."paymentStatus",
  o."total",
  o."createdAt",
  o."updatedAt"
FROM "Order" o
WHERE o."orderNumber" = 'ORD-1770266710052-TOA7PG';

-- 2. CHECK TRANSACTION DATA
SELECT 
  t."id" as transaction_id,
  t."transactionId",
  t."orderId",
  t."snapToken",
  t."transactionStatus",
  t."fraudStatus",
  t."paymentType",
  t."vaNumber",
  t."bank",
  t."settlementTime",
  t."createdAt",
  t."updatedAt"
FROM "Transaction" t
WHERE t."transactionId" = 'ORD-1770266710052-TOA7PG';

-- 3. CHECK ORDER ITEMS & VARIANT STOCK
SELECT 
  oi."id" as order_item_id,
  oi."quantity" as ordered_qty,
  oi."price",
  pv."id" as variant_id,
  pv."name" as variant_name,
  pv."stock" as current_stock,
  pv."updatedAt" as stock_last_updated,
  p."name" as product_name
FROM "OrderItem" oi
JOIN "ProductVariant" pv ON pv."id" = oi."variantId"
JOIN "Product" p ON p."id" = pv."productId"
WHERE oi."orderId" = (
  SELECT "id" FROM "Order" WHERE "orderNumber" = 'ORD-1770266710052-TOA7PG'
);

-- 4. CHECK RECENT WEBHOOK ACTIVITY (Last 1 hour)
-- Look for any orders with recent status changes
SELECT 
  o."orderNumber",
  o."status",
  o."paymentStatus",
  o."updatedAt",
  t."transactionStatus",
  t."fraudStatus"
FROM "Order" o
LEFT JOIN "Transaction" t ON t."orderId" = o."id"
WHERE o."createdAt" > NOW() - INTERVAL '1 hour'
ORDER BY o."createdAt" DESC;

-- 5. CHECK IF ATOMIC_DECREMENT_STOCK FUNCTION EXISTS
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'atomic_decrement_stock';
