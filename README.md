# MOTIV Coffee E-Commerce

Full-stack e-commerce platform untuk penjualan kopi premium dengan fitur B2C (Business to Consumer) dan B2B (Business to Business).

**Tech Stack**: Next.js 16, React 19, PostgreSQL (Supabase), Prisma ORM, NextAuth.js, Midtrans Payment Gateway

**Production**: https://motivcompany.vercel.app

## 🚀 Features

### Customer Features (B2C)

- ✅ **Authentication**: Register, Login, Session Management (NextAuth.js)
- ✅ **Product Browsing**: Catalog with categories, filters, search
- ✅ **Product Details**: Multiple variants (size, grind type), stock info
- ✅ **Shopping Cart**: Add/remove items, quantity updates, real-time pricing
- ✅ **Checkout**: Multiple shipping addresses, shipping calculator (RajaOngkir)
- ✅ **Payment**: Midtrans Snap integration (10+ payment methods)
- ✅ **Order Tracking**: Order history, status timeline, invoice download
- ✅ **Vouchers**: Browse and apply discount vouchers at checkout
- ✅ **B2B Registration**: Apply for business account with custom discounts

### B2B Features

- ✅ **B2B Account**: Business account registration and approval workflow
- ✅ **Custom Pricing**: Automatic discount (0-100%) on all products
- ✅ **B2B Dashboard**: Track application status, view discount info
- ✅ **Discounted Shopping**: See B2B prices throughout the site
- ✅ **Combined Discounts**: B2B discount + voucher application

### Admin Features

- ✅ **Dashboard**: Sales statistics, recent orders, revenue overview
- ✅ **Order Management**: View, filter, update order status
- ✅ **Product CRUD**: Create, edit, delete products with variants
- ✅ **Stock Management**: Track inventory, low stock alerts
- ✅ **Voucher Management**: Create and manage discount vouchers
- ✅ **B2B Management**: Approve/reject applications, manage discounts
- ✅ **User Management**: View B2B users, update individual discounts
- ✅ **Statistics**: Order stats, voucher usage, B2B analytics

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Language**: JavaScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **State Management**: React Context API, Zustand

## 🚀 Features

### Customer (B2C)
- Authentication & session management
- Product catalog with categories & search
- Shopping cart with real-time pricing
- Checkout with multiple shipping addresses
- Payment integration (Midtrans Snap)
- Order tracking & history
- Voucher system

### Business (B2B)
- B2B account registration & approval
- Custom discount pricing (0-100%)
- Combined discounts (B2B + voucher)
- Business dashboard

### Admin
- Dashboard with sales analytics
- Product management (CRUD)
- Order management & tracking
- Voucher management
- B2B account approval
- Customer management
- Story/content management

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: NextAuth.js
- **Payment**: Midtrans Snap API
- **Deployment**: Vercel

---

## 📁 Project Structure

```
src/
├── app/                 # Next.js pages & API routes
├── components/          # React components
├── models/              # Database operations (Prisma)
├── viewmodels/          # Business logic layer
├── lib/                 # Utilities & configs
└── store/               # State management (Zustand)

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Database migrations
```

---

## 🚦 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (atau Supabase account)

### Installation

1. **Clone & Install**
```bash
git clone <repository-url>
cd motiv
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

**Lihat**: `INSTALLATION.md` untuk setup lengkap

3. **Database Setup**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed  # Optional: seed data
```

4. **Run Development**
```bash
npm run dev
```

Open http://localhost:3000

---

## 🌐 Deployment

**Production URL**: https://motivcompany.vercel.app

**Lihat**: `DEPLOYMENT_GUIDE.md` untuk deployment ke Vercel

---

## 📚 Documentation

- **[INSTALLATION.md](INSTALLATION.md)** - Setup development environment
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Deploy to production (Vercel)
- **[POSTGRESQL_SETUP_GUIDE.md](POSTGRESQL_SETUP_GUIDE.md)** - Database setup (Supabase)
- **[PRISMA_ENGINE_FIX.md](PRISMA_ENGINE_FIX.md)** - Prisma deployment troubleshooting

---


## � Default Accounts

### Admin
- Email: `admin@motiv.com`
- Password: `admin123`

### Test Customer
- Email: `customer@test.com`
- Password: `customer123`

---

## 📝 License

This project is for educational purposes.

---

**Built with ❤️ using Next.js 16 & React 19**

- 3 use cases untuk Pelanggan B2B

Detail lengkap use case scenarios ada di dokumentasi skripsi.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

This project is licensed under the MIT License.

## 📧 Contact

For questions or support, please contact: [your-email@example.com]

---

**Developed with ☕ for Coffee Lovers**
