# 🔍 Audit Sistem Pesanan - Status & Integrasi

## ✅ Komponen Yang Sudah Ada & Berfungsi

### 1. Database Schema ✅

- ✅ `Order` model (status, payment, shipping info, timestamps)
- ✅ `OrderItem` model (product, variant, quantity, price)
- ✅ `Transaction` model (Midtrans integration)
- ✅ `ShippingAddress` model
- ✅ Relations antar model sudah benar

### 2. Models ✅

- ✅ `OrderModel.js` - CRUD operations lengkap
  - create(), findById(), getByUserId(), getUserOrders()
  - getAll(), updateStatus(), updatePaymentStatus()
  - getStatistics()
- ✅ `TransactionModel.js` - Payment transactions
- ✅ Stock management (berkurang saat order dibuat, kembali saat cancel)

### 3. API Routes ✅

- ✅ `POST /api/orders` - Create order & init payment
- ✅ `GET /api/orders` - Get user orders (pagination, filter)
- ✅ `GET /api/orders/[id]` - Order detail
- ✅ `PATCH /api/orders/[id]` - Update order (admin)
- ✅ `POST /api/payment/notification` - Midtrans webhook
- ✅ Cart cleared after order creation

### 4. Frontend Pages ✅

- ✅ `/checkout` - Address & shipping selection
- ✅ `/checkout/payment` - Payment with Midtrans Snap
- ✅ `/checkout/success` - Order confirmation
- ✅ `/orders` - Order history list
- ✅ `/orders/[id]` - Order detail with timeline

### 5. Components ✅

- ✅ `OrderCard.jsx` - Order list card
- ✅ `OrderStatus.jsx` - Status progress bar
- ✅ `OrderTimeline.jsx` - Status history
- ✅ `OrderFilter.jsx` - Search & filter
- ✅ `CheckoutSteps.jsx` - Progress indicator
- ✅ `OrderSummary.jsx` - Cart summary

---

## ⚠️ Issues Yang Perlu Diperbaiki

### 1. 🔴 CRITICAL - Stock Management

**Problem:** Stock sudah berkurang saat order dibuat, tapi:

- ❌ Tidak ada validasi stock sebelum create order
- ❌ Stock bisa jadi minus jika concurrent orders
- ❌ Perlu transaction lock

**Fix Needed:**

```javascript
// Di OrderModel.create(), tambahkan:
// 1. Check stock availability
// 2. Use database transaction with row locking
// 3. Validate stock before decrement
```

### 2. 🟡 MEDIUM - Order Status Flow

**Problem:** Status transitions tidak ter-validasi dengan baik

- ❌ Bisa skip status (PENDING → DELIVERED)
- ❌ Tidak ada validation rules untuk status change
- ❌ Beberapa status tidak trigger actions (email, etc)

**Fix Needed:**

```javascript
// Tambah validation di updateStatus():
const validTransitions = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
```

### 3. 🟡 MEDIUM - Payment Status Sync

**Problem:** Payment status vs Order status kadang tidak sync

- ⚠️ Order bisa PAID tapi paymentStatus masih UNPAID
- ⚠️ Tidak ada auto-check payment status

**Current Flow:**

```
1. Order created → status: PENDING, paymentStatus: UNPAID
2. Webhook received → transaction updated
3. Manual update order status → status: PAID
4. MASALAH: paymentStatus tidak auto-update
```

**Fix Needed:**

```javascript
// Di webhook handler, update both:
await OrderModel.updateStatus(orderId, "PAID");
await OrderModel.updatePaymentStatus(orderId, "PAID");
```

### 4. 🟡 MEDIUM - Order Detail Loading

**Problem:** Order detail page kadang tidak load complete data

- ⚠️ Missing relations (user, items, transaction)
- ⚠️ Tidak ada loading state yang proper

**Fix Needed:**

```javascript
// Pastikan include semua relations:
include: {
  items: {
    include: {
      product: { select: { name: true, images: true } },
      variant: { select: { name: true, price: true } }
    }
  },
  user: true,
  transaction: true
}
```

### 5. 🟢 LOW - User Experience

**Minor Issues:**

- ⚠️ Tidak ada email notification saat status berubah
- ⚠️ Tidak ada push notification
- ⚠️ Success page tidak show order number jelas
- ⚠️ Filter orders by status tidak ada

---

## 🔧 Quick Fixes Needed

### Priority 1 - Stock Validation (CRITICAL)

**File:** `src/models/OrderModel.js`

**Add before creating order:**

```javascript
// Check stock availability
for (const item of data.items) {
  const variant = await tx.productVariant.findUnique({
    where: { id: item.variantId },
  });

  if (!variant || variant.stock < item.quantity) {
    throw new Error(`Stock tidak cukup untuk ${variant.name}`);
  }
}
```

### Priority 2 - Status Validation

**File:** `src/models/OrderModel.js`

**Update updateStatus method:**

```javascript
static async updateStatus(id, status, additionalData = {}) {
  return await prisma.$transaction(async (tx) => {
    // Get current order
    const currentOrder = await tx.order.findUnique({ where: { id } });

    // Validate transition
    const validNext = {
      'PENDING': ['PAID', 'CANCELLED'],
      'PAID': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED'],
    };

    if (!validNext[currentOrder.status]?.includes(status)) {
      throw new Error(`Invalid status transition: ${currentOrder.status} → ${status}`);
    }

    // Continue with update...
  });
}
```

### Priority 3 - Sync Payment Status

**File:** `src/app/api/payment/notification/route.js`

**Update webhook handler:**

```javascript
// When payment success
if (["capture", "settlement"].includes(transactionStatus)) {
  await OrderModel.updateStatus(order.id, "PAID");
  await OrderModel.updatePaymentStatus(order.id, "PAID"); // ADD THIS
}
```

---

## 📋 Checklist Perbaikan

### Immediate Fixes (Today)

- [ ] Add stock validation before order creation
- [ ] Add status transition validation
- [ ] Sync payment status with order status
- [ ] Fix order detail loading (include all relations)
- [ ] Add error handling for concurrent stock updates

### Short Term (This Week)

- [ ] Add email notifications
- [ ] Improve success page UI
- [ ] Add order filters (status, date range)
- [ ] Add "Pay Now" button for PENDING orders
- [ ] Add order cancellation by user

### Long Term (Future)

- [ ] Add order tracking with courier API
- [ ] Add order reviews
- [ ] Add refund/return system
- [ ] Add order export (PDF/Excel)
- [ ] Add bulk order management for admin

---

## 🧪 Testing Checklist

### Test Order Creation

- [ ] Create order with sufficient stock → Should succeed
- [ ] Create order with insufficient stock → Should fail
- [ ] Create 2 concurrent orders for same product → Should handle correctly
- [ ] Create order without payment → Should create as PENDING

### Test Payment Flow

- [ ] Pay via Midtrans → Order status should become PAID
- [ ] Cancel payment → Order should stay PENDING
- [ ] Payment expired → Order should be CANCELLED
- [ ] Check paymentStatus matches order status

### Test Status Updates (Admin)

- [ ] Update PENDING → PAID → Should succeed
- [ ] Update PENDING → DELIVERED → Should fail (invalid transition)
- [ ] Update CANCELLED → PAID → Should fail
- [ ] Add tracking number when SHIPPED → Should save

### Test Stock Management

- [ ] Create order → Stock decreases
- [ ] Cancel order → Stock increases back
- [ ] Check stock is never negative

---

## 💡 Recommendations

### Critical Actions Needed:

1. **Add Stock Locking** - Use `FOR UPDATE` in database queries
2. **Validate Status Transitions** - Don't allow invalid jumps
3. **Sync Payment Status** - Keep order & payment status in sync
4. **Add Error Logging** - Track all order errors
5. **Add Transaction Rollback** - If any step fails, rollback all

### Architecture Improvements:

1. **Order State Machine** - Implement proper state machine pattern
2. **Event Sourcing** - Log all order events
3. **Queue System** - Handle status updates async
4. **Notification Service** - Centralized notification handling

---

## 📞 Next Steps

**Untuk memulai perbaikan:**

1. Backup database terlebih dahulu
2. Implementasi stock validation (Priority 1)
3. Test dengan multiple concurrent orders
4. Implementasi status validation (Priority 2)
5. Sync payment status (Priority 3)
6. Test end-to-end order flow
7. Monitor for any errors

**Ingin saya bantu perbaiki yang mana dulu?**

- Stock validation & locking
- Status transition validation
- Payment status sync
- Order detail loading fix
- Semua sekaligus (step by step)
