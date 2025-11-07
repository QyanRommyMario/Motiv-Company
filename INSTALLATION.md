# MOTIV Coffee - Installation Guide

## Prerequisites

Sebelum memulai, pastikan Anda memiliki:

1. **Node.js** (versi 18 atau lebih tinggi)

   - Download: https://nodejs.org/
   - Verifikasi: `node --version`

2. **npm** (biasanya sudah terinstall dengan Node.js)

   - Verifikasi: `npm --version`

3. **MongoDB**

   - Option 1: MongoDB Atlas (Cloud) - Recommended
     - Sign up: https://www.mongodb.com/cloud/atlas
   - Option 2: MongoDB Local
     - Download: https://www.mongodb.com/try/download/community

4. **Git**
   - Download: https://git-scm.com/
   - Verifikasi: `git --version`

## Step-by-Step Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd motiv
```

### 2. Install Dependencies

```bash
npm install
```

Ini akan menginstall semua package yang diperlukan termasuk:

- Next.js 16
- React 19
- Prisma
- NextAuth
- Tailwind CSS
- Dan dependencies lainnya

### 3. Setup Environment Variables

Buat file `.env` di root project:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# atau manual: copy .env.example menjadi .env
```

Edit file `.env` dan isi dengan kredensial Anda:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/motiv-coffee"

# NextAuth
NEXTAUTH_SECRET="generate-dengan-command-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Payment Gateway (Midtrans)
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_IS_PRODUCTION=false

# Shipping API (RajaOngkir)
RAJAONGKIR_API_KEY="your-rajaongkir-api-key"

# Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

#### Cara Mendapatkan API Keys:

**MongoDB Atlas (DATABASE_URL):**

1. Buat akun di https://www.mongodb.com/cloud/atlas
2. Buat cluster baru (pilih free tier M0)
3. Buat database user dengan username dan password
4. Whitelist IP address (0.0.0.0/0 untuk development)
5. Copy connection string

**NextAuth Secret:**

```bash
# Generate random string
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Midtrans:**

1. Sign up di https://midtrans.com/
2. Buat akun merchant
3. Copy Server Key dan Client Key dari dashboard
4. Gunakan sandbox mode untuk testing

**RajaOngkir:**

1. Sign up di https://rajaongkir.com/
2. Pilih paket (Starter gratis untuk testing)
3. Copy API Key dari dashboard

**Cloudinary:**

1. Sign up di https://cloudinary.com/
2. Copy Cloud Name, API Key, dan API Secret dari dashboard

### 4. Setup Database dengan Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database (untuk development)
npx prisma db push

# Atau gunakan migrations (untuk production)
npx prisma migrate dev --name init
```

### 5. (Optional) Seed Database dengan Data Sample

Buat file `prisma/seed.js`:

```javascript
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@motiv.com" },
    update: {},
    create: {
      email: "admin@motiv.com",
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin created:", admin);

  // Create sample products
  const product1 = await prisma.product.create({
    data: {
      name: "Southern Weather",
      description:
        "Milk chocolate | Plum | Candied walnuts | Juicy & citrus finish. Roast level: Light",
      images: ["/images/southern-weather.jpg"],
      category: "Coffee Beans",
      variants: {
        create: [
          {
            name: "200g",
            price: 85000,
            stock: 50,
            sku: "SW-200G",
          },
          {
            name: "500g",
            price: 200000,
            stock: 30,
            sku: "SW-500G",
          },
          {
            name: "1kg",
            price: 380000,
            stock: 20,
            sku: "SW-1KG",
          },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Geometry",
      description:
        "Berries | Stone fruit | Earl grey | Honeysuckle | Round. Roast level: Expressive light",
      images: ["/images/geometry.jpg"],
      category: "Coffee Beans",
      variants: {
        create: [
          {
            name: "200g",
            price: 90000,
            stock: 40,
            sku: "GEO-200G",
          },
          {
            name: "500g",
            price: 215000,
            stock: 25,
            sku: "GEO-500G",
          },
        ],
      },
    },
  });

  console.log("Products created:", { product1, product2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Tambahkan script di `package.json`:

```json
{
  "scripts": {
    "seed": "node prisma/seed.js"
  },
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

Jalankan seed:

```bash
npm run seed
```

### 6. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## Verifikasi Installation

### 1. Check Database Connection

Buka Prisma Studio untuk melihat database:

```bash
npx prisma studio
```

Akan membuka browser di `http://localhost:5555`

### 2. Test Login

Login dengan akun admin yang dibuat saat seeding:

- Email: `admin@motiv.com`
- Password: `admin123`

### 3. Check Console

Pastikan tidak ada error di console browser dan terminal.

## Troubleshooting

### Error: Cannot find module 'bcryptjs'

```bash
npm install bcryptjs
```

### Error: Prisma Client is not generated

```bash
npx prisma generate
```

### Error: Database connection failed

- Pastikan MongoDB berjalan (jika local)
- Cek connection string di `.env`
- Pastikan IP address sudah di-whitelist (jika MongoDB Atlas)

### Error: Port 3000 already in use

```bash
# Gunakan port lain
PORT=3001 npm run dev
```

### Error: NextAuth configuration error

- Pastikan `NEXTAUTH_SECRET` sudah diisi
- Pastikan `NEXTAUTH_URL` sesuai dengan URL development

## Development Workflow

1. **Buat fitur baru**:

   - Buat Model di `src/models/`
   - Buat ViewModel di `src/viewmodels/`
   - Buat Component di `src/components/`
   - Buat API route di `src/app/api/`
   - Buat page di `src/app/`

2. **Test fitur**:

   - Manual testing di browser
   - Check console untuk errors
   - Test dengan different user roles

3. **Commit changes**:
   ```bash
   git add .
   git commit -m "Add: feature description"
   git push
   ```

## Next Steps

Setelah installation berhasil, lanjutkan ke development milestones:

1. ✅ Authentication System (Login/Register)
2. Product Catalog & Detail
3. Shopping Cart
4. Checkout & Shipping
5. Payment Integration
6. Order Management
7. Admin Dashboard
8. Voucher System
9. B2B Features

Lihat [MILESTONES.md](./MILESTONES.md) untuk detail lengkap.

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)

## Need Help?

Jika mengalami masalah, check:

1. Terminal untuk error messages
2. Browser console untuk client-side errors
3. `.next/` folder - try deleting and rebuild
4. `node_modules/` - try `npm install` again

## Support

Untuk bantuan lebih lanjut, silakan buat issue di repository atau hubungi developer.

---

**Happy Coding! ☕**
