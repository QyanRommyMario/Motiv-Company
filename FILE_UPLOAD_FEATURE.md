# File Upload Feature

## Overview

Sistem upload file lokal untuk gambar Stories dan Products. File disimpan di folder `public/uploads` dan path-nya disimpan di database.

## Features

✅ Upload gambar dari file explorer (lokal)
✅ Support format: PNG, JPG, GIF, WEBP
✅ Maximum file size: 5MB
✅ Image preview sebelum upload
✅ Alternatif input URL (tetap bisa pakai URL)
✅ Multiple image upload untuk Products
✅ Validasi file type dan size
✅ Secure upload (hanya admin)

## API Endpoint

### POST /api/upload

Upload single image file

**Authentication**: Admin only

**Request**: FormData with `file` field

**Response**:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "url": "/uploads/1234567890-abc123.jpg"
}
```

**Validations**:

- File type: Must be image (jpeg, jpg, png, webp, gif)
- File size: Maximum 5MB
- Authentication: User must be ADMIN

**File Storage**:

- Location: `public/uploads/`
- Naming: `{timestamp}-{random}.{extension}`
- Example: `1730635890123-abc7def.jpg`

## Usage

### Stories Page

1. Klik "Add New Story" atau Edit story
2. Pilih salah satu:
   - Klik area upload untuk browse file dari komputer
   - Atau paste URL di input box
3. Preview gambar muncul otomatis
4. Klik tombol X merah untuk hapus preview
5. Submit form

### Products Page (Create/Edit)

1. Klik "Tambah Produk" atau Edit produk
2. Untuk setiap gambar (multiple images):
   - Klik area upload untuk browse file
   - Atau paste URL
3. Preview muncul untuk setiap gambar
4. Gambar pertama = gambar utama produk
5. Bisa tambah lebih banyak gambar dengan tombol "+ Tambah Gambar"
6. Submit form

## File Structure

```
motiv/
  public/
    uploads/           # Folder untuk uploaded files (git ignored)
      1730635890-abc.jpg
      1730635891-def.png
  src/
    app/
      api/
        upload/
          route.js     # Upload API endpoint
      admin/
        stories/
          page.js      # Stories dengan upload
        products/
          create/
            page.js    # Create product dengan upload
          [id]/
            edit/
              page.js  # Edit product dengan upload
```

## Security

- ✅ Authentication check (admin only)
- ✅ File type validation (images only)
- ✅ File size limit (5MB)
- ✅ Unique filename generation
- ✅ Stored in public folder (accessible via URL)

## Notes

- File yang diupload disimpan permanen di `public/uploads/`
- Tidak ada auto-delete untuk file orphan (file yang tidak terpakai)
- File di folder `public/uploads` di-ignore dari git
- Untuk production, pertimbangkan menggunakan cloud storage (AWS S3, Cloudinary, dll)

## Future Improvements

- [ ] Compress image otomatis
- [ ] Generate thumbnail
- [ ] Delete orphan files
- [ ] Cloud storage integration
- [ ] Bulk upload
- [ ] Drag & drop interface
- [ ] Image cropping/editing
