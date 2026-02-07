# 🔍 LAPORAN AUDIT QA - MOTIV E-COMMERCE

**Tanggal Audit:** 7 Februari 2026  
**Auditor:** QA Software Developer  
**Status:** ⚠️ **CRITICAL ISSUES FOUND - ACTION REQUIRED**  
**Target:** Persiapan sebelum pemisahan PWA dan Non-PWA

---

## 📊 EXECUTIVE SUMMARY

### Ringkasan Status

- ✅ **Working Features:** 85%
- ⚠️ **Issues Found:** 38 temuan
- 🔴 **Critical Issues:** 8
- 🟡 **Major Issues:** 12
- 🟢 **Minor Issues:** 18

### Rekomendasi Utama

**🚨 HARUS DIPERBAIKI SEBELUM PEMISAHAN:**

1. Environment variables & secrets management
2. CORS & security headers configuration
3. RajaOngkir API key missing
4. Error handling & logging standardization
5. B2B registration flow validation

---

## 🔴 CRITICAL ISSUES (Priority 1)

### 1. ⚠️ ENVIRONMENT VARIABLES EXPOSED IN PRODUCTION FILE

**Severity:** 🔴 CRITICAL  
**Location:** `.env.production`  
**Issue:**

```env
# File ini ada di repository dengan credentials production!
DATABASE_URL="postgresql://postgres.aaltkprawfanoajoevcp:gs8ynqel74prbtxr@..."
NEXTAUTH_SECRET="QGT448AvJnJTO9K56fKSin8tlcEhEGCYnZ9BPNY3Xas="
MIDTRANS_SERVER_KEY="SB-Mid-server-WcccSpmvIemTb3UMknSd6r5b"
```

**Risk:**

- Database credentials terbuka
- API keys bisa diakses siapa saja
- NextAuth secret exposed (session hijacking risk)

**Solusi:**

```bash
# 1. HAPUS .env.production dari repository
git rm --cached .env.production
git commit -m "Remove exposed credentials"

# 2. Update .gitignore
echo ".env*" >> .gitignore

# 3. Generate new secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
DATABASE_PASSWORD=$(openssl rand -base64 24)

# 4. Rotate all keys di Vercel & Supabase
# 5. Update Midtrans keys
```

---

### 2. ⚠️ RAJAONGKIR API KEY MISSING

**Severity:** 🔴 CRITICAL  
**Location:** `src/app/api/shipping/cost/route.js`  
**Issue:**

```javascript
const API_KEY = process.env.RAJAONGKIR_API_KEY; // UNDEFINED!
const BASE_URL = process.env.RAJAONGKIR_BASE_URL; // UNDEFINED!

if (!API_KEY) {
  return NextResponse.json(
    { success: false, message: "API Key Server Hilang" },
    { status: 500 },
  );
}
```

**Impact:**

- Shipping cost calculation selalu gagal
- Checkout tidak bisa selesai
- User experience buruk

**Solusi:**

```env
# Tambahkan ke .env dan Vercel
RAJAONGKIR_API_KEY=your_key_here
RAJAONGKIR_BASE_URL=https://api.komerce.id/rajaongkir
STORE_CITY_ID=256
```

---

### 3. ⚠️ SECURITY HEADERS DIHAPUS TOTAL DI MIDDLEWARE

**Severity:** 🔴 CRITICAL  
**Location:** `src/middleware.js:27-30`  
**Issue:**

```javascript
// [FIX FINAL] Hapus paksa Header Keamanan yang memblokir Midtrans
response.headers.delete("Content-Security-Policy");
response.headers.delete("X-Frame-Options");
response.headers.delete("X-Content-Type-Options");
response.headers.delete("Permissions-Policy");
```

**Risk:**

- Aplikasi vulnerable terhadap XSS attacks
- Clickjacking attacks possible
- MIME-sniffing attacks
- Tidak ada protection dari malicious iframes

**Solusi yang Benar:**

```javascript
// JANGAN hapus semua headers, tapi konfigurasi CSP dengan benar
const csp = [
  "default-src 'self'",
  "script-src 'self' https://app.sandbox.midtrans.com 'unsafe-inline'",
  "frame-src 'self' https://app.sandbox.midtrans.com",
  "connect-src 'self' https://api.midtrans.com",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
].join("; ");

response.headers.set("Content-Security-Policy", csp);
response.headers.set("X-Frame-Options", "SAMEORIGIN"); // Bukan DENY!
response.headers.set("X-Content-Type-Options", "nosniff");
response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
```

---

### 4. ⚠️ SUPABASE SERVICE ROLE KEY MISSING

**Severity:** 🔴 CRITICAL  
**Location:** `src/lib/supabase.js:6-7`  
**Issue:**

```javascript
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || // ❌ TIDAK ADA!
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

**Risk:**

- Menggunakan ANON key untuk operasi sensitive
- Admin operations tidak secure
- RLS (Row Level Security) bypass tidak berfungsi

**Solusi:**

```env
# Tambahkan service role key (GET dari Supabase Dashboard)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Update supabase.js untuk separate clients
// supabase.js
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

**Action Required:**

- Pisahkan supabase client untuk admin vs user operations
- Update semua admin API routes untuk gunakan `supabaseAdmin`
- Set proper RLS policies di Supabase

---

### 5. ⚠️ NO INPUT VALIDATION & SANITIZATION

**Severity:** 🔴 CRITICAL  
**Location:** Multiple API routes  
**Issue:**

```javascript
// src/app/api/auth/register/route.js - NO VALIDATION!
const body = await request.json();

// Langsung dipakai tanpa validation:
const result = await AuthViewModel.register(body);
```

**Risk:**

- SQL Injection (meski pakai ORM)
- XSS attacks via user input
- NoSQL injection
- Data type mismatch errors

**Solusi:**

```javascript
// Install validation library
npm install zod

// Create schemas
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  phone: z.string().regex(/^(\+62|62|0)[0-9]{9,12}$/).optional()
});

// Validate
try {
  const validated = registerSchema.parse(body);
  const result = await AuthViewModel.register(validated);
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({
      success: false,
      errors: error.errors
    }, { status: 400 });
  }
}
```

**Files Need Validation:**

- ✅ All API routes in `src/app/api/**/*.js`
- ✅ Especially: auth, orders, products, admin routes

---

### 6. ⚠️ STOCK RACE CONDITION POTENTIAL

**Severity:** 🔴 CRITICAL  
**Location:** `src/models/OrderModel.js:23-37`  
**Issue:**

```javascript
// Check stock availability
if (variant.stock < item.quantity) {
  throw new Error(`Stok tidak mencukupi...`);
}
// ❌ Gap time antara check dan deduct!
// User lain bisa order dalam gap ini
```

**Scenario:**

1. User A checks: stock = 5 ✅
2. User B checks: stock = 5 ✅
3. User A orders 5 items ✅
4. User B orders 5 items ✅ (HARUSNYA GAGAL!)
5. Stock becomes -5 ❌

**Solusi:**

```sql
-- Gunakan atomic operation yang sudah ada
-- File: create-atomic-stock-function.sql (SUDAH ADA!)
-- Pastikan dipanggil dengan benar

-- Di OrderModel.js
static async create(data) {
  // JANGAN check stock manual
  // Langsung create order, let atomic function handle it

  const { data: order, error } = await supabase.rpc(
    'create_order_with_stock_check',
    { order_data: data }
  );

  // Atomic function akan:
  // 1. Lock row
  // 2. Check stock
  // 3. Deduct if available
  // 4. Rollback if insufficient
}
```

---

### 7. ⚠️ PAYMENT STATUS UPDATE WITHOUT VERIFICATION

**Severity:** 🔴 CRITICAL  
**Location:** `src/app/api/admin/orders/[id]/route.js:95-126`  
**Issue:**

```javascript
// Admin bisa update payment status PAID tanpa proof!
case "paymentStatus":
  await OrderModel.updatePaymentStatus(orderId, value);

  if (value === "PAID") {
    // Langsung deduct stock tanpa verify payment
    await OrderModel.deductStock(orderId);
  }
```

**Risk:**

- Admin bisa manipulasi order status
- Stock deduction tanpa payment verification
- Fraud potential

**Solusi:**

```javascript
// Require admin to input transaction proof
case "paymentStatus":
  if (value === "PAID") {
    // WAJIB ada transaction ID atau payment proof
    if (!additionalData.manualPaymentProof) {
      return NextResponse.json({
        success: false,
        message: "Payment proof required for manual payment confirmation"
      }, { status: 400 });
    }

    // Log admin action for audit trail
    await AuditLogModel.create({
      adminId: session.user.id,
      action: "MANUAL_PAYMENT_CONFIRMATION",
      orderId: orderId,
      proof: additionalData.manualPaymentProof,
      timestamp: new Date()
    });
  }
```

---

### 8. ⚠️ CONSOLE.LOG EXCESSIVE IN PRODUCTION

**Severity:** 🟡 MAJOR  
**Location:** Multiple files  
**Issue:**

- 100+ console.log() statements di production code
- Sensitive data bisa leak di logs
- Performance impact

**Files Affected:**

```
src/models/OrderModel.js - 6 console logs
src/app/api/payment/notification/route.js - 4 console logs
src/app/api/orders/route.js - 3 console logs
scripts/*.js - 80+ console logs
```

**Solusi:**

```javascript
// Create proper logging utility
// src/lib/logger.js
export const logger = {
  info: (message, data) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[INFO] ${message}`, data);
    }
    // Send to logging service (Sentry, LogRocket, etc)
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
    // Always log errors to service
  },
  warn: (message, data) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[WARN] ${message}`, data);
    }
  },
};

// Replace all console.log
// console.log("Stock deducted")
logger.info("Stock deducted", { orderId, variantId });
```

---

## 🟡 MAJOR ISSUES (Priority 2)

### 9. ⚠️ B2B REGISTRATION FLOW INCOMPLETE

**Severity:** 🟡 MAJOR  
**Location:** `src/app/api/b2b/request/route.js`  
**Issue:**

- File exists tapi tidak ada validation
- No email notification untuk admin
- No status tracking untuk user

**Required:**

```javascript
// POST /api/b2b/request
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();

  const body = await request.json();

  // Validate B2B request data
  const schema = z.object({
    companyName: z.string().min(3),
    npwp: z.string().regex(/^\d{15}$/),
    businessType: z.enum(["RETAIL", "CAFE", "RESTAURANT", "DISTRIBUTOR"]),
    estimatedMonthlyOrder: z.number().min(1000000),
    documents: z.array(z.string().url()),
  });

  const validated = schema.parse(body);

  // Create B2B request
  await B2BRequestModel.create({
    userId: session.user.id,
    ...validated,
    status: "PENDING",
  });

  // Send email to admin
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: "New B2B Registration Request",
    template: "b2b-request",
    data: validated,
  });
}
```

---

### 10. ⚠️ NO ERROR BOUNDARY FOR CLIENT COMPONENTS

**Severity:** 🟡 MAJOR  
**Location:** Client components  
**Issue:**

```jsx
// Jika component crash, user sees blank screen
// No error recovery mechanism
```

**Solusi:**

```jsx
// src/components/ErrorBoundary.jsx
"use client";

import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error reporting service
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Oops, terjadi kesalahan!</h2>
          <button onClick={() => window.location.reload()}>
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrap components
// app/layout.js
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>;
```

---

### 11. ⚠️ PWA MANIFEST ICONS NOT OPTIMIZED

**Severity:** 🟡 MAJOR  
**Location:** `src/app/manifest.js:10-60`  
**Issue:**

```javascript
// Semua icons pakai file yang sama!
{
  src: "/icons/ikon-motiv.png", // 72x72 ???
  sizes: "512x512", // ❌ MISMATCH!
  type: "image/png",
}
```

**Impact:**

- PWA score rendah
- Install prompt tidak muncul
- Icons blur di device

**Solusi:**

```bash
# Generate proper icon sizes
npm install -g sharp-cli

# Generate dari source (minimal 512x512)
sharp -i icons/icon-512.png -o icons/icon-72.png resize 72 72
sharp -i icons/icon-512.png -o icons/icon-96.png resize 96 96
sharp -i icons/icon-512.png -o icons/icon-128.png resize 128 128
sharp -i icons/icon-512.png -o icons/icon-144.png resize 144 144
sharp -i icons/icon-512.png -o icons/icon-192.png resize 192 192
sharp -i icons/icon-512.png -o icons/icon-384.png resize 384 384
sharp -i icons/icon-512.png -o icons/icon-512.png resize 512 512

# Update manifest.js
{
  src: "/icons/icon-72.png",
  sizes: "72x72",
  type: "image/png"
},
// ... dst untuk setiap size
```

---

### 12. ⚠️ SERVICE WORKER CACHE STRATEGY KURANG OPTIMAL

**Severity:** 🟡 MAJOR  
**Location:** `public/sw.js:82-160`  
**Issue:**

```javascript
// Network-first untuk semua navigation
// Bisa lambat jika network slow
event.respondWith(
  fetch(request)
    .then((response) => {
      /* ... */
    })
    .catch(() => caches.match(request)),
);
```

**Rekomendasi:**

```javascript
// Gunakan Network First with Timeout
const NETWORK_TIMEOUT = 3000; // 3 seconds

event.respondWith(
  Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), NETWORK_TIMEOUT),
    ),
  ])
    .then((response) => {
      // Cache successful response
      return response;
    })
    .catch(() => {
      // Fallback to cache
      return caches.match(request);
    }),
);
```

---

### 13. ⚠️ NO RATE LIMITING ON API ROUTES

**Severity:** 🟡 MAJOR  
**Location:** All API routes  
**Issue:**

- User bisa spam API calls
- DDoS attack vulnerable
- Database overload risk

**Solusi:**

```javascript
// Install rate limiter
npm install express-rate-limit

// src/lib/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later.'
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
});

// Apply to routes
// src/app/api/auth/[...nextauth]/route.js
export async function POST(request) {
  await loginLimiter(request);
  // ... rest of the code
}
```

---

### 14. ⚠️ NO DATABASE BACKUP STRATEGY

**Severity:** 🟡 MAJOR  
**Issue:**

- Tidak ada automated backup
- No disaster recovery plan
- Data loss risk

**Solusi:**

```bash
# Setup automated backup di Supabase
# 1. Enable Point-in-Time Recovery (PITR)
# 2. Setup pg_dump cronjob
# 3. Save to cloud storage

# backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE
gzip $BACKUP_FILE

# Upload to S3 or Google Cloud Storage
aws s3 cp $BACKUP_FILE.gz s3://your-bucket/backups/

# Keep only last 30 days
find . -name "backup_*.sql.gz" -mtime +30 -delete
```

---

### 15. ⚠️ MIDTRANS SANDBOX vs PRODUCTION UNCLEAR

**Severity:** 🟡 MAJOR  
**Location:** `.env.production:45`  
**Issue:**

```env
MIDTRANS_IS_PRODUCTION="false"  # ❌ Production env tapi pakai sandbox!
NEXT_PUBLIC_MIDTRANS_API_URL="https://app.sandbox.midtrans.com"
```

**Risk:**

- Confusion antara env
- Production bisa pakai sandbox keys
- Payment bisa gagal

**Solusi:**

```env
# .env.production - HARUS production keys
MIDTRANS_IS_PRODUCTION="true"
NEXT_PUBLIC_MIDTRANS_API_URL="https://app.midtrans.com"
NEXT_PUBLIC_MIDTRANS_SNAP_URL="https://app.midtrans.com/snap/snap.js"
MIDTRANS_SERVER_KEY="Mid-server-PRODUCTION-KEY"

# .env.development - Sandbox keys
MIDTRANS_IS_PRODUCTION="false"
NEXT_PUBLIC_MIDTRANS_API_URL="https://app.sandbox.midtrans.com"
```

---

### 16. ⚠️ NO WEBHOOK SIGNATURE VERIFICATION LOGGING

**Severity:** 🟡 MAJOR  
**Location:** `src/app/api/payment/notification/route.js:14-30`  
**Issue:**

```javascript
if (signatureKey !== notification.signature_key) {
  return NextResponse.json(
    { success: false, message: "Invalid signature" },
    { status: 403 },
  );
}
// ❌ No logging! Attacker bisa spam tanpa detect
```

**Solusi:**

```javascript
if (signatureKey !== notification.signature_key) {
  // Log failed signature attempts
  await SecurityLogModel.create({
    type: "WEBHOOK_SIGNATURE_FAILED",
    ip: request.headers.get("x-forwarded-for"),
    orderId: notification.order_id,
    timestamp: new Date(),
  });

  // Alert admin after 5 failed attempts
  const recentFails = await SecurityLogModel.countRecent({
    type: "WEBHOOK_SIGNATURE_FAILED",
    minutes: 5,
  });

  if (recentFails >= 5) {
    await sendAlert({
      type: "SECURITY",
      message: `${recentFails} webhook signature failures detected`,
    });
  }

  return NextResponse.json(
    { success: false, message: "Invalid signature" },
    { status: 403 },
  );
}
```

---

### 17. ⚠️ VOUCHER VALIDATION NOT ATOMIC

**Severity:** 🟡 MAJOR  
**Location:** `src/models/VoucherModel.js:84-100`  
**Issue:**

```javascript
// Check voucher usage
if (voucher.currentUsage >= voucher.maxUsage) {
  return { valid: false, message: "Voucher sudah habis" };
}
// ❌ Race condition! Multiple users bisa pakai voucher yang sama
```

**Solusi:**

```sql
-- Create atomic voucher claim function
CREATE OR REPLACE FUNCTION claim_voucher(
  voucher_code TEXT,
  user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_voucher RECORD;
  result JSON;
BEGIN
  -- Lock voucher row
  SELECT * INTO v_voucher
  FROM "Voucher"
  WHERE code = voucher_code
  FOR UPDATE;

  -- Check if already used by user
  IF EXISTS (
    SELECT 1 FROM "VoucherUsage"
    WHERE "voucherId" = v_voucher.id
    AND "userId" = user_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Voucher sudah pernah digunakan'
    );
  END IF;

  -- Check usage limit
  IF v_voucher."currentUsage" >= v_voucher."maxUsage" THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Voucher sudah habis'
    );
  END IF;

  -- Increment usage
  UPDATE "Voucher"
  SET "currentUsage" = "currentUsage" + 1
  WHERE id = v_voucher.id;

  -- Record usage
  INSERT INTO "VoucherUsage" ("voucherId", "userId", "usedAt")
  VALUES (v_voucher.id, user_id, NOW());

  RETURN json_build_object(
    'success', true,
    'voucher', row_to_json(v_voucher)
  );
END;
$$ LANGUAGE plpgsql;
```

---

### 18. ⚠️ IMAGE UPLOAD NOT VALIDATED

**Severity:** 🟡 MAJOR  
**Location:** `src/app/api/upload/route.js`  
**Issue:**

- No file size limit
- No file type validation
- No malware scanning

**Solusi:**

```javascript
export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      {
        success: false,
        message: "File type not allowed",
      },
      { status: 400 },
    );
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json(
      {
        success: false,
        message: "File too large (max 5MB)",
      },
      { status: 400 },
    );
  }

  // Validate image dimensions
  const buffer = await file.arrayBuffer();
  const image = await sharp(buffer);
  const metadata = await image.metadata();

  if (metadata.width > 4096 || metadata.height > 4096) {
    return NextResponse.json(
      {
        success: false,
        message: "Image dimensions too large (max 4096x4096)",
      },
      { status: 400 },
    );
  }

  // Sanitize filename
  const sanitizedName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("products")
    .upload(sanitizedName, buffer, {
      contentType: file.type,
      cacheControl: "31536000",
    });
}
```

---

### 19. ⚠️ NO PAGINATION LIMITS ENFORCED

**Severity:** 🟡 MAJOR  
**Location:** Multiple API routes  
**Issue:**

```javascript
// User bisa request unlimited data
const { take = 20 } = options;
// ❌ User bisa set take=9999999
```

**Solusi:**

```javascript
static async getAll(options = {}) {
  let { skip = 0, take = 20 } = options;

  // Enforce maximum limit
  const MAX_LIMIT = 100;
  take = Math.min(take, MAX_LIMIT);
  skip = Math.max(skip, 0);

  // ... rest of query
}
```

---

### 20. ⚠️ ORDER NUMBER GENERATION NOT UNIQUE

**Severity:** 🟡 MAJOR  
**Location:** `src/models/OrderModel.js:13-16`  
**Issue:**

```javascript
const orderNumber = `ORD-${Date.now()}-${Math.random()
  .toString(36)
  .substring(7)
  .toUpperCase()}`;
// ❌ Math.random() bisa collision!
```

**Solusi:**

```javascript
// Use UUID or better algorithm
import { customAlphabet } from "nanoid";

const generateOrderNumber = () => {
  const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = nanoid(6);
  return `ORD-${timestamp}-${random}`;
};

// Example: ORD-L8ZX9Y2-ABC123
```

---

## 🟢 MINOR ISSUES (Priority 3)

### 21. Missing TypeScript

- No type safety
- Runtime errors bisa dicegah
- Developer experience kurang optimal
- **Rekomendasi:** Migrate ke TypeScript gradually

### 22. No API Documentation

- Tidak ada Swagger/OpenAPI docs
- Frontend dev harus baca source code
- **Rekomendasi:** Setup Swagger UI

### 23. Hard-coded Configuration Values

```javascript
// src/lib/config.js
export const BusinessConfig = {
  MOQ: 0, // Hard-coded!
  // ...
};
```

- **Rekomendasi:** Move to database atau environment

### 24. No Loading States untuk Form Submissions

- User bisa double-submit form
- **Rekomendasi:** Add loading states & disable buttons

### 25. No Email Verification

- User bisa register dengan fake email
- **Rekomendasi:** Implement email verification flow

### 26. No Password Reset Flow

- User tidak bisa reset password sendiri
- **Rekomendasi:** Add forgot password feature

### 27. No Search Functionality

- Product search pakai `ilike` (case insensitive)
- Tidak ada full-text search
- **Rekomendasi:** Implement PostgreSQL full-text search

### 28. No Image Optimization Pipeline

- Images uploaded as-is
- No automatic resize
- **Rekomendasi:** Add sharp processing

### 29. No Order Cancellation by User

- User tidak bisa cancel order sendiri
- Harus contact admin
- **Rekomendasi:** Add self-service cancellation

### 30. No Stock Alerts for Admin

- Admin tidak dapat notif saat stock habis
- **Rekomendasi:** Add email/push notifications

### 31. No Analytics Tracking

- Tidak ada Google Analytics atau Mixpanel
- Tidak bisa track user behavior
- **Rekomendasi:** Add analytics integration

### 32. No A/B Testing Framework

- Tidak bisa test different UI variations
- **Rekomendasi:** Add feature flags

### 33. No Internationalization for Currency

- Hanya support IDR
- **Rekomendasi:** Add multi-currency support

### 34. No Order Export Feature

- Admin tidak bisa export orders to CSV/Excel
- **Rekomendasi:** Add export functionality

### 35. No Push Notifications

- Service Worker support push tapi tidak digunakan
- **Rekomendasi:** Implement push notifications

### 36. No Social Login

- Hanya support email/password
- **Rekomendasi:** Add Google/Facebook OAuth

### 37. No WhatsApp Integration

- Tidak ada tombol contact via WhatsApp
- **Rekomendasi:** Add WhatsApp floating button

### 38. No Product Reviews & Ratings

- User tidak bisa review produk
- **Rekomendasi:** Add review system

---

## 📋 TESTING CHECKLIST

### Security Testing

- [ ] Penetration testing untuk API routes
- [ ] SQL injection testing
- [ ] XSS vulnerability scanning
- [ ] CSRF protection testing
- [ ] Authentication bypass testing
- [ ] Authorization testing (role-based access)
- [ ] Rate limiting testing
- [ ] File upload security testing

### Performance Testing

- [ ] Load testing dengan 100+ concurrent users
- [ ] Database query optimization
- [ ] API response time < 200ms
- [ ] Lighthouse score > 90
- [ ] Time to First Byte < 300ms
- [ ] Largest Contentful Paint < 2.5s

### PWA Testing

- [ ] Install prompt muncul
- [ ] Offline mode berfungsi
- [ ] Service worker caching benar
- [ ] Manifest validation
- [ ] Icons semua size tersedia
- [ ] Push notifications berfungsi

### Payment Flow Testing

- [ ] Midtrans Snap popup muncul
- [ ] Webhook signature verification
- [ ] Stock deduction setelah payment
- [ ] Failed payment handling
- [ ] Expired payment handling
- [ ] Fraud detection response

### B2B Flow Testing

- [ ] Registration form validation
- [ ] Admin approval workflow
- [ ] Discount calculation correct
- [ ] B2B pricing display
- [ ] Order with B2B discount

### Cross-browser Testing

- [ ] Chrome (desktop & mobile)
- [ ] Firefox
- [ ] Safari (desktop & iOS)
- [ ] Edge
- [ ] Samsung Internet

---

## 🎯 RECOMMENDATION PRIORITAS

### Sebelum Pemisahan PWA (WAJIB)

1. ✅ Fix environment variables exposure
2. ✅ Add RajaOngkir API key
3. ✅ Fix security headers (CSP)
4. ✅ Add input validation semua API routes
5. ✅ Fix stock race condition
6. ✅ Setup proper logging system
7. ✅ Add rate limiting
8. ✅ Fix PWA icons mismatch

### Setelah Pemisahan (High Priority)

1. ✅ Implement error boundaries
2. ✅ Add email notifications
3. ✅ Setup database backups
4. ✅ Add API documentation
5. ✅ Implement monitoring (Sentry)
6. ✅ Add proper test coverage

### Future Enhancements

1. Migrate ke TypeScript
2. Add push notifications
3. Add product reviews
4. Add analytics
5. Add multi-language support
6. Add WhatsApp integration

---

## 📝 CATATAN UNTUK PEMISAHAN PWA

### Strategi Pemisahan

```
motiv/
├── motiv-pwa/          # PWA version (full features)
│   ├── Service Worker
│   ├── Offline support
│   ├── Push notifications
│   └── Install prompt
│
└── motiv-web/          # Non-PWA version (lightweight)
    ├── No Service Worker
    ├── Standard web app
    └── Better SEO focus
```

### Shared Components

- Authentication system
- API routes
- Database models
- UI components library

### Different Features

**PWA Only:**

- Offline mode
- Push notifications
- Background sync
- Install to home screen
- Cache management

**Non-PWA Focus:**

- Server-side rendering optimal
- Better SEO
- Faster initial load
- No SW overhead

---

## 🔍 MONITORING RECOMMENDATIONS

### Error Tracking

```javascript
// Setup Sentry
npm install @sentry/nextjs

// sentry.client.config.js
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});
```

### Performance Monitoring

```javascript
// Web Vitals
export function reportWebVitals(metric) {
  // Send to analytics
  if (metric.label === "web-vital") {
    gtag("event", metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
    });
  }
}
```

---

## ✅ CHECKLIST ACTION ITEMS

### Critical (Selesaikan dalam 1-2 hari)

- [ ] Remove .env.production dari repository
- [ ] Generate new secrets & rotate keys
- [ ] Add RAJAONGKIR_API_KEY
- [ ] Add SUPABASE_SERVICE_ROLE_KEY
- [ ] Fix CSP headers (jangan hapus semua)
- [ ] Add input validation library (Zod)
- [ ] Fix stock race condition
- [ ] Remove/replace console.log dengan logger

### Major (Selesaikan dalam 1 minggu)

- [ ] Complete B2B registration flow
- [ ] Add error boundaries
- [ ] Fix PWA icons
- [ ] Optimize service worker
- [ ] Add rate limiting
- [ ] Setup database backups
- [ ] Fix Midtrans env configuration
- [ ] Add webhook logging
- [ ] Make voucher validation atomic
- [ ] Add image upload validation

### Minor (Selesaikan dalam 2-4 minggu)

- [ ] Add TypeScript (gradual migration)
- [ ] Add API documentation (Swagger)
- [ ] Move config to database
- [ ] Add loading states
- [ ] Add email verification
- [ ] Add password reset
- [ ] Improve search (full-text)
- [ ] Add image optimization
- [ ] Add order cancellation
- [ ] Add stock alerts
- [ ] Add analytics
- [ ] Add A/B testing framework
- [ ] Add multi-currency
- [ ] Add export feature
- [ ] Add push notifications
- [ ] Add social login
- [ ] Add WhatsApp integration
- [ ] Add review system

---

## 📞 SUPPORT & CONTACTS

**Developer:** [Your Team]  
**Last Updated:** 7 Februari 2026  
**Version:** 1.0  
**Status:** ⚠️ AWAITING CRITICAL FIXES

---

**Note:** Dokumen ini harus di-update setelah setiap fix implemented.
