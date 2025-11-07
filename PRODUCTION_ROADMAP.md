# 🚀 PRODUCTION ROADMAP - MOTIV E-COMMERCE

> Roadmap lengkap untuk deployment production dengan PostgreSQL, Midtrans, dan RajaOngkir API real

---

## 📊 CURRENT STATUS

✅ **Already Done:**
- ✅ Prisma schema sudah PostgreSQL-ready
- ✅ Basic Midtrans integration (sandbox)
- ✅ Mock shipping calculator
- ✅ Complete order flow (B2C/B2B)
- ✅ Role-based authentication
- ✅ Payment webhook handler

❌ **Need to Complete:**
- ❌ PostgreSQL production database setup
- ❌ Midtrans production credentials
- ❌ RajaOngkir API integration (real shipping rates)
- ❌ Production environment configuration
- ❌ Database optimization & indexing
- ❌ Error handling & logging
- ❌ Security hardening

---

## 🎯 MILESTONE OVERVIEW

| Milestone | Focus Area | Duration | Priority |
|-----------|-----------|----------|----------|
| **M1** | PostgreSQL Production Setup | 1-2 hari | 🔴 Critical |
| **M2** | Database Optimization & Migration | 1 hari | 🔴 Critical |
| **M3** | Midtrans Production Integration | 1 hari | 🔴 Critical |
| **M4** | RajaOngkir Shipping API Integration | 2 hari | 🟡 High |
| **M5** | Security & Error Handling | 1-2 hari | 🟡 High |
| **M6** | Testing & Performance Optimization | 2-3 hari | 🟢 Medium |
| **M7** | Deployment & Monitoring | 1-2 hari | 🟢 Medium |

**Total Estimated Time:** 9-13 hari

---

## 📋 MILESTONE 1: PostgreSQL Production Setup

### Objectives:
- Setup PostgreSQL server (production-grade)
- Configure database connection
- Migrate from development to production
- Setup database backup strategy

### Tasks:

#### 1.1 Choose PostgreSQL Hosting
**Option A: Supabase (Recommended - Free tier available)**
- ✅ Automatic backups
- ✅ Built-in connection pooling
- ✅ Free tier: 500MB database, 2GB bandwidth
- ✅ Easy scaling
- 📍 URL: https://supabase.com

**Option B: Railway**
- ✅ $5/month starter
- ✅ Auto-scaling
- ✅ Good for Next.js apps
- 📍 URL: https://railway.app

**Option C: Neon**
- ✅ Serverless PostgreSQL
- ✅ Free tier available
- ✅ Auto-scaling storage
- 📍 URL: https://neon.tech

**Option D: Self-hosted (VPS)**
- DigitalOcean Droplet: $6/month
- AWS RDS Free Tier (12 months)
- Google Cloud SQL

#### 1.2 Database Setup Steps

**A. Supabase Setup (Recommended):**
```bash
1. Sign up at https://supabase.com
2. Create New Project:
   - Name: motiv-coffee-production
   - Database Password: [Generate strong password]
   - Region: Singapore (closest to Indonesia)
   
3. Get Connection String:
   - Go to Settings > Database
   - Copy "Connection string" (Transaction mode)
   - Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

**B. Update .env:**
```env
# Production Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Connection Pooling (for serverless)
DATABASE_URL_POOLING="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true"
```

#### 1.3 Database Schema Optimization

**Add to `prisma/schema.prisma`:**
```prisma
// Add indexes for performance
model User {
  // ... existing fields
  
  @@index([email])
  @@index([role])
  @@index([status])
}

model Product {
  // ... existing fields
  
  @@index([category])
  @@index([createdAt])
}

model Order {
  // ... existing fields
  
  @@index([userId])
  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt])
}

model OrderItem {
  // ... existing fields
  
  @@index([orderId])
  @@index([productId])
}
```

#### 1.4 Migration Commands

```bash
# 1. Install Prisma CLI (if not installed)
npm install -D prisma

# 2. Generate Prisma Client
npx prisma generate

# 3. Push schema to production database
npx prisma db push

# 4. Seed initial data (admin user, categories)
npx prisma db seed

# 5. Verify migration
npx prisma studio
```

#### 1.5 Backup Strategy

**Create `scripts/backup-db.sh`:**
```bash
#!/bin/bash
# Database backup script

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Run pg_dump
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

**Setup automated backup (cron):**
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-db.sh
```

### Deliverables:
- ✅ PostgreSQL production database running
- ✅ Connection string configured
- ✅ Schema migrated with indexes
- ✅ Backup strategy implemented
- ✅ Can connect from local development

---

## 📋 MILESTONE 2: Database Optimization & Migration

### Objectives:
- Optimize database queries
- Add connection pooling
- Implement proper error handling
- Setup database monitoring

### Tasks:

#### 2.1 Connection Pooling Setup

**Update `src/lib/prisma.js`:**
```javascript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Connection pooling configuration
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL_POOLING || process.env.DATABASE_URL,
      },
    },
  });
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handle connection errors
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

export default prisma;
```

#### 2.2 Query Optimization

**Add to `src/lib/queryHelpers.js`:**
```javascript
/**
 * Query Optimization Helpers
 */

// Pagination helper
export function getPaginationParams(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

// Common includes for orders
export const orderInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          images: true,
        },
      },
      variant: {
        select: {
          id: true,
          name: true,
          price: true,
        },
      },
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  },
};

// Product with variants
export const productWithVariants = {
  variants: {
    orderBy: { price: 'asc' },
  },
};
```

#### 2.3 Database Monitoring

**Create `src/lib/dbMonitor.js`:**
```javascript
import prisma from './prisma';

export class DatabaseMonitor {
  static async getStats() {
    const [
      userCount,
      productCount,
      orderCount,
      activeOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: { in: ['PENDING', 'PROCESSING', 'SHIPPED'] },
        },
      }),
    ]);

    return {
      users: userCount,
      products: productCount,
      orders: orderCount,
      activeOrders,
    };
  }

  static async checkHealth() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { healthy: true, message: 'Database is healthy' };
    } catch (error) {
      return { healthy: false, message: error.message };
    }
  }
}
```

### Deliverables:
- ✅ Connection pooling configured
- ✅ Query optimization helpers
- ✅ Database monitoring dashboard
- ✅ Proper error handling

---

## 📋 MILESTONE 3: Midtrans Production Integration

### Objectives:
- Setup Midtrans production account
- Get production API keys
- Update payment integration
- Test real transactions

### Tasks:

#### 3.1 Midtrans Account Setup

**Steps:**
```
1. Register Merchant Account:
   - Visit: https://dashboard.midtrans.com/register
   - Choose: Business Account
   - Fill business details (Toko Kopi Motiv)

2. Complete Verification:
   - Upload business documents (SIUP/NIB)
   - Bank account verification
   - Owner ID verification
   - Wait 1-3 hari working days

3. Get Production Keys:
   - Dashboard > Settings > Access Keys
   - Copy: Server Key (production)
   - Copy: Client Key (production)
```

#### 3.2 Update Environment Variables

**`.env.production`:**
```env
# Midtrans Production
MIDTRANS_SERVER_KEY="SB-Mid-server-PRODUCTION-KEY-HERE"
MIDTRANS_CLIENT_KEY="SB-Mid-client-PRODUCTION-KEY-HERE"
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_MERCHANT_ID="G123456789"

# Callback URLs (must be HTTPS in production)
MIDTRANS_FINISH_URL="https://yourdomain.com/checkout/success"
MIDTRANS_UNFINISH_URL="https://yourdomain.com/checkout"
MIDTRANS_ERROR_URL="https://yourdomain.com/checkout?error=true"
```

#### 3.3 Update Midtrans Service

**Update `src/lib/midtrans.js`:**
```javascript
import midtransClient from 'midtrans-client';

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Snap API Client
const snap = new midtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Core API Client (for checking status)
const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export class MidtransService {
  static async createTransaction(order, user) {
    try {
      const parameter = {
        transaction_details: {
          order_id: order.id,
          gross_amount: order.total,
        },
        customer_details: {
          first_name: user.name,
          email: user.email,
          phone: user.phone || '08123456789',
        },
        item_details: order.items.map(item => ({
          id: item.variantId,
          price: item.price,
          quantity: item.quantity,
          name: item.product.name + ' - ' + item.variant.name,
        })),
        callbacks: {
          finish: process.env.MIDTRANS_FINISH_URL,
          unfinish: process.env.MIDTRANS_UNFINISH_URL,
          error: process.env.MIDTRANS_ERROR_URL,
        },
        enabled_payments: [
          'credit_card',
          'gopay',
          'shopeepay',
          'qris',
          'bca_va',
          'bni_va',
          'bri_va',
          'mandiri_va',
          'permata_va',
          'other_va',
        ],
        credit_card: {
          secure: true,
          bank: 'bca', // Installment bank
          installment: {
            required: false,
            terms: {
              bca: [3, 6, 12],
              bni: [3, 6, 12],
              mandiri: [3, 6, 12],
            },
          },
        },
      };

      const transaction = await snap.createTransaction(parameter);
      
      console.log('✅ Midtrans transaction created:', {
        orderId: order.id,
        token: transaction.token,
        isProduction,
      });

      return {
        token: transaction.token,
        redirect_url: transaction.redirect_url,
      };
    } catch (error) {
      console.error('❌ Midtrans error:', error);
      throw new Error('Failed to create payment transaction');
    }
  }

  static async checkStatus(orderId) {
    try {
      const status = await coreApi.transaction.status(orderId);
      return status;
    } catch (error) {
      console.error('❌ Check status error:', error);
      throw error;
    }
  }

  static async cancelTransaction(orderId) {
    try {
      await coreApi.transaction.cancel(orderId);
      return true;
    } catch (error) {
      console.error('❌ Cancel transaction error:', error);
      throw error;
    }
  }

  // Verify notification signature (security)
  static verifySignature(data) {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const crypto = require('crypto');
    
    const signatureKey = data.signature_key;
    const orderId = data.order_id;
    const statusCode = data.status_code;
    const grossAmount = data.gross_amount;
    
    const expectedSignature = crypto
      .createHash('sha512')
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest('hex');
    
    return signatureKey === expectedSignature;
  }
}

export default MidtransService;
```

#### 3.4 Update Payment Webhook

**Update `src/app/api/payment/notification/route.js`:**
```javascript
import { NextResponse } from 'next/server';
import { MidtransService } from '@/lib/midtrans';
import { OrderModel } from '@/models/OrderModel';

export async function POST(request) {
  try {
    const notification = await request.json();
    
    console.log('📥 Midtrans notification:', notification);

    // Verify signature (CRITICAL for production)
    if (!MidtransService.verifySignature(notification)) {
      console.error('❌ Invalid signature');
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 403 }
      );
    }

    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      gross_amount,
    } = notification;

    // Map Midtrans status to our status
    let paymentStatus = 'PENDING';
    let orderStatus = null;

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        paymentStatus = 'PAID';
        orderStatus = 'PROCESSING';
      }
    } else if (transaction_status === 'settlement') {
      paymentStatus = 'PAID';
      orderStatus = 'PROCESSING';
    } else if (transaction_status === 'pending') {
      paymentStatus = 'PENDING';
    } else if (['deny', 'expire', 'cancel'].includes(transaction_status)) {
      paymentStatus = 'FAILED';
      orderStatus = 'CANCELLED';
    }

    // Update order
    await OrderModel.updatePaymentStatus(order_id, {
      paymentStatus,
      orderStatus,
      paymentType: payment_type,
      paidAt: paymentStatus === 'PAID' ? new Date() : null,
    });

    console.log('✅ Payment status updated:', {
      orderId: order_id,
      paymentStatus,
      orderStatus,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Payment webhook error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

#### 3.5 Testing Checklist

```
✅ Sandbox Testing:
- [ ] Credit Card payment
- [ ] GoPay payment
- [ ] QRIS payment
- [ ] Virtual Account (BCA, BNI, Mandiri)
- [ ] Webhook receives notifications
- [ ] Order status updates correctly

✅ Production Testing:
- [ ] Use real payment methods (small amounts)
- [ ] Test all payment channels
- [ ] Verify webhook works with HTTPS
- [ ] Check transaction in Midtrans dashboard
- [ ] Test refund flow
```

### Deliverables:
- ✅ Midtrans production account verified
- ✅ Production API keys configured
- ✅ Signature verification implemented
- ✅ All payment methods tested
- ✅ Webhook working correctly

---

## 📋 MILESTONE 4: RajaOngkir API Integration

### Objectives:
- Get RajaOngkir API key
- Replace mock shipping calculator
- Implement real-time shipping rates
- Add multiple courier options

### Tasks:

#### 4.1 RajaOngkir Account Setup

**Steps:**
```
1. Register Account:
   - Visit: https://rajaongkir.com/akun/daftar
   - Choose: Starter Plan (Rp 25.000/bulan) or Pro (Rp 75.000/bulan)
   
2. Get API Key:
   - Dashboard > API Key
   - Copy your API key
   
3. Available Features:
   Starter:
   - ✅ JNE, POS, TIKI
   - ✅ Cost calculation
   - ✅ City/subdistrict list
   
   Pro (Recommended):
   - ✅ All couriers (JNE, POS, TIKI, RPX, ESL, PANDU, J&T, SiCepat, etc)
   - ✅ Waybill tracking
   - ✅ International shipping
```

#### 4.2 Create RajaOngkir Service

**Create `src/lib/rajaongkir.js`:**
```javascript
import axios from 'axios';

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
const RAJAONGKIR_BASE_URL = 'https://pro.rajaongkir.com/api'; // or 'https://api.rajaongkir.com/starter' for Starter plan

class RajaOngkirService {
  constructor() {
    this.client = axios.create({
      baseURL: RAJAONGKIR_BASE_URL,
      headers: {
        key: RAJAONGKIR_API_KEY,
      },
    });
  }

  // Get all provinces
  async getProvinces() {
    try {
      const response = await this.client.get('/province');
      return response.data.rajaongkir.results;
    } catch (error) {
      console.error('❌ RajaOngkir getProvinces error:', error);
      throw error;
    }
  }

  // Get cities by province
  async getCities(provinceId) {
    try {
      const response = await this.client.get('/city', {
        params: { province: provinceId },
      });
      return response.data.rajaongkir.results;
    } catch (error) {
      console.error('❌ RajaOngkir getCities error:', error);
      throw error;
    }
  }

  // Get subdistricts by city (Pro plan only)
  async getSubdistricts(cityId) {
    try {
      const response = await this.client.get('/subdistrict', {
        params: { city: cityId },
      });
      return response.data.rajaongkir.results;
    } catch (error) {
      console.error('❌ RajaOngkir getSubdistricts error:', error);
      throw error;
    }
  }

  // Calculate shipping cost
  async getCost({
    origin, // city ID or subdistrict ID
    destination, // city ID or subdistrict ID
    weight, // in grams
    courier, // 'jne', 'pos', 'tiki', 'jnt', 'sicepat', etc
  }) {
    try {
      const response = await this.client.post('/cost', {
        origin,
        destination,
        weight,
        courier,
      });

      const results = response.data.rajaongkir.results;
      
      if (!results || results.length === 0) {
        throw new Error('No shipping cost available');
      }

      // Transform to our format
      return results[0].costs.map(cost => ({
        courier: results[0].code.toUpperCase(),
        courierName: results[0].name,
        service: cost.service,
        description: cost.description,
        cost: cost.cost[0].value,
        etd: cost.cost[0].etd,
      }));
    } catch (error) {
      console.error('❌ RajaOngkir getCost error:', error);
      throw error;
    }
  }

  // Get all available shipping options
  async getAllShippingOptions({ origin, destination, weight }) {
    try {
      const couriers = ['jne', 'pos', 'tiki', 'jnt', 'sicepat', 'anteraja'];
      
      const results = await Promise.allSettled(
        couriers.map(courier =>
          this.getCost({ origin, destination, weight, courier })
        )
      );

      const allOptions = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allOptions.push(...result.value);
        } else {
          console.warn(`⚠️ Failed to get cost for ${couriers[index]}:`, result.reason);
        }
      });

      return allOptions;
    } catch (error) {
      console.error('❌ getAllShippingOptions error:', error);
      throw error;
    }
  }

  // Track waybill (Pro plan only)
  async trackWaybill(waybill, courier) {
    try {
      const response = await this.client.post('/waybill', {
        waybill,
        courier,
      });

      return response.data.rajaongkir.result;
    } catch (error) {
      console.error('❌ trackWaybill error:', error);
      throw error;
    }
  }
}

export default new RajaOngkirService();
```

#### 4.3 Create API Endpoints

**Create `src/app/api/shipping/provinces/route.js`:**
```javascript
import { NextResponse } from 'next/server';
import rajaOngkir from '@/lib/rajaongkir';

export async function GET() {
  try {
    const provinces = await rajaOngkir.getProvinces();
    return NextResponse.json({ success: true, data: provinces });
  } catch (error) {
    console.error('Get provinces error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get provinces' },
      { status: 500 }
    );
  }
}
```

**Create `src/app/api/shipping/cities/route.js`:**
```javascript
import { NextResponse } from 'next/server';
import rajaOngkir from '@/lib/rajaongkir';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get('province');

    if (!provinceId) {
      return NextResponse.json(
        { success: false, message: 'Province ID is required' },
        { status: 400 }
      );
    }

    const cities = await rajaOngkir.getCities(provinceId);
    return NextResponse.json({ success: true, data: cities });
  } catch (error) {
    console.error('Get cities error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get cities' },
      { status: 500 }
    );
  }
}
```

**Update `src/app/api/shipping/cost/route.js`:**
```javascript
import { NextResponse } from 'next/server';
import rajaOngkir from '@/lib/rajaongkir';

export async function POST(request) {
  try {
    const { origin, destination, weight } = await request.json();

    // Validation
    if (!origin || !destination || !weight) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get all shipping options
    const options = await rajaOngkir.getAllShippingOptions({
      origin,
      destination,
      weight,
    });

    return NextResponse.json({
      success: true,
      data: {
        origin,
        destination,
        weight,
        options,
      },
    });
  } catch (error) {
    console.error('Calculate shipping cost error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to calculate shipping cost' },
      { status: 500 }
    );
  }
}
```

#### 4.4 Update Shipping Address Model

**Update Prisma schema to store city/province IDs:**
```prisma
model ShippingAddress {
  id          String   @id @default(uuid())
  userId      String
  name        String
  phone       String
  address     String
  city        String
  cityId      String   // RajaOngkir city ID
  province    String
  provinceId  String   // RajaOngkir province ID
  postalCode  String
  label       String   @default("Home")
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
  orders      Order[]
  
  @@index([userId])
  @@index([cityId])
}
```

#### 4.5 Update Address Form Component

**Update `src/components/address/AddressForm.jsx` to use RajaOngkir data:**
```javascript
// Add province/city selectors that fetch from RajaOngkir API
const [provinces, setProvinces] = useState([]);
const [cities, setCities] = useState([]);

useEffect(() => {
  fetchProvinces();
}, []);

const fetchProvinces = async () => {
  const response = await fetch('/api/shipping/provinces');
  const data = await response.json();
  if (data.success) {
    setProvinces(data.data);
  }
};

const handleProvinceChange = async (provinceId) => {
  setFormData({ ...formData, provinceId, cityId: '' });
  const response = await fetch(`/api/shipping/cities?province=${provinceId}`);
  const data = await response.json();
  if (data.success) {
    setCities(data.data);
  }
};
```

### Deliverables:
- ✅ RajaOngkir API integrated
- ✅ Real shipping cost calculation
- ✅ Province/city selection from API
- ✅ Multiple courier options
- ✅ Accurate delivery estimates

---

## 📋 MILESTONE 5: Security & Error Handling

### Objectives:
- Implement comprehensive error handling
- Add request validation
- Setup logging
- Security hardening

### Tasks:

#### 5.1 Environment Variable Validation

**Create `src/lib/validateEnv.js`:**
```javascript
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'MIDTRANS_SERVER_KEY',
  'MIDTRANS_CLIENT_KEY',
  'RAJAONGKIR_API_KEY',
];

export function validateEnvironment() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
  
  console.log('✅ All required environment variables are set');
}
```

#### 5.2 Error Logging Service

**Create `src/lib/logger.js`:**
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

#### 5.3 API Error Handler Middleware

**Create `src/lib/apiErrorHandler.js`:**
```javascript
import { NextResponse } from 'next/server';
import logger from './logger';

export function handleApiError(error, context = {}) {
  logger.error('API Error', {
    message: error.message,
    stack: error.stack,
    ...context,
  });

  if (error.code === 'P2002') {
    return NextResponse.json(
      { success: false, message: 'Duplicate entry' },
      { status: 409 }
    );
  }

  if (error.code === 'P2025') {
    return NextResponse.json(
      { success: false, message: 'Record not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { success: false, message: 'Internal server error' },
    { status: 500 }
  );
}
```

#### 5.4 Rate Limiting

**Install dependencies:**
```bash
npm install express-rate-limit
```

**Create `src/middleware/rateLimit.js`:**
```javascript
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 payment requests per minute
});
```

#### 5.5 Input Validation

**Install Zod:**
```bash
npm install zod
```

**Create validation schemas in `src/lib/validations.js`:**
```javascript
import { z } from 'zod';

export const orderSchema = z.object({
  shippingAddressId: z.string().uuid(),
  shipping: z.object({
    courier: z.string(),
    service: z.string(),
    cost: z.number().positive(),
    etd: z.string(),
  }),
  items: z.array(
    z.object({
      variantId: z.string().uuid(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ).min(1),
  voucherCode: z.string().optional(),
});

export const addressSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().regex(/^(\+62|62|0)[0-9]{9,12}$/),
  address: z.string().min(10).max(500),
  cityId: z.string(),
  provinceId: z.string(),
  postalCode: z.string().regex(/^[0-9]{5}$/),
});
```

### Deliverables:
- ✅ Comprehensive error handling
- ✅ Request validation with Zod
- ✅ Logging system with Winston
- ✅ Rate limiting implemented
- ✅ Environment validation

---

## 📋 MILESTONE 6: Testing & Performance

### Objectives:
- Load testing
- Payment flow testing
- Shipping calculation testing
- Performance optimization

### Testing Checklist:
```
✅ Database Performance:
- [ ] Query response times < 100ms
- [ ] Connection pooling working
- [ ] Indexes used correctly
- [ ] No N+1 queries

✅ Payment Integration:
- [ ] All payment methods work
- [ ] Webhook receives notifications
- [ ] Order status updates correctly
- [ ] Refund flow works

✅ Shipping Integration:
- [ ] Cost calculation accurate
- [ ] All couriers available
- [ ] Delivery estimates correct
- [ ] Address validation works

✅ Order Flow:
- [ ] Cart to checkout smooth
- [ ] Stock validation working
- [ ] B2B pricing correct
- [ ] Voucher application works

✅ Load Testing:
- [ ] 100 concurrent users
- [ ] Response time < 500ms
- [ ] No memory leaks
- [ ] Database connections stable
```

### Deliverables:
- ✅ All tests passing
- ✅ Performance benchmarks met
- ✅ No critical bugs
- ✅ Load tested successfully

---

## 📋 MILESTONE 7: Deployment & Monitoring

### Objectives:
- Deploy to production
- Setup monitoring
- Configure CI/CD
- Documentation

### Recommended Hosting:

**Option A: Vercel (Recommended for Next.js)**
```
✅ Automatic deployments from Git
✅ Edge network (fast globally)
✅ Free SSL certificates
✅ Environment variables management
✅ Preview deployments

Pricing: 
- Hobby: Free (100GB bandwidth)
- Pro: $20/month (1TB bandwidth)
```

**Option B: Railway**
```
✅ Full-stack deployment
✅ PostgreSQL included
✅ Auto-scaling
✅ Simple deployment

Pricing: $5-20/month
```

### Deployment Steps:

```bash
# 1. Build production
npm run build

# 2. Test production build locally
npm start

# 3. Deploy to Vercel
npx vercel --prod

# 4. Configure environment variables in Vercel dashboard

# 5. Setup custom domain
# Add DNS records pointing to Vercel
```

### Monitoring Setup:

**1. Sentry (Error Tracking):**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**2. Vercel Analytics:**
- Enable in Vercel dashboard
- Track Web Vitals
- Monitor performance

**3. Database Monitoring:**
- Supabase Dashboard
- Query performance
- Connection stats

### Deliverables:
- ✅ Production deployment live
- ✅ Custom domain configured
- ✅ Monitoring active
- ✅ Documentation complete
- ✅ CI/CD pipeline working

---

## 💰 COST ESTIMATION

### Monthly Costs:

| Service | Plan | Cost |
|---------|------|------|
| PostgreSQL (Supabase) | Free Tier | Rp 0 |
| Hosting (Vercel) | Hobby | Rp 0 |
| RajaOngkir | Pro | Rp 75.000 |
| Midtrans | Pay per transaction | 2-3% fee |
| Domain (.com) | Annual | ~Rp 150.000/year |
| **Total** | | **~Rp 90.000/month** |

### Scaling Costs:

**When you outgrow free tiers:**
- Supabase Pro: $25/month (~Rp 400.000)
- Vercel Pro: $20/month (~Rp 320.000)
- Total: ~Rp 800.000/month

---

## 🎯 QUICK START GUIDE

### Day 1: Database Setup
```bash
1. Create Supabase account
2. Get connection string
3. Update .env
4. Run: npx prisma db push
5. Run: npx prisma db seed
6. Test: npx prisma studio
```

### Day 2-3: Midtrans Setup
```bash
1. Register Midtrans merchant
2. Get production keys (after verification)
3. Update environment variables
4. Test with sandbox first
5. Test production with small amounts
```

### Day 4-5: RajaOngkir Integration
```bash
1. Subscribe to RajaOngkir Pro
2. Get API key
3. Implement shipping service
4. Update address form
5. Test shipping calculator
```

### Day 6-7: Security & Testing
```bash
1. Add error handling
2. Implement rate limiting
3. Add logging
4. Run tests
5. Load testing
```

### Day 8-9: Deployment
```bash
1. Deploy to Vercel
2. Configure domain
3. Setup monitoring
4. Final testing
5. Go live! 🚀
```

---

## 📚 RESOURCES

### Documentation:
- [Supabase Docs](https://supabase.com/docs)
- [Midtrans Docs](https://docs.midtrans.com)
- [RajaOngkir Docs](https://rajaongkir.com/dokumentasi)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Support:
- Midtrans Support: support@midtrans.com
- RajaOngkir Support: support@rajaongkir.com
- Supabase Discord: https://discord.supabase.com

---

## ✅ COMPLETION CHECKLIST

```
Phase 1: Foundation
- [ ] PostgreSQL production database
- [ ] Connection pooling configured
- [ ] Database indexes added
- [ ] Backup strategy implemented

Phase 2: Payment
- [ ] Midtrans production account verified
- [ ] Production API keys configured
- [ ] Signature verification implemented
- [ ] All payment methods tested

Phase 3: Shipping
- [ ] RajaOngkir API integrated
- [ ] Real shipping cost calculation
- [ ] Province/city selection working
- [ ] Multiple courier options

Phase 4: Security
- [ ] Error handling implemented
- [ ] Request validation with Zod
- [ ] Rate limiting active
- [ ] Logging configured

Phase 5: Deployment
- [ ] Production deployment
- [ ] Custom domain
- [ ] Monitoring active
- [ ] Documentation complete
```

---

**Ready to start?** Mulai dari Milestone 1! 🚀

Ada pertanyaan? Butuh bantuan implementasi? Just ask! 💪
