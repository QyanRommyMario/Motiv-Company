# 🚀 Quick Start Guide - MOTIV Coffee E-Commerce

Panduan cepat untuk memulai development aplikasi.

## 📦 Installation (5 menit)

```bash
# 1. Clone & Install
git clone <repository-url>
cd motiv
npm install

# 2. Setup Environment
copy .env.example .env
# Edit .env dan isi dengan kredensial Anda

# 3. Setup Database
npx prisma generate
npx prisma db push

# 4. Run Development Server
npm run dev
```

Buka http://localhost:3000

## 📝 What's Already Done

✅ **Project Structure**: Folder MVVM sudah dibuat  
✅ **Database Schema**: Prisma schema lengkap untuk semua entities  
✅ **Models**: 7 Model classes untuk data operations  
✅ **ViewModels**: 4 ViewModel classes untuk business logic  
✅ **Documentation**: MILESTONES.md, README.md, INSTALLATION.md

## 🎯 Next Steps (Your Development Path)

### Phase 1: Basic Setup (Hari 1-2)

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Test server
npm run dev
```

**Files to check:**

- ✅ `prisma/schema.prisma` - Database schema
- ✅ `src/models/` - All 7 models ready
- ✅ `src/viewmodels/` - 4 viewmodels ready
- ✅ `src/lib/prisma.js` - Prisma client configured

### Phase 2: Authentication (Hari 3-5) 🎯 START HERE

#### Step 1: Install NextAuth

```bash
npm install next-auth@^4.24.5
```

#### Step 2: Create NextAuth Config

Create `src/lib/auth.js`:

```javascript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthViewModel } from "@/viewmodels/AuthViewModel";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const result = await AuthViewModel.login(
          credentials.email,
          credentials.password
        );

        if (result.success) {
          return result.data;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.discount = user.discount;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.discount = token.discount;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

#### Step 3: Create API Routes

Create `src/app/api/auth/[...nextauth]/route.js`:

```javascript
export { GET, POST } from "@/lib/auth";
```

Create `src/app/api/auth/register/route.js`:

```javascript
import { NextResponse } from "next/server";
import { AuthViewModel } from "@/viewmodels/AuthViewModel";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await AuthViewModel.register(body);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

#### Step 4: Create Login Page

Create `src/app/login/page.js` - Use form to call `/api/auth/signin`

#### Step 5: Create Register Page

Create `src/app/register/page.js` - Use form to call `/api/auth/register`

#### Step 6: Test Authentication

- Register new user
- Login with credentials
- Check session in browser DevTools

### Phase 3: Product Catalog (Hari 6-10)

#### Files to create:

- `src/app/api/products/route.js` - GET all products
- `src/app/api/products/[id]/route.js` - GET product detail
- `src/app/products/page.js` - Product listing page
- `src/app/products/[id]/page.js` - Product detail page
- `src/components/products/ProductCard.jsx`
- `src/components/products/ProductGrid.jsx`
- `src/components/products/ProductDetail.jsx`

### Phase 4: Shopping Cart (Hari 11-14)

#### Files to create:

- `src/app/api/cart/route.js` - Cart operations
- `src/app/cart/page.js` - Cart page
- `src/components/cart/CartItem.jsx`
- `src/store/cartStore.js` - Zustand store for cart

### Phase 5: Continue with other milestones...

See [MILESTONES.md](./MILESTONES.md) for complete roadmap.

## 📁 Project Structure Overview

```
motiv/
├── prisma/
│   └── schema.prisma          ✅ Ready - Database schema
│
├── src/
│   ├── models/                ✅ Ready - 7 models
│   │   ├── UserModel.js
│   │   ├── ProductModel.js
│   │   ├── ProductVariantModel.js
│   │   ├── CartModel.js
│   │   ├── OrderModel.js
│   │   ├── VoucherModel.js
│   │   └── B2BRequestModel.js
│   │
│   ├── viewmodels/            ✅ Ready - 4 viewmodels
│   │   ├── AuthViewModel.js
│   │   ├── ProductViewModel.js
│   │   ├── CartViewModel.js
│   │   └── OrderViewModel.js
│   │
│   ├── components/            ⏳ To create
│   ├── app/                   ⏳ To create
│   ├── lib/                   ✅ prisma.js ready
│   ├── hooks/                 ⏳ To create
│   └── store/                 ⏳ To create
│
├── .env.example               ✅ Ready
├── MILESTONES.md             ✅ Ready - Complete roadmap
├── INSTALLATION.md           ✅ Ready - Setup guide
├── README.md                 ✅ Ready - Project overview
└── package.json              ✅ Updated with dependencies
```

## 🧰 Available Models & Methods

### UserModel

```javascript
UserModel.create(data);
UserModel.findByEmail(email);
UserModel.findById(id);
UserModel.verifyPassword(plain, hashed);
UserModel.update(id, data);
```

### ProductModel

```javascript
ProductModel.create(data);
ProductModel.getAll(options);
ProductModel.findById(id);
ProductModel.update(id, data);
ProductModel.delete(id);
```

### CartModel

```javascript
CartModel.getByUserId(userId);
CartModel.addItem(userId, productId, variantId, quantity);
CartModel.updateQuantity(cartItemId, quantity);
CartModel.removeItem(cartItemId);
CartModel.clearCart(userId);
```

### OrderModel

```javascript
OrderModel.create(data);
OrderModel.findById(id);
OrderModel.getByUserId(userId);
OrderModel.getAll(options);
OrderModel.updateStatus(id, status, trackingNumber);
OrderModel.getStatistics();
```

## 🎨 UI Components to Build

### Priority 1 (Auth & Product):

- [ ] LoginForm
- [ ] RegisterForm
- [ ] ProductCard
- [ ] ProductGrid
- [ ] ProductDetail
- [ ] Navbar with cart badge

### Priority 2 (Cart & Checkout):

- [ ] CartItem
- [ ] CartList
- [ ] CheckoutForm
- [ ] ShippingForm
- [ ] PaymentMethod

### Priority 3 (Admin):

- [ ] AdminSidebar
- [ ] Dashboard
- [ ] ProductForm
- [ ] OrderTable
- [ ] VoucherForm

## 💡 Development Tips

### 1. Test Each Feature Immediately

```bash
# After creating API route
# Test with browser or Postman
GET http://localhost:3000/api/products
```

### 2. Use Prisma Studio to View Data

```bash
npx prisma studio
# Opens at http://localhost:5555
```

### 3. Hot Reload

Next.js automatically reloads when you save files. Keep an eye on terminal for errors.

### 4. Console Logging

```javascript
console.log("Debug:", variable);
```

### 5. Error Handling

Always wrap async operations in try-catch and return proper error responses.

## 🐛 Common Issues & Solutions

### 1. Prisma Client Not Found

```bash
npx prisma generate
```

### 2. Database Connection Error

Check `.env` - DATABASE_URL should be correct

### 3. Module Not Found

```bash
npm install
```

### 4. Port Already in Use

```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 5. NextAuth Session Error

Make sure NEXTAUTH_SECRET is set in `.env`

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## ✅ Development Checklist

Use this to track your progress:

### Setup (Day 1-2)

- [ ] Clone repository
- [ ] Install dependencies
- [ ] Setup .env file
- [ ] Setup database
- [ ] Run development server
- [ ] Test Prisma connection

### Milestone 1: Authentication (Day 3-5)

- [ ] Install NextAuth
- [ ] Create auth config
- [ ] Create API routes
- [ ] Create login page
- [ ] Create register page
- [ ] Test authentication flow

### Milestone 2: Products (Day 6-10)

- [ ] Create product API routes
- [ ] Create product listing page
- [ ] Create product detail page
- [ ] Add search functionality
- [ ] Add category filter
- [ ] Test B2B pricing

### Continue with MILESTONES.md...

## 🎯 Your First Task

**Start with Authentication:**

1. Read `INSTALLATION.md` for setup
2. Install dependencies and setup database
3. Follow Phase 2 above to implement auth
4. Test login/register functionality
5. Move to next milestone

## 💪 You're Ready!

Semua fondasi sudah siap:

- ✅ Database schema
- ✅ Models for data operations
- ✅ ViewModels for business logic
- ✅ Project structure
- ✅ Documentation

Sekarang tinggal build UI components dan API routes mengikuti milestones!

**Good luck and happy coding! ☕**
