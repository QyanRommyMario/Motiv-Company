# 📦 Supabase Storage Setup untuk File Upload

## ⚡ Quick Setup (5 menit)

### Step 1: Buat Storage Bucket di Supabase

1. **Login ke Supabase Dashboard**

   - https://supabase.com/dashboard/project/aaltkprawfanoajoevcp

2. **Buka Storage Tab**

   - Klik menu **Storage** di sidebar kiri

3. **Create New Bucket**

   - Klik tombol **New bucket**
   - Isi form:
     ```
     Name: motiv-uploads
     Public bucket: ✅ CENTANG INI (agar file bisa diakses publik)
     File size limit: 5 MB
     Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
     ```
   - Klik **Create bucket**

4. **Set Bucket Policy (Public Access)**

   - Pilih bucket `motiv-uploads`
   - Klik **Policies** tab
   - Klik **New policy**
   - Pilih template **"Enable read access for all users"**
   - Atau buat manual:

     ```sql
     CREATE POLICY "Public Access"
     ON storage.objects FOR SELECT
     USING ( bucket_id = 'motiv-uploads' );

     CREATE POLICY "Admin Upload"
     ON storage.objects FOR INSERT
     WITH CHECK ( bucket_id = 'motiv-uploads' );
     ```

### Step 2: Get Supabase Keys

Keys sudah ada di `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://aaltkprawfanoajoevcp.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Cara cek keys:**

- Settings → API → Project URL (SUPABASE_URL)
- Settings → API → anon public key (ANON_KEY)
- Settings → API → service_role key (SERVICE_ROLE_KEY) ⚠️ SECRET!

### Step 3: Update Vercel Environment Variables

Di Vercel dashboard:
https://vercel.com/rommymario01-1763s-projects/motivcompany/settings/environment-variables

Tambahkan:

```
NEXT_PUBLIC_SUPABASE_URL = https://aaltkprawfanoajoevcp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **PENTING:** Redeploy setelah add env variables!

---

## 🎯 Cara Pakai

### Upload File dari Admin Panel

```javascript
// Frontend (Admin Dashboard)
const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (data.success) {
    console.log("File URL:", data.url);
    // URL format: https://aaltkprawfanoajoevcp.supabase.co/storage/v1/object/public/motiv-uploads/images/1234567890.jpg
  }
};
```

### URL yang Dikembalikan

```javascript
{
  "success": true,
  "message": "File uploaded successfully to Supabase Storage",
  "url": "https://aaltkprawfanoajoevcp.supabase.co/storage/v1/object/public/motiv-uploads/images/1731317670-abc123.jpg",
  "path": "images/1731317670-abc123.jpg"
}
```

---

## ✅ Keuntungan Supabase Storage

1. **Free Tier Generous**

   - 1 GB storage gratis
   - Unlimited bandwidth (fair use)
   - CDN built-in

2. **Serverless Friendly**

   - No filesystem needed
   - Works on Vercel/Netlify

3. **Persistent Storage**

   - File tidak hilang seperti `/tmp`
   - Backup otomatis

4. **CDN & Caching**

   - Global distribution
   - Fast image loading

5. **Security**
   - Row Level Security (RLS)
   - Public/private bucket options

---

## 🔧 Troubleshooting

### Error: "Bucket not found"

- Pastikan bucket `motiv-uploads` sudah dibuat di Supabase dashboard

### Error: "new row violates row-level security policy"

- Set bucket policy untuk public access (lihat Step 1.4)

### Error: "Invalid API key"

- Check environment variables
- Pastikan `NEXT_PUBLIC_SUPABASE_ANON_KEY` benar

### File tidak bisa diakses (403)

- Pastikan bucket **Public** ✅
- Check bucket policies

---

## 📊 File Structure di Storage

```
motiv-uploads/
  └── images/
      ├── 1731317670-abc123.jpg
      ├── 1731318000-xyz789.png
      └── ...
```

---

## 🚀 Next Steps

Setelah setup selesai:

1. ✅ Test upload di local: `npm run dev`
2. ✅ Commit & push ke GitHub
3. ✅ Add env vars di Vercel
4. ✅ Redeploy Vercel
5. ✅ Test upload di production

**File ready untuk production! 🎉**
