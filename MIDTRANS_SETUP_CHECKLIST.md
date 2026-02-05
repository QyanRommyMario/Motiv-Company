# ✅ MIDTRANS SANDBOX SETUP CHECKLIST

## 📋 Status Update: 5 Februari 2026

### 1. ✅ Generate RSA Key Pair

- [x] Private Key: `.keys/midtrans-private.pem` (✅ Generated)
- [x] Public Key: `.keys/midtrans-public.pem` (✅ Generated)
- [x] `.gitignore` updated untuk protect private key

---

### 2. ✅ Register Public Key ke Midtrans

- [x] Login ke https://dashboard.sandbox.midtrans.com
- [x] Settings → Access Keys → Register Merchant Public Key
- [x] Public Key berhasil didaftarkan
- [x] Client ID & Secret berhasil di-generate

---

### 3. ✅ Update Environment Variables

File: `.env`

```env
# Merchant ID
MIDTRANS_MERCHANT_ID=G268286422

# Client & Server Keys (untuk Snap API)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-grRD************id1
MIDTRANS_CLIENT_KEY=Mid-client-grRD************id1
MIDTRANS_SERVER_KEY=Mid-server-w_lR************S60

# OAuth 2.0 Credentials (untuk API advanced)
MIDTRANS_CLIENT_ID=iBZF3LTk-G268286422-SNAP
MIDTRANS_CLIENT_SECRET=cPoLfZUYn7SGomjlgjI75Cnh************[MASKED]

# Mode & URLs
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_API_URL=https://app.sandbox.midtrans.com
NEXT_PUBLIC_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
```

**Status**: ✅ **Updated & Verified**

---

### 4. ✅ **Configure Webhook URL di Midtrans Dashboard**

**Status**: ✅ **COMPLETED!**

#### ✅ Konfigurasi yang sudah di-set:

**Merchant Details:**

- Merchant ID: `G268286422`
- Client Key: `Mid-client-grRD************id1`
- Server Key: `Mid-server-w_lR************S60`
- Environment: **Sandbox (Development)**

**Webhook & Redirect URLs:**

```
✅ Payment Notification URL
   https://motivcompany.vercel.app/api/payment/notification

✅ Recurring Notification URL
   https://motivcompany.vercel.app/api/payment/notification

✅ Pay Account Notification URL
   https://motivcompany.vercel.app/api/payment/notification

✅ Finish Redirect URL (Success)
   https://motivcompany.vercel.app/checkout/success

✅ Unfinish Redirect URL (Pending/Cancel)
   https://motivcompany.vercel.app/cart

✅ Error Redirect URL
   https://motivcompany.vercel.app/cart
```

**Verification**: ✅ All URLs configured correctly!

---

### 5. ✅ Code Fixes (Already Implemented)

#### Fix #1: Status Mapping ✅

**File**: `src/lib/midtrans.js`

- [x] Order status `"PAID"` → `"PROCESSING"` (sesuai DB constraint)
- [x] Handle fraud_status: `accept`, `challenge`, `deny`
- [x] Handle expired & failed transactions

#### Fix #2: Atomic Stock Decrement ✅

**File**: `src/models/OrderModel.js`

- [x] Gunakan `atomic_decrement_stock` RPC function
- [x] Mencegah race condition saat concurrent payments
- [x] Stock berkurang otomatis setelah payment confirmed

#### Fix #3: Webhook Handler ✅

**File**: `src/app/api/payment/notification/route.js`

- [x] Signature verification
- [x] Update transaction status
- [x] Update order & payment status
- [x] Call `deductStock()` setelah payment PAID

---

## 🔍 TESTING CHECKLIST

### Local Testing (Development)

- [ ] Restart Next.js dev server: `npm run dev`
- [ ] Create test order
- [ ] Simulate payment via script:
  ```bash
  node scripts/manual-trigger-webhook.js
  ```
- [ ] Verify:
  - [ ] Order status: `PENDING` → `PROCESSING`
  - [ ] Payment status: `UNPAID` → `PAID`
  - [ ] Stock berkurang sesuai quantity

### Production Testing (Vercel)

- [ ] Deploy ke Vercel: `git push`
- [ ] Set environment variables di Vercel Dashboard
- [ ] Configure webhook URL di Midtrans (lihat #4)
- [ ] Create real test order
- [ ] Pay via Midtrans Simulator:
  - Card Number: `4811 1111 1111 1114`
  - CVV: `123`
  - Exp: `01/30`
- [ ] Verify payment & stock update otomatis

---

## 🚨 CRITICAL ISSUES TO RESOLVE

### ⚠️ Issue #1: Webhook URL Configuration

**Status**: **MUST BE DONE**

**Why Critical**:

- Tanpa webhook URL, Midtrans tidak bisa notify aplikasi saat payment sukses
- Status order akan tetap PENDING selamanya
- Stock tidak akan berkurang
- Customer complain

**Solution**:

1. Deploy aplikasi ke Vercel (atau hosting lain)
2. Dapatkan production URL
3. Configure di Midtrans Dashboard (lihat langkah #4)

**Timeline**: **HARUS SEGERA** sebelum testing payment flow

---

### ⚠️ Issue #2: Environment Variables di Vercel

**Status**: ⚠️ **PERLU DI-SET**

Pastikan semua env vars sudah di-set di Vercel Dashboard untuk environment **production, preview, development**:

**Critical Variables:**

```
MIDTRANS_SERVER_KEY=Mid-server-w_lR************S60
MIDTRANS_CLIENT_KEY=Mid-client-grRD************id1
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-grRD************id1
MIDTRANS_CLIENT_ID=iBZF3LTk-G268286422-SNAP
MIDTRANS_CLIENT_SECRET=cPoLfZUYn7SGomjlgjI75Cnh************[MASKED]
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_API_URL=https://app.sandbox.midtrans.com
NEXT_PUBLIC_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
```

**Cara Set via Vercel Dashboard:**

1. Buka https://vercel.com/dashboard
2. Pilih project `motivcompany`
3. Settings → Environment Variables
4. Add New → Copy-paste variable name & value
5. Pilih scope: Production + Preview + Development
6. Save & Redeploy

**Atau via Vercel CLI:**

```bash
# Run helper script
node scripts/setup-vercel-env.js

# Atau manual satu-satu
vercel env add MIDTRANS_SERVER_KEY production
vercel env add MIDTRANS_CLIENT_KEY production
# ... dst
```

**Timeline**: **HARUS DILAKUKAN** sebelum test payment di production

---

## 📊 EXPECTED BEHAVIOR (After All Fixes)

### Scenario: Customer Bayar via Midtrans

1. **Customer checkout** → Order created (status: `PENDING`, payment: `UNPAID`)
2. **Redirect ke Midtrans** → Customer input payment method
3. **Payment success** → Midtrans call webhook: `/api/payment/notification`
4. **Webhook handler**:
   - ✅ Verify signature
   - ✅ Update transaction status
   - ✅ Update order status: `PENDING` → `PROCESSING`
   - ✅ Update payment status: `UNPAID` → `PAID`
   - ✅ Deduct stock atomically
5. **Customer redirect** → `/checkout/success` page
6. **Admin dashboard** → Order muncul dengan status `PROCESSING`

---

## 📝 NEXT STEPS

1. **[URGENT]** Deploy ke Vercel (jika belum)
2. **[URGENT]** Configure webhook URL di Midtrans Dashboard
3. **[URGENT]** Set environment variables di Vercel
4. Test payment flow end-to-end
5. Monitor logs untuk error
6. Update dokumentasi jika ada issue

---

## 📞 SUPPORT

**Midtrans Support**:

- Email: support@midtrans.com
- Docs: https://docs.midtrans.com
- Dashboard: https://dashboard.sandbox.midtrans.com

**Troubleshooting**:

- Webhook not triggered → Check webhook URL configuration
- Payment success but status not updated → Check signature verification
- Stock not deducted → Check `atomic_decrement_stock` RPC function exists
- Order status invalid → Check database constraints

---

## ✅ SUMMARY

| Component                        | Status      | Notes                                         |
| -------------------------------- | ----------- | --------------------------------------------- |
| RSA Keys                         | ✅ Done     | Generated & registered                        |
| API Credentials                  | ✅ Done     | Client Key, Server Key, OAuth credentials     |
| Environment Variables (.env)     | ✅ Done     | Local `.env` updated                          |
| Code Fixes                       | ✅ Done     | Status mapping, atomic stock, webhook handler |
| **Webhook URL Configuration**    | ✅ **Done** | **All URLs configured di Midtrans Dashboard** |
| **Vercel Environment Variables** | ⚠️ **TODO** | **MUST set di Vercel Dashboard**              |
| End-to-End Testing               | ⚠️ Pending  | Waiting for Vercel env vars                   |

---

## 🎯 NEXT IMMEDIATE ACTION

### Yang HARUS Dilakukan Sekarang:

1. **Set Environment Variables di Vercel Dashboard** 🔴 **KRITIS**

   ```
   Vercel Dashboard → Settings → Environment Variables

   Tambahkan 8 variables berikut (untuk production + preview + development):
   - MIDTRANS_SERVER_KEY
   - MIDTRANS_CLIENT_KEY
   - NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
   - MIDTRANS_CLIENT_ID
   - MIDTRANS_CLIENT_SECRET
   - MIDTRANS_IS_PRODUCTION
   - NEXT_PUBLIC_MIDTRANS_API_URL
   - NEXT_PUBLIC_MIDTRANS_SNAP_URL
   ```

2. **Redeploy ke Vercel**

   ```bash
   git add .
   git commit -m "Update Midtrans credentials"
   git push
   # atau
   vercel --prod
   ```

3. **Test Payment Flow**
   - Buat test order di https://motivcompany.vercel.app
   - Bayar via Midtrans Simulator
   - Verifikasi: status berubah & stock berkurang

---

**Last Updated**: 5 Februari 2026 - Webhook URLs Configured ✅
**Next Review**: After Vercel env vars setup
