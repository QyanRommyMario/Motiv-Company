# 🚀 QUICK START - Production Setup

> Panduan cepat untuk setup production environment

---

## 📝 PREREQUISITES CHECKLIST

Sebelum mulai, pastikan Anda punya:

```
✅ Akun email untuk registrasi layanan
✅ Nomor telepon untuk verifikasi
✅ Dokumen bisnis (untuk Midtrans):
   - KTP pemilik
   - NPWP (optional tapi recommended)
   - Rekening bank atas nama bisnis/pribadi
✅ Kartu kredit/debit (untuk subscribe RajaOngkir)
✅ Domain (optional, bisa pakai .vercel.app dulu)
```

---

## ⚡ FASTEST PATH (Recommended)

### Step 1: Database (30 menit)
```bash
# 1. Buka https://supabase.com
# 2. Sign up dengan GitHub
# 3. New Project:
   - Name: motiv-coffee
   - Database Password: [Generate & SIMPAN!]
   - Region: Southeast Asia (Singapore)
   
# 4. Wait ~2 menit untuk provisioning

# 5. Copy connection string
# Settings > Database > Connection string > URI
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# 6. Update .env
DATABASE_URL="[paste connection string]"

# 7. Push schema
npx prisma db push

# 8. Verify
npx prisma studio
# Buka http://localhost:5555 - harus bisa lihat tables
```

**✅ Done! Database ready.**

---

### Step 2: Midtrans (1-3 hari, karena verifikasi)

**Sandbox (Langsung bisa pakai):**
```bash
# 1. Buka https://dashboard.sandbox.midtrans.com/
# 2. Sign up
# 3. Settings > Access Keys
# 4. Copy Server Key & Client Key

# Update .env
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxx"
MIDTRANS_IS_PRODUCTION=false

# Test cards (sandbox):
# Success: 4811 1111 1111 1114
# Failure: 4911 1111 1111 1113
```

**Production (Setelah soft launch):**
```bash
# 1. Daftar di https://dashboard.midtrans.com/register
# 2. Isi data bisnis
# 3. Upload dokumen (KTP, rekening bank)
# 4. Tunggu verifikasi 1-3 hari kerja
# 5. Setelah approved, ganti ke production keys
```

**✅ Sandbox ready! Production nanti setelah testing.**

---

### Step 3: RajaOngkir (15 menit)

```bash
# 1. Buka https://rajaongkir.com/akun/daftar
# 2. Pilih paket:
   - Starter (Rp 25K/bulan): JNE, POS, TIKI only
   - Pro (Rp 75K/bulan): Semua kurir + tracking
   
# 3. Bayar via transfer/e-wallet
# 4. Setelah bayar, cek email untuk API key
# 5. Copy API key

# Update .env
RAJAONGKIR_API_KEY="xxxxxxxxxxxxx"

# Test (di browser atau Postman):
curl -X GET "https://pro.rajaongkir.com/api/province" \
  -H "key: YOUR-API-KEY"
  
# Harusnya return list provinsi
```

**✅ Shipping API ready!**

---

### Step 4: Deploy (30 menit)

```bash
# 1. Push code ke GitHub
git init
git add .
git commit -m "Production ready"
git branch -M main
git remote add origin https://github.com/yourusername/motiv-coffee.git
git push -u origin main

# 2. Deploy ke Vercel
# Buka https://vercel.com
# Sign up with GitHub
# New Project > Import motiv-coffee repo
# Add Environment Variables (copy dari .env)
# Deploy!

# 3. Domain (optional)
# Vercel dashboard > Settings > Domains
# Add: motiv-coffee.vercel.app (free)
# atau custom domain: motiv.coffee (bayar)
```

**✅ Live di internet!**

---

## 🎯 IMPLEMENTATION ORDER

Berikut urutan implementasi yang paling efisien:

### Phase 1: Core Setup (Hari 1-2)
```
Priority 1: Database Production
├─ ✅ Supabase setup
├─ ✅ Connection pooling
├─ ✅ Push schema with indexes
└─ ✅ Test CRUD operations

Priority 2: Deploy Vercel
├─ ✅ Push to GitHub
├─ ✅ Connect Vercel
├─ ✅ Add env variables
└─ ✅ First deployment
```

### Phase 2: Payment (Hari 3-4)
```
Priority 1: Midtrans Sandbox Testing
├─ ✅ Sandbox keys configured
├─ ✅ Test all payment methods
├─ ✅ Webhook working
└─ ✅ Order status updates

Priority 2: Production Registration
├─ ⏳ Register merchant account
├─ ⏳ Upload documents
├─ ⏳ Wait for verification (1-3 hari)
└─ ⏳ Get production keys (nanti)
```

### Phase 3: Shipping (Hari 5-6)
```
Priority 1: RajaOngkir Integration
├─ ✅ Subscribe & get API key
├─ ✅ Implement service layer
├─ ✅ Update address form
├─ ✅ Test shipping calculator
└─ ✅ Test all couriers

Priority 2: UI Improvements
├─ ✅ Province/city dropdown from API
├─ ✅ Real-time cost calculation
├─ ✅ Loading states
└─ ✅ Error handling
```

### Phase 4: Polish (Hari 7-8)
```
Priority 1: Security
├─ ✅ Error handling
├─ ✅ Input validation
├─ ✅ Rate limiting
└─ ✅ Logging

Priority 2: Testing
├─ ✅ End-to-end testing
├─ ✅ Payment flow
├─ ✅ Order completion
└─ ✅ Load testing
```

---

## 💡 PRO TIPS

### Database
```
✅ Pakai Supabase free tier dulu (500MB cukup untuk start)
✅ Enable connection pooling untuk better performance
✅ Buat backup otomatis (Supabase punya built-in)
✅ Monitor query performance di Supabase dashboard
```

### Midtrans
```
✅ Test pakai sandbox dulu sampai yakin semua works
✅ Prepare dokumen bisnis sebelum daftar production
✅ Aktifkan 2FA untuk keamanan account
✅ Set webhook URL ke HTTPS (required for production)
```

### RajaOngkir
```
✅ Mulai dengan Starter plan dulu (Rp 25K/bulan)
✅ Upgrade ke Pro (Rp 75K) kalau butuh lebih banyak kurir
✅ Cache hasil shipping calculation untuk reduce API calls
✅ Set timeout untuk API calls (max 10 detik)
```

### Deployment
```
✅ Pakai Vercel free tier (unlimited untuk personal project)
✅ Enable Vercel Analytics untuk monitor performance
✅ Set up preview deployments untuk testing
✅ Configure custom domain setelah soft launch
```

---

## 🔧 TROUBLESHOOTING

### Database connection error
```bash
# Check connection string format
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

# Test connection
npx prisma db pull

# If error, verify:
1. Password tidak ada karakter special yang perlu encoding
2. Host/port benar
3. Database exists
4. IP whitelist (Supabase: allow all 0.0.0.0/0)
```

### Midtrans webhook tidak received
```bash
# 1. Check webhook URL di Midtrans dashboard
# Must be HTTPS in production!
https://yourdomain.com/api/payment/notification

# 2. Test webhook manually dengan Postman
POST https://yourdomain.com/api/payment/notification
Headers: Content-Type: application/json
Body: {
  "order_id": "test-123",
  "transaction_status": "settlement",
  "fraud_status": "accept",
  "gross_amount": "100000"
}

# 3. Check server logs
# Vercel: Dashboard > Deployments > View Logs
```

### RajaOngkir API error
```bash
# Error 401: API key salah
# Solution: Double check API key di .env

# Error 400: Parameter salah
# Solution: Check format request (city ID harus string)

# Error 429: Rate limit exceeded
# Solution: Implement caching, atau upgrade plan

# Timeout
# Solution: Increase axios timeout, atau pakai fallback static data
```

### Deployment failed
```bash
# Build error di Vercel
# 1. Check build logs
# 2. Common issues:
   - Missing environment variables
   - Database connection in build time
   - TypeScript errors
   
# Solution:
# Add to next.config.js:
export default {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};
```

---

## 📊 MONITORING CHECKLIST

### After Deployment
```
✅ Health Checks
- [ ] Homepage loads
- [ ] Login works
- [ ] Products display
- [ ] Cart functions
- [ ] Checkout process
- [ ] Payment redirect
- [ ] Order creation
- [ ] Webhook receives

✅ Performance
- [ ] Page load < 3s
- [ ] API response < 500ms
- [ ] No console errors
- [ ] Database queries optimized

✅ Security
- [ ] HTTPS enabled
- [ ] Environment variables hidden
- [ ] API keys not exposed
- [ ] CORS configured
- [ ] Rate limiting active

✅ Monitoring
- [ ] Sentry error tracking
- [ ] Vercel analytics
- [ ] Database monitoring
- [ ] Uptime monitoring
```

---

## 💰 COST CALCULATOR

### Minimal Setup (Soft Launch)
```
Monthly Costs:
├─ PostgreSQL (Supabase Free)    : Rp 0
├─ Hosting (Vercel Free)          : Rp 0
├─ RajaOngkir Starter             : Rp 25.000
├─ Midtrans (2% transaction fee)  : Pay per transaction
└─ TOTAL                          : ~Rp 25.000/bulan + 2% per transaksi
```

### Growth Phase (100+ orders/bulan)
```
Monthly Costs:
├─ PostgreSQL (Supabase Free)     : Rp 0
├─ Hosting (Vercel Pro)           : Rp 320.000 (if >100GB bandwidth)
├─ RajaOngkir Pro                 : Rp 75.000
├─ Midtrans fees                  : ~Rp 300.000 (asumsi 15jt GMV)
├─ Domain (.com)                  : Rp 12.500 (150K/tahun)
└─ TOTAL                          : ~Rp 700.000/bulan
```

### Scale Phase (1000+ orders/bulan)
```
Monthly Costs:
├─ PostgreSQL (Supabase Pro)      : Rp 400.000
├─ Hosting (Vercel Pro)           : Rp 320.000
├─ RajaOngkir Pro                 : Rp 75.000
├─ Midtrans fees                  : ~Rp 3.000.000 (150jt GMV)
├─ Monitoring (Sentry)            : Rp 450.000
└─ TOTAL                          : ~Rp 4.200.000/bulan
```

---

## 🎓 LEARNING RESOURCES

### Video Tutorials
- [Supabase + Next.js](https://www.youtube.com/watch?v=dU7GwCOgvNY)
- [Midtrans Integration](https://www.youtube.com/watch?v=xxxx)
- [Deploy Next.js to Vercel](https://www.youtube.com/watch?v=xxxx)

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Midtrans API Docs](https://docs.midtrans.com)
- [RajaOngkir API Docs](https://rajaongkir.com/dokumentasi)

### Community Support
- [Next.js Discord](https://nextjs.org/discord)
- [Supabase Discord](https://discord.supabase.com)
- [Midtrans Forum](https://forum.midtrans.com)

---

## ✨ NEXT STEPS

**Hari ini:**
1. ✅ Buat account Supabase
2. ✅ Setup database
3. ✅ Test locally dengan production DB

**Besok:**
1. ✅ Deploy ke Vercel
2. ✅ Configure environment variables
3. ✅ Test di production URL

**Minggu depan:**
1. ✅ Subscribe RajaOngkir
2. ✅ Integrate shipping API
3. ✅ Full testing

**2 Minggu:**
1. ✅ Register Midtrans production
2. ✅ Complete verification
3. ✅ Switch to production keys
4. ✅ **SOFT LAUNCH!** 🚀

---

**Questions?** Check PRODUCTION_ROADMAP.md untuk detail lengkap setiap milestone!

**Ready to build?** Let's start with Milestone 1! 💪
