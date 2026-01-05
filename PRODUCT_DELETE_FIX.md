# 🔧 Product Delete Fix - Implementation Guide

## 📋 Problem Summary

**Error**: "Gagal menghapus produk" when trying to delete products in admin panel

**Root Causes**:
1. **Foreign Key Constraint Violation**: The `OrderItem` table has `ON DELETE RESTRICT` for `productId`
2. **Silent Error Handling**: Error details were not logged or displayed
3. **Possible RLS Issues**: Row Level Security policies might prevent deletion

---

## ✅ Changes Made

### 1. **Frontend Error Handling** ([page.js](src/app/admin/products/page.js#L50-L75))
- Added console logging for debugging
- Display actual error messages from backend
- Added success confirmation message
- Better network error handling

### 2. **API Error Logging** ([route.js](src/app/api/admin/products/[id]/route.js#L103-L141))
- Detailed console logging with emoji indicators
- Specific error messages for foreign key violations
- Development vs production error detail levels
- PostgreSQL error code detection (23503 = FK violation)

### 3. **Model Error Details** ([ProductModel.js](src/models/ProductModel.js#L126-L139))
- Log full Supabase error object (message, details, hint, code)
- Helps identify exact database constraint issues

---

## 🔧 Required Database Changes

### **IMPORTANT**: Run the SQL fix on Supabase

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/aaltkprawfanoajoevcp/editor)
2. Open the file: `SUPABASE_DELETE_FIX.sql`
3. Execute all queries (or select specific solutions)

### **Solutions Provided**:

#### ✅ **Solution 1: CASCADE for CartItems** (Auto-delete cart items)
```sql
ALTER TABLE "CartItem" 
  DROP CONSTRAINT IF EXISTS "CartItem_productId_fkey";

ALTER TABLE "CartItem"
  ADD CONSTRAINT "CartItem_productId_fkey" 
  FOREIGN KEY ("productId") 
  REFERENCES "Product"(id) 
  ON DELETE CASCADE;
```

#### ✅ **Solution 2: SET NULL for OrderItems** (Preserve order history)
```sql
-- Make productId nullable
ALTER TABLE "OrderItem" 
  ALTER COLUMN "productId" DROP NOT NULL;

-- Add product name for historical data
ALTER TABLE "OrderItem" 
  ADD COLUMN IF NOT EXISTS "productName" TEXT;

-- Change constraint to SET NULL
ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_productId_fkey" 
  FOREIGN KEY ("productId") 
  REFERENCES "Product"(id) 
  ON DELETE SET NULL;
```

#### ✅ **Solution 3: RLS Policies** (If permission issues exist)
```sql
-- Enable RLS
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;

-- Allow admin to delete
CREATE POLICY "product_delete_policy" 
  ON "Product" FOR DELETE 
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM "User" WHERE role = 'ADMIN'
    )
  );
```

---

## 🧪 Testing Steps

### 1. **Test the Error Display First** (Before SQL fix)
1. Deploy the code changes to Vercel
2. Try to delete "Bagas Ganteng" product
3. You should now see a detailed error message:
   - "Produk tidak dapat dihapus karena masih terdapat pesanan yang menggunakan produk ini"
4. Check browser console (F12) for detailed error logs

### 2. **Apply Database Fix**
1. Run `SUPABASE_DELETE_FIX.sql` in Supabase SQL Editor
2. Verify constraints:
   ```sql
   -- Check foreign keys are updated
   SELECT tc.table_name, rc.delete_rule
   FROM information_schema.table_constraints AS tc
   JOIN information_schema.referential_constraints AS rc
     ON rc.constraint_name = tc.constraint_name
   WHERE tc.table_name IN ('OrderItem', 'CartItem');
   ```

### 3. **Test Product Deletion**
1. Go to admin panel: https://motivcompany.vercel.app/admin/products
2. Try to delete "Bagas Ganteng" or any product
3. Should succeed with message: "✅ Produk berhasil dihapus!"
4. Check orders to ensure history is preserved (productName column)

### 4. **Edge Cases to Test**
- Delete product that's in someone's cart → Should auto-remove from cart
- Delete product that's in old orders → Should preserve order with product name
- Delete product with no references → Should delete normally
- Test RLS by logging in as different users

---

## 📊 Verification Queries

Run these in Supabase to verify the fix worked:

```sql
-- 1. Check which products are safe to delete
SELECT 
  p.id,
  p.name,
  COUNT(DISTINCT oi."orderId") as order_count,
  COUNT(DISTINCT ci.id) as cart_count
FROM "Product" p
LEFT JOIN "OrderItem" oi ON oi."productId" = p.id
LEFT JOIN "CartItem" ci ON ci."productId" = p.id
GROUP BY p.id, p.name;

-- 2. After deletion, verify order history is intact
SELECT 
  o."orderNumber",
  oi."productId",
  oi."productName", -- Should show name even if productId is NULL
  oi.quantity,
  oi.price
FROM "OrderItem" oi
JOIN "Order" o ON o.id = oi."orderId"
WHERE oi."productId" IS NULL -- Deleted products
LIMIT 10;
```

---

## 🚨 Important Notes

### **Data Preservation Strategy**:
- **CartItems**: Deleted automatically (CASCADE) - users won't notice
- **OrderItems**: Product reference set to NULL, but name/price preserved
- **Order History**: Remains intact with historical data

### **Why Not Full CASCADE?**:
- We DON'T want to delete entire orders when a product is removed
- Order history is important for business records and revenue tracking
- Solution: Keep order data, just nullify the product reference

### **Alternative: Soft Delete** (Future Enhancement):
Instead of hard deleting products, consider adding:
```sql
ALTER TABLE "Product" ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE "Product" ADD COLUMN "isDeleted" BOOLEAN DEFAULT false;
```

Then update queries to filter out deleted products:
```javascript
// In ProductModel.findAll()
.eq('isDeleted', false)
```

---

## 🔍 Debugging Guide

If deletion still fails after the fix:

### Check 1: Error Code
```javascript
// In browser console, look for:
console.error("Delete error details:", data);
// Should show: { success: false, message: "...", error: "..." }
```

### Check 2: Supabase Logs
1. Go to Supabase Dashboard → Logs → API
2. Filter by DELETE requests
3. Look for error codes:
   - `23503` = Foreign key violation
   - `42501` = Insufficient privilege (RLS issue)

### Check 3: RLS Status
```sql
-- Is RLS enabled but blocking you?
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'Product';

-- What policies exist?
SELECT * FROM pg_policies WHERE tablename = 'Product';
```

### Check 4: Auth Context
```javascript
// In API route, add:
console.log("User role:", session?.user?.role);
console.log("User email:", session?.user?.email);
```

---

## 📁 Files Modified

1. ✅ `src/app/admin/products/page.js` - Frontend error handling
2. ✅ `src/app/api/admin/products/[id]/route.js` - API error messages
3. ✅ `src/models/ProductModel.js` - Model error logging
4. ✅ `SUPABASE_DELETE_FIX.sql` - Database constraint fixes

---

## 🎯 Expected Outcome

**Before Fix**:
```
Alert: "Gagal menghapus produk"
Console: (no logs)
```

**After Fix**:
```
Alert: "✅ Produk berhasil dihapus!"
Console: 
  🔴 Supabase delete error: {
    message: "violates foreign key constraint...",
    code: "23503",
    details: "..."
  }
```

**After SQL Fix**:
```
Alert: "✅ Produk berhasil dihapus!"
Console: (no errors)
Database: 
  - Product deleted
  - CartItems deleted
  - OrderItems productId = NULL, productName preserved
```

---

## 📞 Support

If issues persist:
1. Check Vercel deployment logs
2. Check Supabase database logs
3. Verify admin credentials: `admin@motivcompany.com` / `MotivAdmin2024!`
4. Test with a fresh product that has no orders/carts

**Last Updated**: January 5, 2026  
**Status**: ✅ Code Fixed, 🔧 SQL Pending Application
