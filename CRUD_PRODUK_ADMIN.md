#  DOKUMENTASI CRUD PRODUK - ADMIN PANEL

##  STATUS: CRUD LENGKAP & PRODUCTION READY

---

##  FITUR CRUD YANG TERSEDIA

### 1.  CREATE - Tambah Produk Baru

**File**: \src/app/admin/products/create/page.js\  
**Route**: \/admin/products/create\  
**API Endpoint**: \POST /api/admin/products\

#### Form Fields:
-  **Nama Produk** (required) - Text input
-  **Deskripsi** (required) - Textarea, 4 rows
-  **Kategori** (required) - Dropdown select
  - Arabica
  - Robusta
  - Blend
  - Instant
-  **Gambar Produk** - Multiple URLs
  - Dynamic add/remove fields
  - Gambar pertama = gambar utama
-  **Varian Produk** (required) - Multiple variants
  - Size (contoh: 100g, 250g, 500g, 1kg)
  - Price (Rp)
  - Stock (unit)
  - Add/remove varian
  - Minimal 1 varian lengkap

#### Validasi:
-  Semua field required terisi
-  Minimal 1 varian lengkap (size, price, stock)
-  Price & stock harus number valid
-  Images optional tapi jika diisi harus URL valid

#### Response Success:
\\\json
{
  "success": true,
  "message": "Produk berhasil dibuat",
  "product": {
    "id": "uuid",
    "name": "Kopi Arabica Gayo",
    "description": "...",
    "category": "ARABICA",
    "images": ["url1", "url2"],
    "variants": [
      {
        "id": "uuid",
        "size": "100g",
        "price": 50000,
        "stock": 100
      }
    ]
  }
}
\\\

---

### 2.  READ - Lihat & Cari Produk

**File**: \src/app/admin/products/page.js\  
**Route**: \/admin/products\  
**API Endpoint**: \GET /api/admin/products\

#### Fitur:
-  **Grid View** - Responsive 1/2/3 columns
-  **Search** - By nama produk (real-time)
-  **Filter** - By kategori (Arabica/Robusta/Blend/Instant)
-  **Display Info**:
  - Product image (primary)
  - Name & description
  - Category badge
  - All variants with prices
  - Stock warning (< 10)
-  **Actions**: Edit & Delete buttons per product
-  **Empty State**: Friendly message jika no products
-  **Loading State**: Loading spinner

#### Search & Filter:
\\\
Query Parameters:
?search=arabica          // Search by name
?category=ARABICA        // Filter by category
?limit=50                // Items per page
\\\

#### Card Display:
- Image dengan aspect-square
- Category badge (top-right)
- Name (bold, 1 line)
- Description (2 lines, ellipsis)
- Variants preview (max 2, + more indicator)
- Stock warning badge (yellow)
- Edit button (blue)
- Delete button (red)

---

### 3.  UPDATE - Edit Produk

**File**: \src/app/admin/products/[id]/edit/page.js\  
**Route**: \/admin/products/[id]/edit\  
**API Endpoints**: 
- \GET /api/admin/products/[id]\ (load data)
- \PUT /api/admin/products/[id]\ (update)

#### Fitur:
-  **Auto-load** existing product data
-  **Edit semua field** yang ada di CREATE
-  **Manage Variants**:
  - Edit existing variants (preserve ID)
  - Add new variants
  - Remove variants (min 1)
-  **Manage Images**:
  - Edit existing image URLs
  - Add new images
  - Remove images
-  **Loading States**: 
  - Loading data
  - Saving changes

#### Flow:
1. Fetch product by ID
2. Populate form dengan existing data
3. User edit fields
4. Validation sama seperti CREATE
5. PUT request dengan updated data
6. Success  redirect ke /admin/products

#### Update Variants Logic:
- Existing variant dengan ID  UPDATE
- New variant tanpa ID  CREATE
- Removed variant  DELETE (cascade)

---

### 4.  DELETE - Hapus Produk

**File**: \src/app/admin/products/page.js\ (modal)  
**API Endpoint**: \DELETE /api/admin/products/[id]\

#### Fitur:
-  **Delete Button** pada setiap product card
-  **Confirmation Modal**:
  - Warning icon ()
  - Product name display
  - "Tindakan tidak dapat dibatalkan" warning
  - Cancel button (gray)
  - Confirm button (red)
-  **Loading State**: "Menghapus..." saat processing
-  **Success Feedback**: Alert & auto-refresh list
-  **Cascade Delete**: Variants otomatis terhapus

#### Modal Flow:
1. Click "Hapus" button
2. Show modal dengan product name
3. User confirm/cancel
4. If confirm  DELETE request
5. Success  close modal & refresh list

---

##  API ENDPOINTS SUMMARY

### 1. Create Product
\\\
POST /api/admin/products
Authorization: Bearer token (Admin only)
Content-Type: application/json

Body:
{
  "name": "string",
  "description": "string",
  "category": "ARABICA|ROBUSTA|BLEND|INSTANT",
  "images": ["url1", "url2"],
  "variants": [
    {
      "size": "string",
      "price": number,
      "stock": number
    }
  ]
}
\\\

### 2. Get All Products (Admin)
\\\
GET /api/admin/products?search=&category=&limit=
Authorization: Bearer token (Admin only)

Response:
{
  "success": true,
  "products": [...],
  "total": number,
  "page": number
}
\\\

### 3. Get Product by ID
\\\
GET /api/admin/products/[id]
Authorization: Bearer token (Admin only)

Response:
{
  "success": true,
  "product": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "category": "string",
    "images": [],
    "variants": [],
    "createdAt": "date",
    "updatedAt": "date"
  }
}
\\\

### 4. Update Product
\\\
PUT /api/admin/products/[id]
Authorization: Bearer token (Admin only)
Content-Type: application/json

Body: (sama seperti POST, plus variant IDs untuk update)
\\\

### 5. Delete Product
\\\
DELETE /api/admin/products/[id]
Authorization: Bearer token (Admin only)

Response:
{
  "success": true,
  "message": "Produk berhasil dihapus"
}
\\\

---

##  SECURITY & AUTHORIZATION

### Middleware Protection:
-  All admin product routes protected by AdminLayout
-  API endpoints check session & role === 'ADMIN'
-  Unauthorized  403 Forbidden

### Data Validation:
-  Server-side validation di API
-  Client-side validation di forms
-  Type checking (price: number, stock: int)
-  Required fields enforcement

---

##  DATABASE SCHEMA

### Product Model:
\\\prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  description String
  category    String
  images      String[]
  variants    ProductVariant[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ProductVariant {
  id        String   @id @default(uuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  size      String
  price     Float
  stock     Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
\\\

### Cascade Delete:
-  Hapus Product  Variants otomatis terhapus
-  Prisma onDelete: Cascade

---

##  UI/UX FEATURES

### Grid View:
-  Responsive: 1 col (mobile)  2 cols (tablet)  3 cols (desktop)
-  Card hover effects (shadow)
-  Image fallback ( emoji)
-  Category badge dengan colors

### Forms:
-  Clean, modern design
-  Focus states (ring-2 ring-coffee-500)
-  Validation feedback
-  Loading states
-  Back button navigation

### Buttons:
-  Primary actions: Coffee-600
-  Edit: Blue-600
-  Delete: Red-600
-  Secondary: Gray-100
-  Hover effects
-  Disabled states

### Feedback:
-  Success alerts
-  Error alerts
-  Loading spinners
-  Empty states
-  Stock warnings

---

##  TESTING CHECKLIST

### CREATE Testing:
- [x] Form semua field terisi
- [x] Validation error messages
- [x] Multiple images
- [x] Multiple variants
- [x] Success redirect
- [x] API response 201

### READ Testing:
- [x] Display all products
- [x] Search functionality
- [x] Category filter
- [x] Pagination (if needed)
- [x] Empty state
- [x] Stock warnings

### UPDATE Testing:
- [x] Load existing data
- [x] Edit all fields
- [x] Add/remove variants
- [x] Add/remove images
- [x] Success feedback
- [x] API response 200

### DELETE Testing:
- [x] Confirmation modal
- [x] Cancel action
- [x] Confirm delete
- [x] Cascade delete variants
- [x] Refresh list
- [x] API response 200

---

##  DEPLOYMENT READY

### Status:  PRODUCTION READY

All CRUD operations tested and working:
-  CREATE - Form lengkap & validation
-  READ - Search, filter, display
-  UPDATE - Edit all fields
-  DELETE - With confirmation

### Performance:
-  Optimized queries
-  Lazy loading
-  Efficient re-renders
-  Loading states

### Security:
-  Admin-only access
-  Session validation
-  Input sanitization
-  CSRF protection (Next.js)

---

**Generated**: 2025-11-02 22:05:09
**Status**:  CRUD PRODUK LENGKAP & SIAP PRODUKSI
