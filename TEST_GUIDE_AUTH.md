# 🧪 Quick Test Guide - Auth Improvements

## Test Sekarang! 🚀

### ✅ Test 1: Admin Auto-Redirect (PALING PENTING!)

**Steps:**

```bash
1. Buka http://localhost:3000/login
2. Login dengan:
   Email: admin@motiv.com
   Password: admin123
3. Perhatikan:
   - Button berubah jadi "Loading..."
   - Langsung redirect ke /admin (BUKAN homepage!)
   - Admin dashboard muncul
```

**Expected Result:**

- ✅ Tidak mampir ke homepage dulu
- ✅ Langsung ke admin dashboard
- ✅ Smooth transition dengan loading

---

### ✅ Test 2: Admin Visit Homepage → Auto-Redirect

**Steps:**

```bash
1. Masih login sebagai admin
2. Klik logo "MOTIV" di navbar
3. Atau ketik manual: http://localhost:3000/
```

**Expected Result:**

- ✅ Loading spinner muncul sebentar
- ✅ Message: "Redirecting to admin dashboard..."
- ✅ Auto-redirect kembali ke /admin
- ✅ Tidak pernah lihat homepage

---

### ✅ Test 3: SignOut Smooth

**Steps:**

```bash
1. Masih login (admin/B2B/B2C, any role)
2. Klik dropdown profile (ikon user)
3. Klik "Sign Out"
4. Perhatikan button
```

**Expected Result:**

- ✅ Button berubah jadi "Signing out..."
- ✅ Button disabled (tidak bisa klik lagi)
- ✅ Setelah 1-2 detik redirect ke homepage
- ✅ Muncul guest landing page
- ✅ **TIDAK ADA ERROR di console!**

---

### ✅ Test 4: B2B Dashboard

**Steps:**

```bash
1. Logout dulu (sign out)
2. Login dengan:
   Email: b2b@test.com
   Password: b2b123
3. Lihat homepage
```

**Expected Result:**

- ✅ Badge hitam "B2B PARTNER" muncul
- ✅ Tulisan "10% DISCOUNT ON ALL PRODUCTS"
- ✅ Section "B2B EXCLUSIVE FEATURES" di bawah
- ✅ 2 card: "Bulk Ordering" + "Priority Support"

---

### ✅ Test 5: B2C Standard Dashboard

**Steps:**

```bash
1. Logout
2. Login dengan:
   Email: user@test.com
   Password: user123
3. Lihat homepage
```

**Expected Result:**

- ✅ Welcome message dengan nama user
- ✅ 3 quick links: Shop Coffee, My Orders, Cart
- ✅ **TIDAK ADA** badge B2B
- ✅ **TIDAK ADA** section exclusive features

---

## 🔍 What to Check

### Console (Browser DevTools)

```javascript
// Tekan F12 → Console tab
// Seharusnya TIDAK ADA error seperti:
❌ "Cannot read properties of undefined"
❌ "signOut is not defined"
❌ "Maximum update depth exceeded"

// Seharusnya CLEAN atau hanya warning biasa
✅ Next.js warnings (OK)
✅ Debug logs (OK)
```

### Network Tab

```javascript
// F12 → Network tab
// Saat login, cek requests:
1. POST /api/auth/callback/credentials → 200 OK
2. GET /api/auth/session → 200 OK (returns role)
3. Redirect ke /admin atau / → Success

// Saat signout:
1. POST /api/auth/signout → 200 OK
2. Redirect ke / → Success
```

---

## ⚡ Quick Credentials

Copy-paste ini untuk test cepat:

```bash
# ADMIN (harus redirect ke /admin)
admin@motiv.com
admin123

# B2B (homepage dengan badge)
b2b@test.com
b2b123

# B2C (homepage standard)
user@test.com
user123
```

---

## 🎯 Success Criteria

Semua ini harus bekerja TANPA ERROR:

- [ ] ✅ Admin login → langsung /admin (tidak mampir homepage)
- [ ] ✅ Admin klik logo → redirect kembali ke /admin
- [ ] ✅ B2B login → homepage dengan badge + discount
- [ ] ✅ B2C login → homepage standard tanpa B2B features
- [ ] ✅ SignOut smooth dengan "Signing out..." message
- [ ] ✅ Button disabled saat signOut (tidak bisa spam click)
- [ ] ✅ Tidak ada error di console
- [ ] ✅ Loading states muncul di semua transisi
- [ ] ✅ Smooth transitions tanpa flash content

---

## 🐛 Kalau Masih Ada Error

### Error: "getUserCart is not a function"

```bash
✅ SUDAH FIXED - CartViewModel sudah ada method getUserCart
```

### Error: "findAll is not a function"

```bash
✅ SUDAH FIXED - VoucherModel sudah ada method findAll
```

### Error: "params must be awaited"

```bash
✅ SUDAH FIXED - Product detail API sudah await params
```

### Error saat SignOut

```bash
✅ SUDAH FIXED - handleSignOut dengan async/await
```

### Admin tidak redirect

```bash
✅ SUDAH FIXED - LoginForm fetch session dan check role
✅ SUDAH FIXED - Homepage useEffect auto-redirect admin
```

---

## 📱 Test di Mobile View

Jangan lupa test mobile menu:

1. Resize browser jadi kecil (atau F12 → Toggle device toolbar)
2. Klik hamburger menu (3 garis)
3. Test SignOut dari mobile menu
4. Perhatikan:
   - ✅ Menu muncul smooth
   - ✅ "Signing out..." muncul
   - ✅ Menu close otomatis
   - ✅ Redirect ke guest homepage

---

## ✨ Expected Behavior Summary

| User Type | Login →          | Homepage Visit →    | SignOut →   |
| --------- | ---------------- | ------------------- | ----------- |
| **ADMIN** | `/admin`         | `/admin` (redirect) | `/` (guest) |
| **B2B**   | `/` (with badge) | `/` (with badge)    | `/` (guest) |
| **B2C**   | `/` (standard)   | `/` (standard)      | `/` (guest) |
| **GUEST** | N/A              | `/` (landing)       | N/A         |

---

## 🚀 Server Command

Kalau server belum jalan:

```bash
cd e:\Skripsi\motiv
npm run dev
```

Lalu buka: **http://localhost:3000**

---

**Selamat testing! Semua seharusnya smooth sekarang! 🎉**

Kalau masih ada error, screenshot dan kirim ke sini!
