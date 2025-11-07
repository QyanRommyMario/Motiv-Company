# 🔐 LOGIN GUIDE - MOTIV Coffee

## 📱 Akses Login Page

Buka browser dan ke:

```
http://localhost:3001/login
```

---

## 👥 AKUN DEFAULT

### 🔴 ADMIN (Administrator)

```
Email:    admin@motiv.com
Password: admin123
```

**Dapat akses:**

- Dashboard Admin
- Kelola Produk
- Kelola Orders
- Kelola Vouchers
- Approve B2B Requests

---

### 🔵 B2C User (Customer Biasa)

```
Email:    user@test.com
Password: user123
```

**Dapat akses:**

- Browse Products (harga normal)
- Shopping Cart
- Checkout
- Order History
- Apply jadi B2B

---

### 🟢 B2B User (Wholesale)

```
Email:    b2b@test.com
Password: b2b123
```

**Dapat akses:**

- Semua fitur B2C
- **DISCOUNT 10%** otomatis
- Badge "B2B PARTNER"
- Harga coret + harga B2B

---

## 🎯 CARA MEMBEDAKAN ROLE

### Setelah Login:

**ADMIN:**

```
Navbar: [MOTIV] COFFEE OFFERS [ADMIN] 🛒
                                ^^^^^^
                          Menu ini muncul
```

**B2B:**

```
Dropdown ACCOUNT:
┌─────────────────────┐
│ B2B Test Company    │
│ b2b@test.com       │
│ [B2B PARTNER] ←←   │  Badge ini
└─────────────────────┘

Product Price:
Rp 180,000 ← B2B (bold)
Rp 200,000 ← Coret
```

**B2C:**

```
Dropdown ACCOUNT:
┌─────────────────────────┐
│ Test User               │
│ user@test.com          │
├─────────────────────────┤
│ Become B2B Partner ←←  │  Link ini
└─────────────────────────┘

Product Price:
Rp 200,000 ← Normal (tanpa discount)
```

---

## ⚡ QUICK TEST

1. **Test Admin:**

   ```
   1. Login: admin@motiv.com / admin123
   2. Cek navbar → ada menu "ADMIN"
   3. Klik "ADMIN" → masuk dashboard
   ```

2. **Test B2B:**

   ```
   1. Login: b2b@test.com / b2b123
   2. Buka /products
   3. Lihat harga → ada discount 10%
   4. Product card ada badge "-10% B2B"
   ```

3. **Test B2C:**
   ```
   1. Login: user@test.com / user123
   2. Buka /products
   3. Lihat harga → normal (tanpa discount)
   4. Dropdown → ada link "Become B2B Partner"
   ```

---

## 📝 REGISTER USER BARU

### B2C (Customer):

```
1. Buka /register
2. Isi form
3. Submit → auto login sebagai B2C
```

### B2B (Wholesale):

```
1. Login dulu sebagai B2C
2. Klik "Become B2B Partner"
3. Isi form business details
4. Submit → tunggu admin approve
```

---

## 🔧 TROUBLESHOOTING

**Invalid credentials:**

- Pastikan email benar
- Password: case-sensitive
- Coba copy-paste dari guide ini

**User not found:**

```bash
# Run seed database
npm run seed
```

**Discount tidak muncul:**

- Logout dulu
- Login ulang
- Hard refresh: Ctrl+Shift+R

---

**Quick Copy-Paste:**

```
ADMIN:  admin@motiv.com / admin123
B2C:    user@test.com   / user123
B2B:    b2b@test.com    / b2b123
```
