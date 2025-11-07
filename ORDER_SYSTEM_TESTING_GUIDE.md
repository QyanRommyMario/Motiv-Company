# Order System Testing Guide 🧪

## Testing untuk Fixes yang Sudah Diimplementasikan

Server sudah running di: `http://localhost:3000`

---

## 🎯 TEST 1: Stock Validation

### Scenario 1.1: Order dengan Stock Cukup ✅

**Expected**: Order berhasil dibuat

1. Login sebagai B2C user
2. Add produk ke cart (pilih variant dengan stock > 0)
3. Checkout dan buat order
4. **Result**: Order berhasil, stock berkurang

### Scenario 1.2: Order dengan Stock Tidak Cukup ❌

**Expected**: Error "Stok tidak mencukupi"

**Setup Manual (via Prisma Studio)**:

1. Buka Prisma Studio: `npx prisma studio`
2. Edit ProductVariant → Set stock = 1
3. Di aplikasi: Try order quantity = 2
4. **Expected Result**: Error message "Stok tidak mencukupi untuk [variant name]. Tersedia: 1, Diminta: 2"

### Scenario 1.3: Concurrent Orders

**Expected**: Stock tetap konsisten, salah satu order gagal

**Manual Test**:

1. Buka 2 browser berbeda (atau incognito + normal)
2. Login di kedua browser dengan user berbeda
3. Set stock produk = 5 (via Prisma Studio)
4. User 1: Add to cart quantity = 3
5. User 2: Add to cart quantity = 3
6. User 1: Click "Bayar" (tahan sebentar)
7. User 2: Click "Bayar" secepat mungkin
8. **Expected**:
   - Order pertama berhasil (stock jadi 2)
   - Order kedua gagal "Stok tidak mencukupi. Tersedia: 2, Diminta: 3"

### Scenario 1.4: Stock Return on Cancel

**Expected**: Stock kembali saat order dibatalkan

1. Buat order dengan quantity = 2 (stock sebelumnya = 10)
2. Cek stock di Prisma Studio (seharusnya 8)
3. Login sebagai Admin
4. Buka order detail
5. Update status → CANCELLED
6. Cek stock lagi (seharusnya kembali 10)

---

## 🎯 TEST 2: Status Transition Validation

### Scenario 2.1: Valid Transitions ✅

**PENDING → PROCESSING**:

1. Login sebagai Admin
2. Buka order dengan status PENDING
3. Update status → PROCESSING
4. **Expected**: Berhasil ✅

**PROCESSING → SHIPPED**:

1. Dari order yang sudah PROCESSING
2. Update status → SHIPPED (isi tracking number)
3. **Expected**: Berhasil ✅

**SHIPPED → DELIVERED**:

1. Dari order yang sudah SHIPPED
2. Update status → DELIVERED
3. **Expected**: Berhasil ✅

**Any → CANCELLED** (sebelum DELIVERED):

1. Order dengan status PENDING/PROCESSING/SHIPPED
2. Update status → CANCELLED (isi cancellation reason)
3. **Expected**: Berhasil ✅

### Scenario 2.2: Invalid Transitions ❌

**PENDING → DELIVERED (skip)**:

1. Order dengan status PENDING
2. Try update status → DELIVERED
3. **Expected**: Error "Transisi status tidak valid: PENDING → DELIVERED. Status yang diizinkan: PROCESSING, CANCELLED"

**DELIVERED → PROCESSING (backward)**:

1. Order dengan status DELIVERED
2. Try update status → PROCESSING
3. **Expected**: Error "Transisi status tidak valid: DELIVERED → PROCESSING. Status yang diizinkan: Tidak ada (status final)"

**CANCELLED → SHIPPED (reactivate)**:

1. Order dengan status CANCELLED
2. Try update status → SHIPPED
3. **Expected**: Error "Transisi status tidak valid: CANCELLED → SHIPPED. Status yang diizinkan: Tidak ada (status final)"

---

## 🎯 TEST 3: Payment Status Sync

### Scenario 3.1: Payment Success Flow

**Expected**: Order status berubah, payment status terupdate

**Manual Test dengan Midtrans Sandbox**:

1. Buat order baru (status PENDING)
2. Klik "Bayar Sekarang" → Redirect ke Midtrans
3. Pilih payment method di sandbox
4. Complete payment
5. **Expected**:
   - Order status: PENDING → PROCESSING
   - Payment status: PENDING → PAID
   - Cek di database: `shippedAt` masih null

### Scenario 3.2: Payment Failed

**Expected**: Payment status update, order status tetap PENDING

1. Buat order baru
2. Di Midtrans sandbox, pilih payment method
3. Simulate payment failure
4. **Expected**:
   - Order status: PENDING (tidak berubah)
   - Payment status: PENDING → FAILED

### Scenario 3.3: Payment Expired

**Expected**: Payment status EXPIRED, order tetap PENDING

1. Buat order baru
2. Tunggu expiry time (atau simulate via webhook)
3. **Expected**:
   - Order status: PENDING
   - Payment status: EXPIRED

---

## 🎯 TEST 4: Order Detail Completeness

### Scenario 4.1: Check Transaction Data

**Expected**: Semua data transaction muncul

1. Login sebagai B2C user
2. Buka "Pesanan Saya"
3. Click order detail
4. **Expected Data**:
   - ✅ Order items (product, variant, quantity, price)
   - ✅ Shipping address
   - ✅ Status timeline
   - ✅ Payment status
   - ✅ Transaction ID
   - ✅ Payment method
   - ✅ VA Number (jika VA payment)
   - ✅ Bank name (jika VA payment)

### Scenario 4.2: Admin View Order Detail

**Expected**: Data lengkap dengan user info

1. Login sebagai Admin
2. Buka Admin → Orders
3. Click order detail
4. **Expected Additional Data**:
   - ✅ User name
   - ✅ User email
   - ✅ User phone
   - ✅ Settlement time (jika payment settled)
   - ✅ All transaction details

---

## 🎯 TEST 5: Error Handling

### Scenario 5.1: Stock Error di Checkout

**Expected**: User-friendly error message

1. Set stock produk = 1
2. Add to cart quantity = 5
3. Try checkout
4. **Expected**:
   - HTTP 400 Bad Request
   - Message: "Stok tidak mencukupi untuk [variant]. Tersedia: 1, Diminta: 5"
   - Frontend shows error message

### Scenario 5.2: Invalid Status Transition Error

**Expected**: Admin mendapat feedback yang jelas

1. Login sebagai Admin
2. Order dengan status DELIVERED
3. Try update ke PROCESSING
4. **Expected**:
   - HTTP 400 Bad Request
   - Message: "Transisi status tidak valid: DELIVERED → PROCESSING. Status yang diizinkan: Tidak ada (status final)"
   - Frontend shows error alert

---

## 📊 Database Verification Queries

Untuk verify di Prisma Studio atau PostgreSQL:

### Check Stock After Order

```sql
-- Cek stock sebelum order
SELECT id, name, stock FROM "ProductVariant" WHERE id = 'variant_id';

-- Buat order dengan quantity = 2

-- Cek stock setelah order (seharusnya berkurang 2)
SELECT id, name, stock FROM "ProductVariant" WHERE id = 'variant_id';
```

### Check Order Status History

```sql
-- Lihat timeline status order
SELECT
  id,
  "orderNumber",
  status,
  "paymentStatus",
  "createdAt",
  "shippedAt",
  "deliveredAt",
  "cancelledAt"
FROM "Order"
WHERE id = 'order_id';
```

### Check Transaction Sync

```sql
-- Verify transaction dan order status sinkron
SELECT
  o.id,
  o."orderNumber",
  o.status as order_status,
  o."paymentStatus",
  t."transactionStatus",
  t."paymentType",
  t."vaNumber",
  t.bank
FROM "Order" o
LEFT JOIN "Transaction" t ON t."orderId" = o.id
WHERE o.id = 'order_id';
```

---

## 🐛 Common Issues & Solutions

### Issue: "Stok tidak mencukupi" tapi stock masih ada

**Cause**: Concurrent order atau cache issue
**Solution**:

1. Refresh page
2. Check actual stock di database
3. Verify tidak ada pending transaction

### Issue: Status tidak bisa diupdate

**Cause**: Invalid transition atau order sudah final state
**Solution**:

1. Check current status order
2. Verify target status sesuai valid transitions
3. DELIVERED dan CANCELLED tidak bisa diubah

### Issue: Payment status tidak update

**Cause**: Webhook not received atau signature invalid
**Solution**:

1. Check Midtrans webhook settings
2. Verify `MIDTRANS_SERVER_KEY` di .env
3. Check server logs untuk webhook notification

---

## ✅ Testing Checklist Summary

Copy checklist ini untuk tracking:

### Stock Management

- [ ] Order dengan stock cukup → Success
- [ ] Order dengan stock tidak cukup → Error clear
- [ ] Concurrent orders → Stock konsisten
- [ ] Order cancelled → Stock kembali

### Status Transitions

- [ ] PENDING → PROCESSING → Success
- [ ] PROCESSING → SHIPPED → Success
- [ ] SHIPPED → DELIVERED → Success
- [ ] Any → CANCELLED → Success
- [ ] PENDING → DELIVERED → Error
- [ ] DELIVERED → Any → Error
- [ ] CANCELLED → Any → Error

### Payment Sync

- [ ] Payment pending → Status correct
- [ ] Payment success → Order PROCESSING + Payment PAID
- [ ] Payment failed → Order PENDING + Payment FAILED
- [ ] Payment expired → Order PENDING + Payment EXPIRED

### Order Detail

- [ ] All order data loaded
- [ ] Transaction data present
- [ ] VA number shown (if applicable)
- [ ] Settlement time shown (if applicable)

### Error Handling

- [ ] Stock errors → 400 with clear message
- [ ] Status errors → 400 with valid states shown
- [ ] Frontend shows error alerts properly

---

## 📞 Support

Jika menemukan bug atau behavior yang tidak sesuai:

1. Check server logs (`console.log` output)
2. Check browser console untuk frontend errors
3. Check database state di Prisma Studio
4. Verify .env configuration correct

Semua fix sudah diimplementasikan dan siap untuk testing! 🚀
