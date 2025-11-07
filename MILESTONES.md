# MOTIV Coffee E-Commerce - Development Milestones

## Project Overview

Aplikasi e-commerce kopi dengan fitur B2B dan B2C menggunakan Next.js, JavaScript, dan arsitektur MVVM.

---

## Milestone 1: Authentication System (Prioritas Tertinggi) ✅

**Estimasi: 3-5 hari**  
**Status**: ✅ **COMPLETE**

### Use Cases Covered:

- M-F-2-001: Registrasi Akun
- M-F-2-002: Login

### Fitur:

- [x] Setup project structure (Models, ViewModels, Views)
- [x] Install dependencies (NextAuth, Prisma, bcryptjs, dll)
- [x] Database schema design
- [x] User Model
- [x] Auth ViewModel
- [x] NextAuth configuration
- [x] API Routes: `/api/auth/register`, `/api/auth/login`
- [x] Login page UI
- [x] Register page UI
- [x] Protected route middleware

### Files to Create:

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.js
│   │       ├── register/route.js
│   │       └── login/route.js
│   ├── login/page.js
│   └── register/page.js
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Input.jsx
│       └── Alert.jsx
├── lib/
│   └── auth.js (NextAuth config)
└── middleware.js
```

---

## Milestone 2: Product Management (Customer View) ✅

**Estimasi: 4-6 hari**  
**Status**: ✅ **COMPLETE**

### Use Cases Covered:

- M-F-2-003: Melihat Katalog
- M-F-2-004: Melihat Detail Produk
- M-F-3-012: Melihat Harga Khusus (B2B)

### Fitur:

- [x] Product Model
- [x] ProductVariant Model
- [x] Product ViewModel
- [x] API Routes untuk product listing dan detail
- [x] Product catalog page dengan filter dan search
- [x] Product detail page dengan varian
- [x] Harga khusus untuk B2B users
- [x] Image gallery component
- [x] Filter dan sorting

### Files to Create:

```
src/
├── app/
│   ├── api/
│   │   └── products/
│   │       ├── route.js
│   │       └── [id]/route.js
│   ├── products/
│   │   ├── page.js
│   │   └── [id]/page.js
│   └── shop/page.js
├── components/
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── ProductFilter.jsx
│   │   └── ProductVariantSelector.jsx
│   └── layout/
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── Navbar.jsx
└── hooks/
    └── useProducts.js
```

---

## Milestone 3: Shopping Cart System ✅

**Estimasi: 3-4 hari**  
**Status**: ✅ **COMPLETE**

### Use Cases Covered:

- M-F-2-005: Menambah ke Keranjang
- M-F-2-006: Melihat Keranjang Belanja
- M-F-2-007: Mengubah Jumlah Produk
- M-F-2-008: Menghapus Produk dari Keranjang

### Fitur:

- [x] Cart Model
- [x] Cart ViewModel
- [x] API Routes untuk cart operations (5 endpoints)
- [x] Cart page dengan list items
- [x] Add to cart functionality
- [x] Update quantity dengan stock validation
- [x] Remove item individual dan clear cart
- [x] Cart badge di navbar dengan counter
- [x] Cart state management (Zustand)
- [x] B2B pricing support di cart

### Files to Create:

```
src/
├── app/
│   ├── api/
│   │   └── cart/
│   │       ├── route.js
│   │       ├── add/route.js
│   │       ├── update/route.js
│   │       └── remove/route.js
│   └── cart/page.js
├── components/
│   └── cart/
│       ├── CartItem.jsx
│       ├── CartList.jsx
│       └── CartSummary.jsx
└── store/
    └── cartStore.js (Zustand)
```

---

## Milestone 4: Checkout & Shipping

**Estimasi: 5-7 hari**

### Use Cases Covered:

- M-F-2-006: Melakukan Checkout
- M-F-2-008: Memilih Opsi Pengiriman
- M-F-3-013: Meminta Pengiriman Kustom (B2B)

### Fitur:

- [ ] Checkout page multi-step
- [ ] Shipping address form
- [ ] RajaOngkir API integration
- [ ] Courier selection
- [ ] Custom shipping untuk B2B
- [ ] Order summary
- [ ] Shipping cost calculation

### Files to Create:

```
src/
├── app/
│   ├── api/
│   │   ├── shipping/
│   │   │   ├── cost/route.js
│   │   │   └── couriers/route.js
│   │   └── checkout/route.js
│   └── checkout/page.js
├── components/
│   └── checkout/
│       ├── CheckoutSteps.jsx
│       ├── ShippingForm.jsx
│       ├── CourierSelection.jsx
│       ├── CustomShippingRequest.jsx (B2B)
│       └── OrderSummary.jsx
└── lib/
    └── rajaongkir.js
```

---

## Milestone 5: Payment Integration

**Estimasi: 4-6 hari**

### Use Cases Covered:

- M-F-2-007: Melakukan Pembayaran

### Fitur:

- [ ] Midtrans integration
- [ ] Payment gateway selection
- [ ] Payment confirmation webhook
- [ ] Payment status tracking
- [ ] Payment success/failed pages
- [ ] Order creation after payment

### Files to Create:

```
src/
├── app/
│   ├── api/
│   │   └── payment/
│   │       ├── create/route.js
│   │       ├── notification/route.js (webhook)
│   │       └── status/[orderId]/route.js
│   └── payment/
│       ├── [orderId]/page.js
│       ├── success/page.js
│       └── failed/page.js
├── components/
│   └── payment/
│       ├── PaymentMethod.jsx
│       └── PaymentStatus.jsx
└── lib/
    └── midtrans.js
```

---

## Milestone 6: Order Management

**Estimasi: 4-5 hari**

### Use Cases Covered:

- M-F-2-009: Melihat Riwayat Pesanan
- M-F-1-005: Melihat Daftar Pesanan (Admin)
- M-F-1-006: Mengelola Status Pesanan (Admin)

### Fitur:

- [x] Order Model
- [x] Order ViewModel
- [ ] API Routes untuk order management
- [ ] Customer order history page
- [ ] Order detail page
- [ ] Order tracking
- [ ] Admin order list
- [ ] Update order status (Admin)
- [ ] Add tracking number (Admin)

### Files to Create:

```
src/
├── app/
│   ├── api/
│   │   └── orders/
│   │       ├── route.js
│   │       ├── [id]/route.js
│   │       └── [id]/status/route.js (Admin)
│   ├── orders/
│   │   ├── page.js
│   │   └── [id]/page.js
│   └── admin/
│       └── orders/
│           ├── page.js
│           └── [id]/page.js
└── components/
    └── orders/
        ├── OrderCard.jsx
        ├── OrderDetail.jsx
        ├── OrderStatusBadge.jsx
        ├── OrderTracker.jsx
        └── OrderStatusUpdate.jsx (Admin)
```

---

## Milestone 7: Admin Dashboard & Product CRUD

**Estimasi: 5-7 hari**

### Use Cases Covered:

- M-F-1-001: Melihat Dashboard
- M-F-1-002: Menambah Produk
- M-F-1-003: Mengubah Produk
- M-F-1-004: Menghapus Produk

### Fitur:

- [ ] Admin dashboard dengan statistik
- [ ] Product CRUD operations
- [ ] Product list management
- [ ] Product form dengan varian
- [ ] Image upload (Cloudinary)
- [ ] Stock management
- [ ] Sales statistics

### Files to Create:

```
src/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── dashboard/route.js
│   │   │   └── products/
│   │   │       ├── route.js
│   │   │       ├── [id]/route.js
│   │   │       └── upload/route.js
│   └── admin/
│       ├── page.js (Dashboard)
│       ├── layout.js
│       └── products/
│           ├── page.js
│           ├── new/page.js
│           └── [id]/edit/page.js
├── components/
│   └── admin/
│       ├── Dashboard/
│       │   ├── StatCard.jsx
│       │   ├── RecentOrders.jsx
│       │   └── SalesChart.jsx
│       ├── Products/
│       │   ├── ProductTable.jsx
│       │   ├── ProductForm.jsx
│       │   ├── VariantManager.jsx
│       │   └── ImageUpload.jsx
│       └── Sidebar.jsx
└── lib/
    └── cloudinary.js
```

---

## Milestone 8: Voucher System

**Estimasi: 3-4 hari**

### Use Cases Covered:

- M-F-1-010: Mengelola Voucher (Admin)
- M-F-2-010: Menggunakan Voucher

### Fitur:

- [x] Voucher Model
- [ ] Voucher ViewModel
- [ ] Admin voucher CRUD
- [ ] Voucher validation
- [ ] Apply voucher di checkout
- [ ] Voucher usage tracking
- [ ] Active/inactive status

### Files to Create:

```
src/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── vouchers/
│   │   │       ├── route.js
│   │   │       └── [id]/route.js
│   │   └── vouchers/
│   │       ├── validate/route.js
│   │       └── apply/route.js
│   └── admin/
│       └── vouchers/
│           ├── page.js
│           └── new/page.js
├── components/
│   └── vouchers/
│       ├── VoucherTable.jsx (Admin)
│       ├── VoucherForm.jsx (Admin)
│       └── VoucherInput.jsx (Checkout)
└── viewmodels/
    └── VoucherViewModel.js
```

---

## Milestone 9: B2B Features

**Estimasi: 4-6 hari**

### Use Cases Covered:

- M-F-3-011: Mengajukan Akun B2B
- M-F-1-007: Melihat Pengajuan Akun B2B (Admin)
- M-F-1-008: Memverifikasi Akun B2B (Admin)
- M-F-1-009: Mengelola Diskon B2B (Admin)

### Fitur:

- [x] B2BRequest Model
- [ ] B2B ViewModel
- [ ] B2B registration request form
- [ ] Admin B2B requests management
- [ ] Approve/reject B2B requests
- [ ] Set B2B discount per user
- [ ] B2B status badge
- [ ] Custom shipping for B2B

### Files to Create:

```
src/
├── app/
│   ├── api/
│   │   ├── b2b/
│   │   │   ├── request/route.js
│   │   │   └── status/route.js
│   │   └── admin/
│   │       └── b2b/
│   │           ├── route.js
│   │           ├── [id]/approve/route.js
│   │           ├── [id]/reject/route.js
│   │           └── [id]/discount/route.js
│   ├── profile/
│   │   └── upgrade-b2b/page.js
│   └── admin/
│       └── b2b/
│           ├── page.js
│           └── [id]/page.js
├── components/
│   └── b2b/
│       ├── B2BRequestForm.jsx
│       ├── B2BStatusBadge.jsx
│       ├── B2BRequestTable.jsx (Admin)
│       └── B2BDiscountManager.jsx (Admin)
└── viewmodels/
    └── B2BViewModel.js
```

---

## Milestone 10: Final Polish & Testing

**Estimasi: 3-5 hari**

### Fitur:

- [ ] User profile page
- [ ] Notifications system
- [ ] Email notifications (optional)
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Error handling improvement
- [ ] Loading states
- [ ] Responsive design polish
- [ ] Testing (unit & integration)
- [ ] Documentation

### Files to Create:

```
src/
├── app/
│   ├── api/
│   │   └── profile/route.js
│   └── profile/page.js
├── components/
│   ├── profile/
│   │   ├── ProfileForm.jsx
│   │   └── AddressManager.jsx
│   └── ui/
│       ├── Loading.jsx
│       ├── ErrorBoundary.jsx
│       └── Toast.jsx
└── lib/
    └── notifications.js
```

---

## Technology Stack

### Frontend:

- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Forms**: React Hook Form (optional)
- **UI Components**: Custom + React Icons
- **Notifications**: React Hot Toast

### Backend:

- **API**: Next.js API Routes
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **File Upload**: Cloudinary
- **Payment**: Midtrans
- **Shipping**: RajaOngkir API

### Architecture:

- **MVVM Pattern**:
  - **Model**: Data layer (`src/models/`)
  - **ViewModel**: Business logic layer (`src/viewmodels/`)
  - **View**: UI layer (`src/components/` & `src/app/`)

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Database (Optional)

```bash
node prisma/seed.js
```

### 5. Run Development Server

```bash
npm run dev
```

---

## Project Structure

```
motiv/
├── prisma/
│   └── schema.prisma
├── public/
│   └── images/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── admin/             # Admin Pages
│   │   ├── products/          # Product Pages
│   │   ├── cart/              # Cart Page
│   │   ├── checkout/          # Checkout Page
│   │   ├── orders/            # Orders Pages
│   │   ├── profile/           # Profile Page
│   │   ├── login/             # Login Page
│   │   ├── register/          # Register Page
│   │   ├── layout.js          # Root Layout
│   │   ├── page.js            # Home Page
│   │   └── globals.css        # Global Styles
│   ├── components/            # React Components (Views)
│   │   ├── auth/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── admin/
│   │   ├── b2b/
│   │   ├── vouchers/
│   │   ├── layout/
│   │   └── ui/
│   ├── models/                # Data Models
│   │   ├── UserModel.js
│   │   ├── ProductModel.js
│   │   ├── ProductVariantModel.js
│   │   ├── CartModel.js
│   │   ├── OrderModel.js
│   │   ├── VoucherModel.js
│   │   └── B2BRequestModel.js
│   ├── viewmodels/            # Business Logic
│   │   ├── AuthViewModel.js
│   │   ├── ProductViewModel.js
│   │   ├── CartViewModel.js
│   │   ├── OrderViewModel.js
│   │   ├── VoucherViewModel.js
│   │   └── B2BViewModel.js
│   ├── lib/                   # Utilities & Configs
│   │   ├── prisma.js
│   │   ├── auth.js
│   │   ├── cloudinary.js
│   │   ├── midtrans.js
│   │   └── rajaongkir.js
│   ├── hooks/                 # Custom React Hooks
│   │   └── useProducts.js
│   ├── store/                 # Zustand Store
│   │   └── cartStore.js
│   └── middleware.js          # Next.js Middleware
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
└── tailwind.config.mjs
```

---

## Progress Tracking

- ✅ **Completed**: Task finished
- 🚧 **In Progress**: Currently working
- ⏳ **Pending**: Not started yet
- ❌ **Blocked**: Waiting for dependency

### Current Status:

- ✅ Project structure setup
- ✅ Database schema design
- ✅ Models creation
- ✅ ViewModels creation (partial)
- ⏳ NextAuth configuration
- ⏳ API Routes
- ⏳ UI Components

---

## Notes

1. **Development Order**: Ikuti milestone secara berurutan untuk dependency yang tepat
2. **Testing**: Test setiap fitur sebelum lanjut ke milestone berikutnya
3. **Git Commits**: Commit setelah selesai setiap fitur untuk tracking
4. **Code Review**: Review code sebelum merge ke main branch
5. **Documentation**: Update docs seiring development

---

## Estimasi Total: 35-50 hari kerja

**Target Completion**: 7-10 minggu (part-time development)
