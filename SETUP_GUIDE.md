# 🚀 Quick Start Guide - Setup & Testing

## ⚠️ PENTING: Setup MongoDB Terlebih Dahulu!

Sebelum menjalankan aplikasi, Anda **HARUS** setup MongoDB. Pilih salah satu opsi:

---

## Option 1: MongoDB Atlas (Cloud - RECOMMENDED) ☁️

### Langkah-langkah:

1. **Buat Account di MongoDB Atlas**

   - Kunjungi: https://www.mongodb.com/cloud/atlas/register
   - Sign up gratis

2. **Create Free Cluster**

   - Pilih "Create a FREE cluster"
   - Pilih region terdekat (Singapore/Jakarta)
   - Cluster Name: `motiv-coffee`

3. **Setup Database Access**

   - Buat user database
   - Username: `motiv_user`
   - Password: (generate atau buat sendiri)
   - **SIMPAN credentials ini!**

4. **Setup Network Access**

   - Klik "Network Access"
   - Add IP: `0.0.0.0/0` (allow from anywhere - dev only)
   - Atau tambahkan IP Anda

5. **Get Connection String**

   - Klik "Connect" pada cluster
   - Pilih "Connect your application"
   - Copy connection string:

   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/motiv-coffee?retryWrites=true&w=majority
   ```

6. **Update .env File**
   - Buka `.env`
   - Replace `<username>` dan `<password>`
   - Save file

---

## Option 2: Local MongoDB 💻

### Windows:

1. **Download MongoDB**

   - https://www.mongodb.com/try/download/community
   - Pilih Windows installer

2. **Install MongoDB**

   - Run installer
   - Pilih "Complete" installation
   - Install as Windows Service ✅
   - Install MongoDB Compass (GUI) ✅

3. **Start MongoDB Service**

   ```powershell
   # Check if running
   Get-Service MongoDB

   # Start service
   net start MongoDB
   ```

4. **Verify Connection**

   - Open MongoDB Compass
   - Connect to: `mongodb://localhost:27017`

5. **Create Database**

   - Database name: `motiv-coffee`

6. **Update .env** (sudah benar untuk local)
   ```bash
   DATABASE_URL="mongodb://localhost:27017/motiv-coffee"
   ```

---

## Option 3: Docker MongoDB 🐳

```bash
# Pull & Run MongoDB
docker run -d -p 27017:27017 --name mongodb-motiv mongo:latest

# Check if running
docker ps

# Stop
docker stop mongodb-motiv

# Start again
docker start mongodb-motiv
```

---

## 📦 Setup Database Schema

Setelah MongoDB running:

```bash
# 1. Push schema ke database
npx prisma db push

# 2. Generate Prisma Client
npx prisma generate

# 3. Seed database dengan test data
npm run seed
```

### Test Data yang akan dibuat:

**Products** (5 produk):

- Arabica Premium Coffee
- Robusta Special
- Liberica Exotic
- Premium Coffee Blend
- Dark Roast Intense

**Users** (3 users):

1. **B2C Customer**

   - Email: `customer@test.com`
   - Password: `password123`
   - Role: B2C

2. **B2B Customer**

   - Email: `b2b@test.com`
   - Password: `password123`
   - Role: B2B
   - Discount: 15%

3. **Admin**
   - Email: `admin@test.com`
   - Password: `password123`
   - Role: ADMIN

**Vouchers** (3 vouchers):

- WELCOME10 (10% off, min 50k)
- B2B20 (20% off, B2B only)
- NEWUSER (15% off, first order)

---

## 🚀 Start Development Server

```bash
# Start server
npm run dev
```

Server akan berjalan di:

- Local: http://localhost:3000
- Network: http://192.168.1.13:3000

---

## 🧪 Testing Flow

### 1. Test Homepage

1. Buka http://localhost:3000
2. Pastikan homepage load tanpa error
3. Check navbar, buttons, links

### 2. Test Authentication

**Register:**

```
1. Klik "Daftar" atau buka /register
2. Isi form:
   - Name: Test User
   - Email: testuser@test.com
   - Password: password123
   - Confirm Password: password123
3. Submit
4. Should redirect to login
```

**Login:**

```
1. Buka /login
2. Use test credentials:
   - Email: customer@test.com
   - Password: password123
3. Submit
4. Should redirect to homepage
5. Navbar should show "Hi, Customer"
```

### 3. Test Products

**Browse Products:**

```
1. Klik "Products" di navbar
2. Should see product grid
3. Test filter by category
4. Test search
5. Click on product card
```

**Product Detail:**

```
1. Pilih product
2. Check variant selector
3. Select size & grind type
4. Adjust quantity
5. Click "Tambah ke Keranjang"
6. Should redirect to cart
```

### 4. Test Cart

**View Cart:**

```
1. Buka /cart
2. Should see added items
3. Check product info correct
4. Check price correct
```

**Update Cart:**

```
1. Increment/decrement quantity
2. Check subtotal updates
3. Try remove item
4. Try clear cart
```

### 5. Test B2B Features

**Login as B2B:**

```
1. Logout
2. Login: b2b@test.com / password123
3. Browse products
4. Should see blue "B2B Discount" badge
5. Add to cart
6. Check cart shows B2B pricing
```

---

## 🐛 Troubleshooting

### Server won't start

```bash
# Kill old process
taskkill /F /IM node.exe

# Restart
npm run dev
```

### MongoDB connection error

```
Error: No available servers
```

**Solution**: MongoDB belum running atau connection string salah

- Check MongoDB service running
- Verify DATABASE_URL di .env

### Prisma Client error

```
Error: PrismaClient is unable to be run in the browser
```

**Solution**: Regenerate client

```bash
npx prisma generate
```

### Port already in use

```bash
# Find process
netstat -ano | findstr :3000

# Kill it
taskkill /F /PID <PID>
```

### Module not found errors

```bash
# Reinstall dependencies
npm install --legacy-peer-deps
```

---

## ✅ Success Indicators

Aplikasi berjalan dengan baik jika:

- ✅ Server start tanpa error
- ✅ Homepage load successfully
- ✅ Can register/login
- ✅ Products display correctly
- ✅ Can add to cart
- ✅ Cart updates work
- ✅ No console errors

---

## 📞 Need Help?

### Check logs:

```bash
# Server logs
npm run dev

# Database logs (MongoDB Compass)
# Check Compass for connection status
```

### Common Issues:

1. **MongoDB not running** → Start MongoDB service
2. **Port conflict** → Kill old process
3. **Env variables** → Check .env file exists
4. **Dependencies** → Run `npm install --legacy-peer-deps`

---

## 🎯 Current Status

- ✅ Server configured and ready
- ✅ Dependencies installed
- ✅ Environment variables setup
- ✅ Middleware fixed
- ⏳ **MongoDB needs to be setup** ← YOU ARE HERE
- ⏳ Database needs to be seeded

**Next Step**: Setup MongoDB (pilih Option 1, 2, atau 3 di atas) 👆
