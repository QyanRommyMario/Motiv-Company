# Vercel Environment Variables Setup

## CRITICAL: Add this environment variable to Vercel Dashboard

Go to: https://vercel.com/qyanrommymario/motivcompany/settings/environment-variables

Add the following:

### DIRECT_URL (REQUIRED)
```
Key: DIRECT_URL
Value: postgresql://postgres:9O8VxKMNJHABzNXW@db.aaltkprawfanoajoevcp.supabase.co:5432/postgres
Environment: Production, Preview, Development
```

This uses the **direct connection** (port 5432) instead of pooler (port 6543) for better serverless compatibility.

### Current Variables (Keep These)
- ✅ DATABASE_URL (pooler connection)
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL

## Why DIRECT_URL?
Supabase pooler (PgBouncer) sometimes has issues with Prisma in serverless environments.
Using directUrl for migrations and direct queries solves this.

## After Adding:
1. Redeploy the application
2. Test /api/test-db endpoint
3. Verify login works
