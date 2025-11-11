# Vercel Environment Variables Setup Script
# This script helps you set up all required environment variables for production

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   MOTIV COMPANY - Vercel Environment Setup" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Function to generate NEXTAUTH_SECRET
function Generate-NextAuthSecret {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

Write-Host "Checklist Environment Variables yang Dibutuhkan:" -ForegroundColor Yellow
Write-Host ""

Write-Host "  [ ] DATABASE_URL (dari Supabase)" -ForegroundColor Gray
Write-Host "  [ ] DIRECT_URL (dari Supabase)" -ForegroundColor Gray
Write-Host "  [ ] NEXTAUTH_SECRET (auto-generate)" -ForegroundColor Gray
Write-Host "  [ ] NEXTAUTH_URL (domain production)" -ForegroundColor Gray
Write-Host ""

# Generate NEXTAUTH_SECRET
$nextAuthSecret = Generate-NextAuthSecret

Write-Host "NEXTAUTH_SECRET telah di-generate!" -ForegroundColor Green
Write-Host ""

Write-Host "---------------------------------------------------" -ForegroundColor DarkGray
Write-Host "COPY Environment Variables berikut ke Vercel:" -ForegroundColor White
Write-Host "---------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# Template environment variables
$envTemplate = @"
# ==================================================
# DATABASE (dari Supabase)
# ==================================================

Name:  DATABASE_URL
Value: postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

Name:  DIRECT_URL
Value: postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# GANTI:
#    [project-ref] = Project reference dari Supabase
#    [password]    = Database password dari Supabase
#
# Cara mendapatkan:
#    1. Login ke https://supabase.com
#    2. Pilih project "Motiv Company"
#    3. Settings -> Database -> Connection String


# ==================================================
# NEXTAUTH
# ==================================================

Name:  NEXTAUTH_SECRET
Value: $nextAuthSecret

Name:  NEXTAUTH_URL
Value: https://motivcompany.vercel.app

# SESUAIKAN domain production jika berbeda


# ==================================================
# MIDTRANS (Optional - untuk payment gateway)
# ==================================================

Name:  MIDTRANS_SERVER_KEY
Value: [your-midtrans-server-key]

Name:  MIDTRANS_CLIENT_KEY
Value: [your-midtrans-client-key]

Name:  MIDTRANS_IS_PRODUCTION
Value: false

# Cara mendapatkan:
#    1. Login ke https://dashboard.midtrans.com
#    2. Settings -> Access Keys
#    3. Copy Server Key dan Client Key (Sandbox untuk testing)

"@

Write-Host $envTemplate
Write-Host ""

# Save to file
$envTemplate | Out-File -FilePath "vercel-env-template.txt" -Encoding UTF8

Write-Host "---------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Template disimpan di: vercel-env-template.txt" -ForegroundColor Green
Write-Host "---------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

Write-Host "LANGKAH-LANGKAH SET UP DI VERCEL:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Buka: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "  2. Pilih project: Motiv-Company" -ForegroundColor White
Write-Host "  3. Klik: Settings -> Environment Variables" -ForegroundColor White
Write-Host "  4. Untuk setiap variable di atas:" -ForegroundColor White
Write-Host "     - Klik Add New" -ForegroundColor Gray
Write-Host "     - Masukkan Name dan Value" -ForegroundColor Gray
Write-Host "     - Environment: Production, Preview, Development (centang semua)" -ForegroundColor Gray
Write-Host "     - Klik Save" -ForegroundColor Gray
Write-Host "  5. Setelah semua di-set, klik tab Deployments" -ForegroundColor White
Write-Host "  6. Klik deployment terakhir -> Redeploy" -ForegroundColor White
Write-Host ""

Write-Host "PENTING:" -ForegroundColor Red
Write-Host "  - Jangan commit file vercel-env-template.txt ke Git!" -ForegroundColor Yellow
Write-Host "  - Simpan NEXTAUTH_SECRET di tempat aman!" -ForegroundColor Yellow
Write-Host "  - Ganti [project-ref] dan [password] dengan nilai asli!" -ForegroundColor Yellow
Write-Host ""

Write-Host "Setup selesai! Lanjutkan ke Vercel Dashboard." -ForegroundColor Green
Write-Host ""

