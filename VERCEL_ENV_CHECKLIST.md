# VERCEL ENVIRONMENT VARIABLES CHECKLIST
# Copy these to Vercel Dashboard → Settings → Environment Variables

## ✅ REQUIRED Environment Variables:

### Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.aaltkprawfanoajoevcp:gs8ynqel74prbtxr@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.aaltkprawfanoajoevcp:gs8ynqel74prbtxr@db.aaltkprawfanoajoevcp.supabase.co:5432/postgres

### Supabase Storage (CRITICAL for file uploads)
NEXT_PUBLIC_SUPABASE_URL=https://aaltkprawfanoajoevcp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbHRrcHJhd2Zhbm9ham9ldmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzMTc2NzAsImV4cCI6MjA0Njg5MzY3MH0.MlwKYxRz3bPMVGCLBr6KW8yPp5DY7YC3-3ixQZRBjNE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbHRrcHJhd2Zhbm9ham9ldmNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTMxNzY3MCwiZXhwIjoyMDQ2ODkzNjcwfQ.Zn9Kq0HQHPPcqC0YF6bMxaLkD4TE4Ry5qYXmqhE9nGM

### NextAuth (Authentication)
NEXTAUTH_SECRET=QGT448AvJnJTO9K56fKSin8tlcEhEGCYnZ9BPNY3Xas=
NEXTAUTH_URL=https://motivcompany.vercel.app

### Payment Gateway (Midtrans)
MIDTRANS_SERVER_KEY=your-server-key-here
MIDTRANS_CLIENT_KEY=your-client-key-here
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-client-key-here
NEXT_PUBLIC_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js

---

## 🔧 HOW TO ADD IN VERCEL:

1. Go to: https://vercel.com/rommymario01-1763s-projects/motivcompany/settings/environment-variables

2. For EACH variable above:
   - Click "Add New"
   - Name: (copy from left side, e.g., DATABASE_URL)
   - Value: (copy from right side)
   - Environments: Check ALL (Production, Preview, Development)
   - Click "Save"

3. After adding ALL variables, redeploy:
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## ⚠️ CRITICAL VARIABLES (must be correct):

- ✅ SUPABASE_SERVICE_ROLE_KEY (for file uploads)
- ✅ DATABASE_URL (must have aws-1, not aws-0)
- ✅ NEXTAUTH_URL (must be https://motivcompany.vercel.app, not localhost)

---

## 🔍 VERIFY:

After setting env vars, check if they're loaded:
- Go to: https://motivcompany.vercel.app/api/diagnostics
- Should show all environment variables (without sensitive values)
