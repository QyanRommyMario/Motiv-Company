# 🔧 ACTION PLAN: UI Clean-up & Price Logic Correction

**Date:** January 7, 2026  
**Project:** MOTIV B2B E-Commerce Platform  
**Type:** Bug Fix & UX Improvement  
**Priority:** HIGH (Financial Impact)

---

## 📋 EXECUTIVE SUMMARY

Audit platform MOTIV menemukan **2 masalah kritis** yang berdampak pada user experience dan akurasi finansial:

1. **UI Issue**: Menu navigasi "B2B DASHBOARD" yang tidak diperlukan
2. **Critical Bug**: Double discounting menyebabkan kesalahan kalkulasi harga (Rp 45.000 → Rp 40.500)

---

## 🎯 OBJECTIVES

### 1. UI Clean-up (Navigation)
- **Goal**: Menyederhanakan user journey untuk B2B users
- **Action**: Hapus menu "B2B DASHBOARD" dari Header Navigation
- **Impact**: Mengurangi cognitive load dan memperjelas navigation flow

### 2. Price Logic Correction (Anti-Stacking Discount)
- **Goal**: Implementasi Single Layer Discount untuk B2B users
- **Action**: Perbaiki double discounting bug
- **Impact**: Akurasi finansial dan kepercayaan customer

---

## 🐛 PROBLEM ANALYSIS

### Issue #1: Redundant Navigation Menu

**Current State:**
```
Header Navigation (B2B Users):
- Products
- B2B DASHBOARD  ← Menu ini tidak diperlukan
- Vouchers
```

**Problem:**
- Menu "B2B DASHBOARD" tidak memiliki workflow yang jelas
- Membingungkan user dengan opsi yang tidak relevan
- Tidak ada halaman `/b2b` yang lengkap

**Impact:**
- User confusion
- Increased bounce rate pada navigation
- Poor UX design

---

### Issue #2: Double Discounting (CRITICAL)

**Current Behavior:**
```
Harga Retail:          Rp 50.000
Diskon B2B (10%):      -Rp 5.000   (Layer 1: API)
Harga setelah API:     Rp 45.000
Diskon B2B lagi (10%): -Rp 4.500   (Layer 2: Frontend) ❌ WRONG!
Harga yang ditampilkan: Rp 40.500
```

**Expected Behavior:**
```
Harga Retail:       Rp 50.000
Diskon B2B (10%):   -Rp 5.000   (Single Layer)
Harga Final B2B:    Rp 45.000   ✅ CORRECT!
```

**Root Cause:**

1. **Backend (ProductViewModel.js)**
   - API endpoint `/api/products/[id]` menerapkan diskon B2B
   - Mengubah `variant.price` dari Rp 50.000 → Rp 45.000
   - Menambahkan `variant.originalPrice` = Rp 50.000

2. **Frontend (ProductDetail.jsx)**
   - Menerima `variant.price` = Rp 45.000 (already discounted)
   - Menerapkan diskon LAGI: `b2bPrice = originalPrice - (originalPrice * discount) / 100`
   - Hasil: Rp 45.000 - (Rp 45.000 * 10%) = Rp 40.500 ❌

**Financial Impact:**
- Kehilangan revenue: (Rp 45.000 - Rp 40.500) × jumlah transaksi
- Contoh: 100 transaksi/hari = Rp 450.000/hari = Rp 13.5 juta/bulan
- Risiko reputasi: Jika diperbaiki, B2B customers akan komplain kenapa harga naik

---

## ✅ SOLUTION IMPLEMENTATION

### File Changes

#### 1. Navbar.jsx (UI Clean-up)

**File:** `src/components/layout/Navbar.jsx`  
**Line:** 90

**Before:**
```javascript
const navLinks = isB2B
  ? [
      { href: "/products", label: t("products") },
      { href: "/b2b", label: t("b2bDashboard") || "B2B Dashboard" },
      { href: "/vouchers", label: t("vouchers") },
    ]
  : [
      { href: "/products", label: t("products") },
      { href: "/stories", label: t("stories") },
      { href: "/vouchers", label: t("vouchers") },
    ];
```

**After:**
```javascript
const navLinks = isB2B
  ? [
      { href: "/products", label: t("products") },
      { href: "/vouchers", label: t("vouchers") },
    ]
  : [
      { href: "/products", label: t("products") },
      { href: "/stories", label: t("stories") },
      { href: "/vouchers", label: t("vouchers") },
    ];
```

**Impact:**
- ✅ Simplified navigation for B2B users
- ✅ Cleaner UI/UX
- ✅ No functional regression (menu tidak digunakan)

---

#### 2. ProductDetail.jsx (Price Logic Fix)

**File:** `src/components/products/ProductDetail.jsx`  
**Line:** 29-34

**Before (WRONG - Double Discounting):**
```javascript
// Calculate B2B price
const hasB2BDiscount =
  session?.user?.role === "B2B" && session.user.discount > 0;
const discount = session?.user?.discount || 0;
const originalPrice = selectedVariant?.price || 0;  // ❌ Ini sudah harga diskon!
const b2bPrice = hasB2BDiscount
  ? originalPrice - (originalPrice * discount) / 100  // ❌ Diskon lagi!
  : originalPrice;
```

**After (CORRECT - Single Layer Discount):**
```javascript
// Calculate B2B price
// IMPORTANT: API already applies B2B discount to variant.price
// originalPrice = harga retail, price = harga setelah diskon B2B (jika ada)
const hasB2BDiscount =
  session?.user?.role === "B2B" && session.user.discount > 0;
const discount = session?.user?.discount || 0;

// Jika B2B: originalPrice = harga retail, price = harga diskon
// Jika non-B2B: originalPrice tidak ada, gunakan price sebagai harga normal
const originalPrice = selectedVariant?.originalPrice || selectedVariant?.price || 0;
const b2bPrice = hasB2BDiscount ? (selectedVariant?.price || 0) : originalPrice;
```

**Key Changes:**
1. ✅ Gunakan `variant.originalPrice` untuk menampilkan harga retail (Rp 50.000)
2. ✅ Gunakan `variant.price` yang sudah didiskon dari API (Rp 45.000)
3. ✅ Tidak menerapkan diskon lagi di frontend
4. ✅ Fallback untuk non-B2B users tetap menggunakan `variant.price`

**Price Calculation Flow:**

```
┌─────────────────────────────────────────────────────────┐
│  BACKEND (ProductViewModel.js)                          │
│  /api/products/[id]?user=B2B                           │
├─────────────────────────────────────────────────────────┤
│  Input:  variant.price = Rp 50.000                     │
│  Logic:  applyB2BDiscount(50000, 10%)                  │
│  Output: {                                              │
│            originalPrice: 50000,  ← Harga retail       │
│            price: 45000,          ← Harga B2B          │
│            discount: 10                                 │
│          }                                              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (ProductDetail.jsx)                           │
│  Display harga tanpa kalkulasi ulang                   │
├─────────────────────────────────────────────────────────┤
│  originalPrice = variant.originalPrice = Rp 50.000     │
│  b2bPrice      = variant.price         = Rp 45.000     │
│                                                          │
│  Display:                                               │
│  "B2B Special Price -10%"                              │
│  Rp 45.000  (harga besar, bold)                        │
│  Rp 50.000  (coret)                                    │
│  Save Rp 5.000                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 TESTING REQUIREMENTS

### Test Case 1: Navigation Menu (B2B User)

**Steps:**
1. Login sebagai B2B user
2. Lihat Header Navigation

**Expected Result:**
- ✅ Menu hanya menampilkan: Products, Vouchers
- ❌ Menu "B2B Dashboard" tidak ada

---

### Test Case 2: Price Display (B2B User)

**Given:**
- Product: "Arabica Blend"
- Retail Price: Rp 50.000
- B2B Discount: 10%
- B2B User: admin@motivcompany.com

**Steps:**
1. Login sebagai B2B user
2. Buka halaman produk `/products/[id]`
3. Pilih variant (1kg)
4. Periksa harga yang ditampilkan

**Expected Result:**
```
Badge: "B2B Special Price -10%"
Harga B2B: Rp 45.000 (bold, besar)
Harga Retail: Rp 50.000 (coret)
Save: Rp 5.000
```

**Add to Cart Button:**
```
"Add to Cart - Rp 45.000" (quantity = 1)
"Add to Cart - Rp 90.000" (quantity = 2)
```

**Expected Database/API:**
- ✅ Harga di cart: Rp 45.000
- ✅ Harga di checkout: Rp 45.000
- ✅ Harga di Midtrans: Rp 45.000
- ✅ Harga di invoice: Rp 45.000

---

### Test Case 3: Price Display (Non-B2B User)

**Given:**
- Product: "Arabica Blend"
- Retail Price: Rp 50.000
- Regular User (tidak ada diskon)

**Steps:**
1. Login sebagai regular user (atau guest)
2. Buka halaman produk `/products/[id]`
3. Pilih variant (1kg)
4. Periksa harga yang ditampilkan

**Expected Result:**
```
Tidak ada badge "B2B Special Price"
Harga: Rp 50.000 (bold, besar)
Tidak ada strikethrough
```

**Add to Cart Button:**
```
"Add to Cart - Rp 50.000" (quantity = 1)
```

---

### Test Case 4: Voucher (Discount Stacking Exception)

**Given:**
- B2B User dengan diskon 10%
- Harga B2B: Rp 45.000
- Voucher: "NEWYEAR10" (10% off)

**Expected Behavior:**
```
Subtotal (B2B):        Rp 45.000
Voucher Discount:      -Rp 4.500  ✅ ALLOWED (manual voucher)
Total:                 Rp 40.500
```

**Note:** Pemotongan harga tambahan HANYA diperbolehkan melalui **voucher manual** di checkout.

---

## 📊 VALIDATION CHECKLIST

- [x] Code review by Senior Developer
- [x] UI testing (B2B vs Regular user)
- [ ] Price calculation testing
  - [ ] Product Detail Page
  - [ ] Cart Page
  - [ ] Checkout Page
  - [ ] Midtrans Payment
- [ ] Regression testing
  - [ ] Non-B2B user tidak terdampak
  - [ ] Cart calculation tetap accurate
  - [ ] Voucher system tetap berfungsi
- [ ] Database validation
  - [ ] Harga di orders table = Rp 45.000
  - [ ] Tidak ada record dengan Rp 40.500
- [ ] UAT with B2B customers

---

## 🚨 DEPLOYMENT NOTES

### Pre-deployment
1. **Backup database** (table: orders, cart_items)
2. **Test di staging environment** dengan data real
3. **Notify B2B customers** (jika diperlukan):
   - "We fixed a pricing bug - your discount is still 10%"
   - Tampilkan breakdown harga yang benar

### Post-deployment
1. **Monitor Sentry** untuk price-related errors
2. **Check Midtrans transactions** untuk memastikan harga benar
3. **Customer support ready** untuk handle complain harga
4. **Analytics**: Track B2B conversion rate (harusnya tidak turun)

### Rollback Plan
Jika ada masalah kritis:
```bash
git revert <commit-hash>
npm run build
npm run deploy
```

Files to revert:
- `src/components/layout/Navbar.jsx`
- `src/components/products/ProductDetail.jsx`

---

## 📝 ADDITIONAL RECOMMENDATIONS

### Future Improvements

1. **Add Unit Tests**
   ```javascript
   describe('B2B Price Calculation', () => {
     it('should apply discount only once', () => {
       const retailPrice = 50000;
       const discount = 10;
       const expectedB2BPrice = 45000;
       
       const result = applyB2BDiscount(retailPrice, discount);
       expect(result).toBe(expectedB2BPrice);
     });
   });
   ```

2. **Add Price Audit Log**
   - Log setiap perubahan harga B2B
   - Track discount application
   - Monitor for anomalies

3. **Admin Dashboard Enhancement**
   - Show B2B price preview di product management
   - Alert jika harga B2B < cost price (margin negative)

4. **Configuration Management**
   ```javascript
   // config/discounts.js
   export const DISCOUNT_RULES = {
     B2B: {
       type: 'PERCENTAGE',
       value: 10,
       stackable: false,  // ✅ Prevent double discount
       allowVoucherStacking: true
     }
   };
   ```

---

## 👥 STAKEHOLDERS

**Technical Team:**
- Frontend Developer: Implement UI changes
- Backend Developer: Verify API logic
- QA Engineer: Execute test cases
- DevOps: Deploy to staging/production

**Business Team:**
- Product Manager: Approve changes
- Customer Support: Handle customer inquiries
- Finance Team: Validate pricing accuracy

---

## 📞 SUPPORT

**Developer:** GitHub Copilot  
**Date:** January 7, 2026  
**Ticket:** MOTIV-2026-001

For questions, contact:
- Tech Lead: [Insert contact]
- Product Manager: [Insert contact]

---

## ✅ COMPLETION CRITERIA

**Definition of Done:**
- [x] Code changes committed and reviewed
- [x] Documentation updated
- [ ] All test cases passed
- [ ] Staging deployment successful
- [ ] UAT approved by Product Manager
- [ ] Production deployment completed
- [ ] No critical errors in 24 hours post-deploy

---

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Status:** ✅ IMPLEMENTED (Pending Testing)
