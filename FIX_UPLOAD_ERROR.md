# FIX SUPABASE UPLOAD ERROR - VERCEL ENV VARS

## Problem
Upload error: `signature verification failed` (status 403)

## Solution: Add/Update Supabase Keys di Vercel

### Step 1: Buka Vercel Project Settings
https://vercel.com/rommymario01-1763s-projects/motivcompany/settings/environment-variables

### Step 2: Pastikan 3 Environment Variables Ini Ada:

**1. NEXT_PUBLIC_SUPABASE_URL**
- Value: `https://aaltkprawfanoajoevcp.supabase.co`
- Environment: Production, Preview, Development

**2. NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbHRrcHJhd2Zhbm9ham9ldmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzMTc2NzAsImV4cCI6MjA0Njg5MzY3MH0.MlwKYxRz3bPMVGCLBr6KW8yPp5DY7YC3-3ixQZRBjNE`
- Environment: Production, Preview, Development

**3. SUPABASE_SERVICE_ROLE_KEY** ⚠️ (INI YANG PALING PENTING)
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbHRrcHJhd2Zhbm9ham9ldmNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTMxNzY3MCwiZXhwIjoyMDQ2ODkzNjcwfQ.Zn9Kq0HQHPPcqC0YF6bMxaLkD4TE4Ry5qYXmqhE9nGM`
- Environment: Production, Preview, Development

### Step 3: Setelah Add/Update
- Klik **Save**
- **REDEPLOY** (trigger dengan git push atau manual redeploy di Vercel dashboard)

---

## Alternative: Get Fresh Keys dari Supabase

Kalau keys di atas tidak work, ambil yang baru:

### Get Keys:
1. Buka https://supabase.com/dashboard/project/aaltkprawfanoajoevcp/settings/api
2. Copy:
   - **Project URL** → untuk `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (secret) → untuk `SUPABASE_SERVICE_ROLE_KEY`

3. Update di Vercel environment variables
4. Redeploy

---

## How to Redeploy After Adding Env Vars:

**Option A: Git Push (recommended)**
```bash
git commit --allow-empty -m "chore: trigger redeploy after updating Supabase keys"
git push
```

**Option B: Manual Redeploy**
1. Go to: https://vercel.com/rommymario01-1763s-projects/motivcompany/deployments
2. Click "..." on latest deployment
3. Click "Redeploy"

---

## Verification:
After redeploy, test upload:
1. Login ke https://motivcompany.vercel.app/admin
2. Go to Products atau Stories
3. Try upload image
4. Should work without 403 error ✅
