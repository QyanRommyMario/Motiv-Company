# 🚀 QUICK FIX GUIDE - CRITICAL ISSUES

**Target:** Fix critical issues dalam 48 jam  
**Priority:** Security & Data Integrity

---

## ⚡ CRITICAL FIX #1: Environment Security (30 menit)

### Step 1: Remove Exposed Credentials

```powershell
# 1. Remove from git
git rm --cached .env.production
git commit -m "security: remove exposed credentials"
git push origin main

# 2. Update .gitignore
Add-Content .gitignore "`n# Environment files`n.env*`n!.env.example"
git add .gitignore
git commit -m "security: update gitignore"
git push
```

### Step 2: Rotate All Secrets

```powershell
# Generate new NextAuth secret
$newSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "New NEXTAUTH_SECRET: $newSecret"

# Go to Supabase Dashboard
# 1. Reset database password
# 2. Get new connection strings
# 3. Get service role key from Settings > API

# Go to Vercel Dashboard
# 1. Settings > Environment Variables
# 2. Delete all current variables
# 3. Add new ones:
```

### Step 3: Update Vercel Environment

```bash
# Install Vercel CLI
npm i -g vercel

# Login & link project
vercel login
vercel link

# Set production variables
vercel env add NEXTAUTH_SECRET production
# Paste new secret

vercel env add DATABASE_URL production
# Paste new DB URL

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste service role key

vercel env add RAJAONGKIR_API_KEY production
# Get from https://rajaongkir.com dashboard

# Redeploy
vercel --prod
```

---

## ⚡ CRITICAL FIX #2: Security Headers (15 menit)

### File: `src/middleware.js`

**REPLACE THIS:**

```javascript
// [FIX FINAL] Hapus paksa Header Keamanan yang memblokir Midtrans
response.headers.delete("Content-Security-Policy");
response.headers.delete("X-Frame-Options");
response.headers.delete("X-Content-Type-Options");
response.headers.delete("Permissions-Policy");
```

**WITH THIS:**

```javascript
// [SECURITY FIX] Proper CSP headers for Midtrans
const csp = [
  "default-src 'self'",
  "script-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com 'unsafe-inline' 'unsafe-eval'",
  "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com",
  "connect-src 'self' https://api.midtrans.com https://*.supabase.co",
  "img-src 'self' data: https: blob:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
].join("; ");

response.headers.set("Content-Security-Policy", csp);
response.headers.set("X-Frame-Options", "SAMEORIGIN");
response.headers.set("X-Content-Type-Options", "nosniff");
response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
response.headers.set(
  "Permissions-Policy",
  "geolocation=(), microphone=(), camera=()",
);
```

**Test:**

```bash
# Restart dev server
npm run dev

# Test Midtrans still works
# Go to checkout > Midtrans popup should open
```

---

## ⚡ CRITICAL FIX #3: Input Validation (1 jam)

### Step 1: Install Zod

```bash
npm install zod
```

### Step 2: Create Validation Schemas

**Create file:** `src/lib/validations.js`

```javascript
import { z } from "zod";

// Auth schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password harus mengandung huruf besar, kecil, dan angka",
    ),
  phone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, "Format nomor HP tidak valid")
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Order schemas
export const createOrderSchema = z.object({
  shippingAddressId: z.string().uuid(),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().min(1).max(1000),
      }),
    )
    .min(1),
  shipping: z.object({
    courier: z.string(),
    service: z.string(),
    cost: z.number().int().positive(),
    etd: z.string(),
  }),
  voucherCode: z.string().optional(),
  paymentMethod: z.enum(["ONLINE", "TRANSFER", "COD"]),
});

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(10),
  category: z.string().min(2),
  images: z.array(z.string().url()).min(1).max(5),
  features: z.array(z.string()).optional(),
  variants: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().int().positive(),
        stock: z.number().int().min(0),
        weight: z.number().int().positive(),
      }),
    )
    .min(1),
});

// B2B schemas
export const b2bRequestSchema = z.object({
  companyName: z.string().min(3).max(200),
  npwp: z.string().regex(/^\d{15}$/, "NPWP harus 15 digit"),
  businessType: z.enum([
    "RETAIL",
    "CAFE",
    "RESTAURANT",
    "DISTRIBUTOR",
    "OTHER",
  ]),
  address: z.string().min(10),
  estimatedMonthlyOrder: z.number().int().min(1000000),
  documents: z.array(z.string().url()).optional(),
});
```

### Step 3: Apply Validation to Routes

**Update:** `src/app/api/auth/register/route.js`

```javascript
import { NextResponse } from "next/server";
import { AuthViewModel } from "@/viewmodels/AuthViewModel";
import { registerSchema } from "@/lib/validations";
import { z } from "zod";

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate input
    try {
      const validated = registerSchema.parse(body);
      const result = await AuthViewModel.register(validated);

      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: "Data tidak valid",
            errors: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 },
        );
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
```

**Repeat for:**

- `src/app/api/orders/route.js`
- `src/app/api/admin/products/route.js`
- `src/app/api/b2b/request/route.js`

---

## ⚡ CRITICAL FIX #4: Supabase Admin Client (30 menit)

### Update: `src/lib/supabase.js`

**REPLACE ENTIRE FILE:**

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

// Client for user operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Admin client for privileged operations (bypasses RLS)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// Helper to check if admin client is available
export const hasAdminAccess = () => !!supabaseServiceKey;

// Log warning if service key is missing
if (!supabaseServiceKey) {
  console.warn(
    "⚠️  SUPABASE_SERVICE_ROLE_KEY not found. Admin operations will use anon key.",
  );
}

export default supabase;
```

### Update Admin Routes to Use Admin Client

**Example:** `src/app/api/admin/products/route.js`

```javascript
import { supabaseAdmin } from "@/lib/supabase"; // Changed from supabase

export async function POST(request) {
  const session = await requireAdmin();

  // Use admin client untuk bypass RLS
  const { data, error } = await supabaseAdmin
    .from("Product")
    .insert(productData)
    .select();

  // ... rest
}
```

---

## ⚡ CRITICAL FIX #5: Stock Race Condition (1 jam)

### Step 1: Verify Atomic Function Exists

```sql
-- Run di Supabase SQL Editor
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'atomic_decrement_stock';
```

If not exists, run:

```sql
-- File: scripts/create-atomic-stock-function.sql
CREATE OR REPLACE FUNCTION atomic_decrement_stock(
  variant_id UUID,
  quantity_to_deduct INTEGER
) RETURNS JSON AS $$
DECLARE
  current_stock INTEGER;
  new_stock INTEGER;
  result JSON;
BEGIN
  -- Lock the row
  SELECT stock INTO current_stock
  FROM "ProductVariant"
  WHERE id = variant_id
  FOR UPDATE;

  -- Check if stock is sufficient
  IF current_stock < quantity_to_deduct THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Insufficient stock',
      'current_stock', current_stock,
      'requested', quantity_to_deduct
    );
  END IF;

  -- Deduct stock
  UPDATE "ProductVariant"
  SET stock = stock - quantity_to_deduct
  WHERE id = variant_id
  RETURNING stock INTO new_stock;

  RETURN json_build_object(
    'success', true,
    'old_stock', current_stock,
    'new_stock', new_stock
  );
END;
$$ LANGUAGE plpgsql;
```

### Step 2: Update OrderModel

**File:** `src/models/OrderModel.js`

**UPDATE deductStock method (line 333-400):**

```javascript
static async deductStock(orderId) {
  // Get order items
  const { data: order, error: orderError } = await supabase
    .from("Order")
    .select("*, items:OrderItem(*)")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw new Error("Order not found");
  }

  const results = [];

  // Process each item with atomic operation
  for (const item of order.items) {
    try {
      const { data: result, error: rpcError } = await supabase.rpc(
        "atomic_decrement_stock",
        {
          variant_id: item.variantId,
          quantity_to_deduct: item.quantity,
        }
      );

      if (rpcError) throw rpcError;

      if (result.success) {
        results.push({
          variantId: item.variantId,
          success: true,
          oldStock: result.old_stock,
          newStock: result.new_stock,
        });
      } else {
        // Stock insufficient - this shouldn't happen if validation is correct
        results.push({
          variantId: item.variantId,
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      results.push({
        variantId: item.variantId,
        success: false,
        error: error.message,
      });
    }
  }

  const allSuccess = results.every((r) => r.success);

  return {
    success: allSuccess,
    results,
  };
}
```

---

## ⚡ CRITICAL FIX #6: Logging System (30 menit)

### Create Logger Utility

**Create file:** `src/lib/logger.js`

```javascript
const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      data,
      env: process.env.NODE_ENV,
    };
  }

  error(message, error) {
    const formatted = this.formatMessage(LOG_LEVELS.ERROR, message, {
      error: error?.message,
      stack: error?.stack,
    });

    console.error("[ERROR]", formatted);

    // TODO: Send to error tracking service (Sentry)
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureException(error);
    // }
  }

  warn(message, data = {}) {
    const formatted = this.formatMessage(LOG_LEVELS.WARN, message, data);

    if (this.isDevelopment) {
      console.warn("[WARN]", formatted);
    }

    // TODO: Send to logging service
  }

  info(message, data = {}) {
    const formatted = this.formatMessage(LOG_LEVELS.INFO, message, data);

    if (this.isDevelopment) {
      console.log("[INFO]", formatted);
    }

    // TODO: Send to logging service
  }

  debug(message, data = {}) {
    if (this.isDevelopment) {
      const formatted = this.formatMessage(LOG_LEVELS.DEBUG, message, data);
      console.debug("[DEBUG]", formatted);
    }
  }

  // Specialized loggers
  payment(action, data) {
    this.info(`[PAYMENT] ${action}`, data);
  }

  stock(action, data) {
    this.info(`[STOCK] ${action}`, data);
  }

  security(action, data) {
    this.warn(`[SECURITY] ${action}`, data);
  }
}

export const logger = new Logger();
export default logger;
```

### Replace console.log

**Find & Replace in all files:**

```javascript
// Before
console.log("✅ Stock deducted:", { orderId, stock });

// After
import logger from "@/lib/logger";
logger.stock("Stock deducted", { orderId, stock });
```

```javascript
// Before
console.error("Failed:", error);

// After
logger.error("Failed to process", error);
```

---

## ⚡ CRITICAL FIX #7: Rate Limiting (45 menit)

### Step 1: Install Dependencies

```bash
npm install express-rate-limit
```

### Step 2: Create Rate Limiter

**Create file:** `src/lib/rateLimiter.js`

```javascript
import { NextResponse } from "next/server";

// In-memory store (for serverless, use Redis in production)
const requestCounts = new Map();

// Clean old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of requestCounts.entries()) {
      if (now - value.resetTime > 0) {
        requestCounts.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

export function rateLimit(options = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 100, // 100 requests per window
    message = "Too many requests, please try again later.",
    keyGenerator = (request) => {
      // Use IP address as key
      return (
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown"
      );
    },
  } = options;

  return async (request) => {
    const key = keyGenerator(request);
    const now = Date.now();
    const record = requestCounts.get(key);

    if (!record) {
      // First request
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return null;
    }

    if (now > record.resetTime) {
      // Window expired, reset
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return null;
    }

    if (record.count >= max) {
      // Rate limit exceeded
      return NextResponse.json(
        {
          success: false,
          message,
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (record.resetTime - now) / 1000,
            ).toString(),
            "X-RateLimit-Limit": max.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": record.resetTime.toString(),
          },
        },
      );
    }

    // Increment count
    record.count++;
    return null;
  };
}

// Preset limiters
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again in 15 minutes.",
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 requests per minute
});
```

### Step 3: Apply to Routes

**Update:** `src/app/api/auth/[...nextauth]/route.js`

```javascript
import { authLimiter } from "@/lib/rateLimiter";

export async function POST(request, context) {
  // Apply rate limiting
  const limitResponse = await authLimiter(request);
  if (limitResponse) return limitResponse;

  // Continue with NextAuth
  return handler(request, context);
}

export { handler as GET };
```

**Update:** `src/app/api/orders/route.js`

```javascript
import { strictLimiter } from "@/lib/rateLimiter";

export async function POST(request) {
  // Rate limit order creation
  const limitResponse = await strictLimiter(request);
  if (limitResponse) return limitResponse;

  // ... rest of code
}
```

---

## ⚡ CRITICAL FIX #8: PWA Icons (20 menit)

### Option 1: Generate Proper Icons

```bash
# Install sharp CLI
npm install -g sharp-cli

# Create icons folder
mkdir -p public/icons

# Generate from 512x512 source
sharp -i public/icons/icon-source.png -o public/icons/icon-72.png resize 72
sharp -i public/icons/icon-source.png -o public/icons/icon-96.png resize 96
sharp -i public/icons/icon-source.png -o public/icons/icon-128.png resize 128
sharp -i public/icons/icon-source.png -o public/icons/icon-144.png resize 144
sharp -i public/icons/icon-source.png -o public/icons/icon-152.png resize 152
sharp -i public/icons/icon-source.png -o public/icons/icon-192.png resize 192
sharp -i public/icons/icon-source.png -o public/icons/icon-384.png resize 384
sharp -i public/icons/icon-source.png -o public/icons/icon-512.png resize 512
```

### Update Manifest

**File:** `src/app/manifest.js`

```javascript
export default function manifest() {
  return {
    name: "MOTIV Coffee E-Commerce",
    short_name: "MOTIV",
    description: "Premium Coffee Experience - B2B & B2C Platform",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#FDFCFA",
    theme_color: "#1A1A1A",
    categories: ["shopping", "food", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
```

---

## ✅ VERIFICATION CHECKLIST

After completing all fixes:

### Security

- [ ] .env.production tidak ada di repository
- [ ] Semua secrets di-rotate
- [ ] Vercel environment variables updated
- [ ] CSP headers berfungsi tanpa block Midtrans
- [ ] SUPABASE_SERVICE_ROLE_KEY exists
- [ ] Input validation berfungsi

### Functionality

- [ ] RAJAONGKIR_API_KEY works
- [ ] Shipping cost calculation berfungsi
- [ ] Stock deduction atomic berfungsi
- [ ] Rate limiting active
- [ ] PWA icons proper sizes
- [ ] Logging system implemented

### Testing Commands

```bash
# Local test
npm run dev

# Build test
npm run build
npm start

# Deployment test
vercel --prod

# Check environment
vercel env ls
```

---

## 🆘 TROUBLESHOOTING

### Issue: Midtrans popup tidak muncul setelah fix CSP

**Solution:**

```javascript
// Add to CSP:
"script-src 'self' https://app.sandbox.midtrans.com 'unsafe-eval'",
```

### Issue: Rate limiter not working in development

**Solution:**

```javascript
// Disable in development
if (process.env.NODE_ENV === "development") {
  return null; // Skip rate limiting
}
```

### Issue: Atomic stock function not found

**Solution:**

```sql
-- Check function exists
SELECT proname FROM pg_proc WHERE proname = 'atomic_decrement_stock';

-- If not exists, run create-atomic-stock-function.sql
```

---

## 📞 NEED HELP?

Jika ada issue saat menerapkan fixes:

1. Check error logs di Vercel
2. Check Supabase logs
3. Test locally terlebih dahulu
4. Rollback jika production error: `vercel rollback`

**Estimated Total Time:** 4-5 hours  
**Break it down:** 1-2 fixes per day = Done in 3-4 days
