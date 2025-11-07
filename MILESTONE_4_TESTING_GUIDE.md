# 🧪 Testing Guide - Milestone 4: Checkout & Shipping

## Quick Start Testing

### Prerequisites

1. Server running: `npm run dev`
2. PostgreSQL database configured
3. User account created and logged in

---

## Test Scenario 1: Address Management

### 1.1 Access Address Management

1. Click on 📍 icon in navbar
2. OR navigate to `/profile/addresses`
3. ✅ Should see "Alamat Pengiriman" page

### 1.2 Add New Address

1. Click "Tambah Alamat" button
2. Fill in all required fields:
   - Label: `Rumah`
   - Nama: `John Doe`
   - Telepon: `081234567890`
   - Alamat: `Jl. Sudirman No. 123, RT 001/RW 002`
   - Kota: `Jakarta Selatan`
   - Provinsi: `DKI Jakarta`
   - Kode Pos: `12190`
   - Check "Jadikan sebagai alamat utama"
3. Click "Tambah Alamat"
4. ✅ Should show success and redirect to address list
5. ✅ Address should have "Default" badge

### 1.3 Add Second Address

1. Click "Tambah Alamat" again
2. Fill different address (e.g., "Kantor")
3. DO NOT check "jadikan sebagai alamat utama"
4. Click "Tambah Alamat"
5. ✅ Should show in list below first address
6. ✅ First address still has "Default" badge

### 1.4 Edit Address

1. Click "Edit" on any address
2. Change some fields (e.g., phone number)
3. Click "Simpan Perubahan"
4. ✅ Should update successfully
5. ✅ Changes should be visible in list

### 1.5 Set as Default

1. On non-default address, click "Jadikan Alamat Utama"
2. ✅ "Default" badge should move to that address
3. ✅ Previous default should no longer have badge

### 1.6 Delete Address

1. On non-default address, click "Hapus"
2. ✅ Button text changes to "Yakin?"
3. Click "Hapus" again
4. ✅ Address should be removed from list
5. Try clicking "Hapus" on default address
6. ✅ Button should be disabled (cannot delete default)

### 1.7 Validation Tests

1. Try to add address with empty fields
2. ✅ Should show error messages
3. Try invalid phone: `123` or `999`
4. ✅ Should show "Nomor telepon tidak valid"
5. Try invalid postal code: `123` or `123456`
6. ✅ Should show "Kode pos harus 5 digit"

---

## Test Scenario 2: Checkout Flow

### 2.1 Add Items to Cart

1. Navigate to `/products`
2. Add at least 2-3 products to cart
3. Click cart icon in navbar
4. ✅ Should show items in cart

### 2.2 Start Checkout

1. In cart page, click "Checkout" button
2. ✅ Should redirect to `/checkout`
3. ✅ Should show step 2 active in progress bar
4. ✅ Default address should be pre-selected

### 2.3 Select Address

1. If you have multiple addresses, select different one
2. ✅ Selected address should be highlighted (amber border)
3. ✅ Order summary should update (no change yet, but should be visible)

### 2.4 Add New Address from Checkout

1. Click "Tambah Alamat Baru" (dashed border button)
2. ✅ Should redirect to `/profile/addresses?action=add&returnTo=/checkout`
3. Add new address
4. ✅ Should return to `/checkout` after saving
5. ✅ New address should appear in list

### 2.5 Select Shipping Method

1. Scroll to "Metode Pengiriman" section
2. ✅ Should see destination info with selected address
3. Click on a courier section (e.g., JNE)
4. Select a service (e.g., "Reguler")
5. ✅ Selected service should be highlighted
6. ✅ Order summary should update with shipping cost

### 2.6 Try Different Couriers

1. Select TIKI → "Over Night Service"
2. ✅ Order summary total should change
3. Select SiCepat → "Best"
4. ✅ Order summary total should change accordingly

### 2.7 Add Order Notes

1. Scroll to "Catatan Pesanan"
2. Type: `Tolong kirim sore hari, hubungi sebelum kirim`
3. ✅ Text should appear in textarea

### 2.8 Validation Before Payment

1. Deselect shipping method (if possible)
2. Click "Lanjut ke Pembayaran"
3. ✅ Should show error "Pilih metode pengiriman"
4. Select shipping method again
5. Click "Lanjut ke Pembayaran"
6. ✅ Should redirect to `/checkout/payment`

---

## Test Scenario 3: Payment & Completion

### 3.1 Payment Selection

1. On payment page, verify:
   - ✅ Step 3 should be active
   - ✅ Should show 4 payment methods
   - ✅ COD should be disabled (Segera Hadir)

### 3.2 Select Payment Method

1. Click on "Transfer Bank"
2. ✅ Should be highlighted
3. Click on "E-Wallet"
4. ✅ Should switch selection

### 3.3 Process Payment

1. With payment method selected, click "Bayar Sekarang"
2. ✅ Button should show "Memproses Pembayaran..."
3. Wait 2 seconds (mock processing)
4. ✅ Should redirect to `/checkout/success`

### 3.4 Order Confirmation

1. On success page, verify:
   - ✅ Step 4 should be active
   - ✅ Should show success icon (green checkmark)
   - ✅ Should show order ID (MOCK-ORDER-123)
   - ✅ Should show next steps information

### 3.5 After Checkout

1. Click "Lanjut Belanja"
2. ✅ Should go to `/products`
3. Click cart icon in navbar
4. ✅ Cart should still have items (not cleared yet - will be in Milestone 6)

---

## Test Scenario 4: Edge Cases

### 4.1 Checkout with Empty Cart

1. Clear all items from cart
2. Try to navigate to `/checkout` directly
3. ✅ Should show "Keranjang Kosong" message
4. ✅ Should have button to go to products

### 4.2 Checkout without Address

1. Delete all addresses
2. Try to checkout
3. ✅ Should show "Belum Ada Alamat" state
4. ✅ Should have "Tambah Alamat" button
5. Click button and add address
6. ✅ Should be able to continue checkout

### 4.3 Payment without Checkout Data

1. Navigate directly to `/checkout/payment` (skip checkout)
2. ✅ Should redirect back to `/checkout`

### 4.4 Authentication Tests

1. Logout
2. Try to access `/profile/addresses`
3. ✅ Should redirect to login
4. Try to access `/checkout`
5. ✅ Should redirect to login
6. Try API directly: `GET /api/shipping/addresses`
7. ✅ Should return 401 Unauthorized

---

## Test Scenario 5: Mobile Responsiveness

### 5.1 Address Management on Mobile

1. Resize browser to mobile size (375px)
2. Navigate to address page
3. ✅ Layout should stack vertically
4. ✅ Buttons should be full width
5. ✅ Form fields should be readable

### 5.2 Checkout on Mobile

1. On mobile size, go to checkout
2. ✅ Order summary should be below main content
3. ✅ Address cards should stack
4. ✅ Courier services should be readable
5. ✅ Progress steps should wrap or scroll

---

## Test Scenario 6: API Testing (Optional)

### Using Browser DevTools or Postman

#### 6.1 List Addresses

```
GET http://localhost:3000/api/shipping/addresses
Headers: Cookie: next-auth.session-token=<your-token>
Expected: 200 OK with array of addresses
```

#### 6.2 Create Address

```
POST http://localhost:3000/api/shipping/addresses
Headers:
  Content-Type: application/json
  Cookie: next-auth.session-token=<your-token>
Body:
{
  "label": "API Test",
  "name": "API User",
  "phone": "081234567890",
  "address": "Test Address",
  "city": "Test City",
  "province": "Test Province",
  "postalCode": "12345",
  "isDefault": false
}
Expected: 201 Created with new address data
```

#### 6.3 Update Address

```
PATCH http://localhost:3000/api/shipping/addresses/<address-id>
Headers:
  Content-Type: application/json
  Cookie: next-auth.session-token=<your-token>
Body:
{
  "phone": "089999999999",
  "isDefault": true
}
Expected: 200 OK with updated address
```

#### 6.4 Delete Address

```
DELETE http://localhost:3000/api/shipping/addresses/<address-id>
Headers: Cookie: next-auth.session-token=<your-token>
Expected: 200 OK with success message
```

---

## Expected Behavior Summary

### ✅ What Should Work

- [x] Create, read, update, delete addresses
- [x] Set one address as default (auto-unsets others)
- [x] Form validation for all address fields
- [x] Checkout flow: address → shipping → payment → success
- [x] Auto-select default address in checkout
- [x] Shipping cost calculation (mock data)
- [x] Order summary updates with shipping
- [x] Payment method selection
- [x] Order confirmation page
- [x] Navigation between all pages
- [x] Authentication checks on all routes
- [x] Ownership verification for addresses
- [x] Responsive design

### ⏳ What's Not Implemented Yet (Future Milestones)

- [ ] Real shipping API integration (RajaOngkir)
- [ ] Real payment gateway (Midtrans)
- [ ] Order creation and storage
- [ ] Order history and tracking
- [ ] Email notifications
- [ ] B2B custom shipping
- [ ] Voucher application
- [ ] Admin order management

---

## 🐛 Known Issues / Limitations

1. **Mock Shipping Data**: Using static courier data with fixed prices
2. **Mock Payment**: Payment processing is simulated (2-second delay)
3. **Order Not Saved**: Orders are not yet stored in database (Milestone 6)
4. **Cart Not Cleared**: Cart items persist after checkout (will be fixed in Milestone 6)
5. **No Email**: Order confirmation emails not sent yet
6. **No Tracking**: Order tracking not implemented

---

## 📊 Test Results Template

Use this to track your testing:

```
Date: _______________
Tester: _______________

Test Scenario 1: Address Management
[ ] 1.1 Access Address Management - PASS / FAIL / SKIP
[ ] 1.2 Add New Address - PASS / FAIL / SKIP
[ ] 1.3 Add Second Address - PASS / FAIL / SKIP
[ ] 1.4 Edit Address - PASS / FAIL / SKIP
[ ] 1.5 Set as Default - PASS / FAIL / SKIP
[ ] 1.6 Delete Address - PASS / FAIL / SKIP
[ ] 1.7 Validation Tests - PASS / FAIL / SKIP

Test Scenario 2: Checkout Flow
[ ] 2.1 Add Items to Cart - PASS / FAIL / SKIP
[ ] 2.2 Start Checkout - PASS / FAIL / SKIP
[ ] 2.3 Select Address - PASS / FAIL / SKIP
[ ] 2.4 Add New Address from Checkout - PASS / FAIL / SKIP
[ ] 2.5 Select Shipping Method - PASS / FAIL / SKIP
[ ] 2.6 Try Different Couriers - PASS / FAIL / SKIP
[ ] 2.7 Add Order Notes - PASS / FAIL / SKIP
[ ] 2.8 Validation Before Payment - PASS / FAIL / SKIP

Test Scenario 3: Payment & Completion
[ ] 3.1 Payment Selection - PASS / FAIL / SKIP
[ ] 3.2 Select Payment Method - PASS / FAIL / SKIP
[ ] 3.3 Process Payment - PASS / FAIL / SKIP
[ ] 3.4 Order Confirmation - PASS / FAIL / SKIP
[ ] 3.5 After Checkout - PASS / FAIL / SKIP

Test Scenario 4: Edge Cases
[ ] 4.1 Checkout with Empty Cart - PASS / FAIL / SKIP
[ ] 4.2 Checkout without Address - PASS / FAIL / SKIP
[ ] 4.3 Payment without Checkout Data - PASS / FAIL / SKIP
[ ] 4.4 Authentication Tests - PASS / FAIL / SKIP

Test Scenario 5: Mobile Responsiveness
[ ] 5.1 Address Management on Mobile - PASS / FAIL / SKIP
[ ] 5.2 Checkout on Mobile - PASS / FAIL / SKIP

Notes:
_____________________________________________________
_____________________________________________________
_____________________________________________________
```

---

## 🚀 Next Steps After Testing

1. **Fix any bugs found during testing**
2. **Update TESTING_REPORT.md with results**
3. **Create screenshots for documentation**
4. **Proceed to Milestone 5: Payment Integration**

---

**Happy Testing! 🎉**
