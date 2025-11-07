# Setup PostgreSQL untuk MOTIV Coffee

## Langkah 1: Install PostgreSQL

### Windows:

1. Download PostgreSQL dari https://www.postgresql.org/download/windows/
2. Jalankan installer
3. Ikuti wizard instalasi:
   - Port default: 5432
   - Set password untuk user `postgres` (ingat password ini!)
   - Pilih locale: Indonesian, Indonesia atau English, United States

### Atau gunakan Docker (Recommended):

```powershell
docker run --name motiv-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=motiv_coffee -p 5432:5432 -d postgres:15
```

## Langkah 2: Buat Database

### Cara 1: Menggunakan pgAdmin (GUI)

1. Buka pgAdmin (terinstall bersama PostgreSQL)
2. Login dengan password yang Anda set saat instalasi
3. Klik kanan pada "Databases" → "Create" → "Database"
4. Nama database: `motiv_coffee`
5. Owner: `postgres`
6. Klik Save

### Cara 2: Menggunakan psql (Command Line)

```powershell
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE motiv_coffee;

# Keluar
\q
```

### Cara 3: Menggunakan Docker

```powershell
# Database sudah otomatis dibuat jika menggunakan Docker command di atas
# Cek database:
docker exec -it motiv-postgres psql -U postgres -c "\l"
```

## Langkah 3: Setup File .env

Buat file `.env` di root folder `motiv/` dengan isi:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/motiv_coffee?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-secret-here"

# Midtrans Configuration (Optional untuk development)
MIDTRANS_SERVER_KEY=""
MIDTRANS_CLIENT_KEY=""
MIDTRANS_IS_PRODUCTION="false"

# RajaOngkir Configuration (Optional untuk development)
RAJAONGKIR_API_KEY=""
```

**Ganti `PASSWORD` dengan password postgres Anda!**

### Generate NEXTAUTH_SECRET:

**Windows PowerShell:**

```powershell
# Menggunakan Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Atau manual generate
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## Langkah 4: Jalankan Migrasi Database

```powershell
# Masuk ke folder motiv
cd motiv

# Generate Prisma Client
npx prisma generate

# Jalankan migrasi (buat tabel-tabel)
npx prisma migrate dev --name init

# Atau jika sudah ada migrasi sebelumnya
npx prisma migrate deploy
```

## Langkah 5: Seed Database (Optional)

Isi database dengan data awal (user admin, vouchers, dll):

```powershell
npx prisma db seed
```

Data yang dibuat:

- **Admin**: admin@motiv.com / admin123
- **B2C User**: user@test.com / user123
- **B2B User**: b2b@test.com / b2b123
- **Vouchers**: WELCOME10, FREESHIP, BIGORDER

## Langkah 6: Verifikasi Koneksi

### Cara 1: Menggunakan Prisma Studio

```powershell
npx prisma studio
```

Akan membuka http://localhost:5555 untuk melihat data database

### Cara 2: Cek dengan psql

```powershell
psql -U postgres -d motiv_coffee
# Kemudian jalankan:
\dt    # Lihat semua tabel
\q     # Keluar
```

### Cara 3: Cek dengan Node.js

Buat file test `test-db.js`:

```javascript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  console.log("Total users:", users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Jalankan:

```powershell
node test-db.js
```

## Langkah 7: Jalankan Development Server

```powershell
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

## Troubleshooting

### Error: "Can't reach database server"

- Cek apakah PostgreSQL service berjalan:

  ```powershell
  # Windows
  Get-Service -Name postgresql*

  # Docker
  docker ps
  ```

- Cek port 5432 tidak dipakai aplikasi lain

### Error: "password authentication failed"

- Cek username dan password di DATABASE_URL
- Password di .env harus match dengan password postgres

### Error: "database does not exist"

- Pastikan database `motiv_coffee` sudah dibuat
- Jalankan: `CREATE DATABASE motiv_coffee;` di psql

### Error: "Schema not found"

- Jalankan migrasi: `npx prisma migrate dev`
- Atau: `npx prisma db push`

## Connection String Format

Format lengkap:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA&connection_limit=10&pool_timeout=20
```

Contoh untuk berbagai skenario:

**Local Development:**

```
postgresql://postgres:password@localhost:5432/motiv_coffee?schema=public
```

**Docker:**

```
postgresql://postgres:password@localhost:5432/motiv_coffee?schema=public
```

**Remote Server:**

```
postgresql://username:password@db.example.com:5432/motiv_coffee?schema=public&sslmode=require
```

**Supabase/Neon:**

```
postgresql://username:password@db.xxxx.supabase.co:5432/postgres?schema=public&pgbouncer=true
```

## Tools Berguna

### pgAdmin 4

GUI untuk manage PostgreSQL - https://www.pgadmin.org/

### Prisma Studio

```powershell
npx prisma studio
```

### DBeaver

Universal database tool - https://dbeaver.io/

### TablePlus

Modern database GUI - https://tableplus.com/

## Backup & Restore

### Backup Database

```powershell
pg_dump -U postgres -d motiv_coffee > backup.sql
```

### Restore Database

```powershell
psql -U postgres -d motiv_coffee < backup.sql
```

## Production Deployment

Untuk production, gunakan database hosting seperti:

- **Supabase** (Free tier tersedia)
- **Neon** (Serverless PostgreSQL)
- **Railway**
- **Heroku Postgres**
- **Azure Database for PostgreSQL**
- **AWS RDS**

Dapatkan connection string dari provider dan update `DATABASE_URL` di environment variables production Anda.
