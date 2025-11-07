# MOTIV Coffee E-Commerce

> 🎉 **PROJECT STATUS: COMPLETE** ✅  
> All 9 Milestones Finished | Production-Ready | Fully Documented

Aplikasi e-commerce full-stack untuk penjualan kopi premium dengan fitur lengkap B2C (Business to Consumer) dan B2B (Business to Business). Dibangun menggunakan Next.js 16, PostgreSQL, Prisma ORM, dan arsitektur MVVM.

## 🏆 Project Completion

**Development Status**: ✅ **100% COMPLETE**

| Milestone                | Status      | Documentation                   |
| ------------------------ | ----------- | ------------------------------- |
| 1. Authentication System | ✅ Complete | [View](MILESTONE_1_COMPLETE.md) |
| 2. Product Management    | ✅ Complete | [View](MILESTONE_2_COMPLETE.md) |
| 3. Shopping Cart         | ✅ Complete | [View](MILESTONE_3_COMPLETE.md) |
| 4. Checkout & Shipping   | ✅ Complete | [View](MILESTONE_4_COMPLETE.md) |
| 5. Payment Integration   | ✅ Complete | [View](MILESTONE_5_COMPLETE.md) |
| 6. Order Management      | ✅ Complete | [View](MILESTONE_6_COMPLETE.md) |
| 7. Admin Dashboard       | ✅ Complete | [View](MILESTONE_7_COMPLETE.md) |
| 8. Voucher System        | ✅ Complete | [View](MILESTONE_8_COMPLETE.md) |
| 9. B2B Features          | ✅ Complete | [View](MILESTONE_9_COMPLETE.md) |

📚 **[View Complete Project Summary](PROJECT_COMPLETE.md)**

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
- **Payment Gateway**: Midtrans Snap API
- **Shipping API**: RajaOngkir
- **Architecture**: MVVM (Model-View-ViewModel)

## 📁 Project Structure (MVVM Architecture)

```
src/
├── models/              # Data Layer - Database operations
├── viewmodels/          # Business Logic Layer
├── components/          # View Layer - UI Components
├── app/                 # Next.js Pages & API Routes
├── lib/                 # Utilities & Configurations
├── hooks/               # Custom React Hooks
└── store/               # State Management (Zustand)
```

## 🏗️ Architecture: MVVM Pattern

### Model (Data Layer)

Berisi class yang mengelola operasi database menggunakan Prisma:

- `UserModel.js` - User operations
- `ProductModel.js` - Product operations
- `CartModel.js` - Shopping cart operations
- `OrderModel.js` - Order operations
- `VoucherModel.js` - Voucher operations
- `B2BRequestModel.js` - B2B request operations

### ViewModel (Business Logic Layer)

Berisi logic bisnis dan validasi:

- `AuthViewModel.js` - Authentication logic
- `ProductViewModel.js` - Product business logic
- `CartViewModel.js` - Cart business logic
- `OrderViewModel.js` - Order processing logic
- `VoucherViewModel.js` - Voucher validation logic
- `B2BViewModel.js` - B2B features logic

### View (Presentation Layer)

Berisi React components untuk UI:

- Components organized by features
- Reusable UI components
- Page components using Next.js App Router

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd motiv
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env
```

Edit `.env` file and fill in your credentials:

- MongoDB connection string
- NextAuth secret
- Midtrans API keys
- RajaOngkir API key
- Cloudinary credentials

4. **Setup database**

```bash
npx prisma generate
npx prisma db push
```

5. **Run development server**

```bash
npm run dev
```

6. **Open browser**

```
http://localhost:3000
```

## 📋 Development Milestones

See [MILESTONES.md](./MILESTONES.md) for detailed development roadmap.

### Progress Overview:

1. ✅ **Milestone 1**: Authentication System
2. ⏳ **Milestone 2**: Product Management (Customer View)
3. ⏳ **Milestone 3**: Shopping Cart System
4. ⏳ **Milestone 4**: Checkout & Shipping
5. ⏳ **Milestone 5**: Payment Integration
6. ⏳ **Milestone 6**: Order Management
7. ⏳ **Milestone 7**: Admin Dashboard & Product CRUD
8. ⏳ **Milestone 8**: Voucher System
9. ⏳ **Milestone 9**: B2B Features
10. ⏳ **Milestone 10**: Final Polish & Testing

## 📚 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/session` - Get current session

### Products

- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get product detail
- `POST /api/admin/products` - Create product (Admin)
- `PUT /api/admin/products/[id]` - Update product (Admin)
- `DELETE /api/admin/products/[id]` - Delete product (Admin)

### Cart

- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove cart item

### Orders

- `GET /api/orders` - Get user orders
- `GET /api/orders/[id]` - Get order detail
- `POST /api/orders` - Create order
- `PUT /api/admin/orders/[id]/status` - Update order status (Admin)

### Vouchers

- `POST /api/vouchers/validate` - Validate voucher code
- `GET /api/admin/vouchers` - Get all vouchers (Admin)
- `POST /api/admin/vouchers` - Create voucher (Admin)

### B2B

- `POST /api/b2b/request` - Submit B2B request
- `GET /api/admin/b2b` - Get B2B requests (Admin)
- `POST /api/admin/b2b/[id]/approve` - Approve B2B request (Admin)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Build for production

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Deploy to Vercel

```bash
vercel deploy
```

## 🔐 Environment Variables

See `.env.example` for required environment variables:

```env
DATABASE_URL=                  # MongoDB connection string
NEXTAUTH_SECRET=              # NextAuth secret key
NEXTAUTH_URL=                 # App URL
MIDTRANS_SERVER_KEY=          # Midtrans server key
MIDTRANS_CLIENT_KEY=          # Midtrans client key
RAJAONGKIR_API_KEY=          # RajaOngkir API key
CLOUDINARY_CLOUD_NAME=        # Cloudinary cloud name
CLOUDINARY_API_KEY=           # Cloudinary API key
CLOUDINARY_API_SECRET=        # Cloudinary API secret
```

## 👥 User Roles

1. **B2C Customer** - Regular customer dengan harga normal
2. **B2B Customer** - Business customer dengan harga khusus dan fitur tambahan
3. **Admin** - Full access untuk manajemen sistem

## 📝 Use Case Coverage

Aplikasi ini mengimplementasikan 23 use case scenarios:

- 10 use cases untuk Admin
- 10 use cases untuk Pelanggan B2C
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
