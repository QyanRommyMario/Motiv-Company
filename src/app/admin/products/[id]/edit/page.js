"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import Loading from "@/components/ui/Loading";

const categories = [
  { value: "ARABICA", label: "Arabica" },
  { value: "ROBUSTA", label: "Robusta" },
  { value: "BLEND", label: "Blend" },
  { value: "INSTANT", label: "Instant" },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "ARABICA",
    images: [""],
    features: [""],
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        const prod = data.product;

        console.log("📥 Loaded product:", prod);
        console.log("📦 Product variants:", prod.variants);

        setProduct(prod);
        setFormData({
          name: prod.name,
          description: prod.description,
          category: prod.category,
          images: prod.images && prod.images.length > 0 ? prod.images : [""],
          features:
            prod.features && prod.features.length > 0 ? prod.features : [""],
        });
        setImagePreviews(
          prod.images && prod.images.length > 0 ? prod.images : [""],
        );
        setVariants(prod.variants || []);
      } else {
        alert("Produk tidak ditemukan");
        router.push("/admin/products");
      }
    } catch (error) {
      console.error("❌ Failed to fetch product:", error);
      alert("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));

    const newPreviews = [...imagePreviews];
    newPreviews[index] = value;
    setImagePreviews(newPreviews);
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await response.json();
      if (data.success) {
        const newImages = [...formData.images];
        newImages[index] = data.url;
        setFormData((prev) => ({
          ...prev,
          images: newImages,
        }));

        const newPreviews = [...imagePreviews];
        newPreviews[index] = data.url;
        setImagePreviews(newPreviews);
      } else {
        alert(data.message || "Failed to upload image");
      }
    } catch (error) {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
    setImagePreviews([...imagePreviews, ""]);
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      images: newImages.length > 0 ? newImages : [""],
    }));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    // Convert numeric fields to proper types
    if (field === "stock" || field === "price") {
      newVariants[index][field] = value === "" ? "" : value;
    } else {
      newVariants[index][field] = value;
    }
    console.log(`🔄 Variant ${index + 1} ${field} changed to:`, newVariants[index][field]);
    console.log(`   Variant ID: ${newVariants[index].id}`, `Type: ${typeof newVariants[index][field]}`);
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", price: "", stock: "" }]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({
      ...prev,
      features: newFeatures,
    }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        features: newFeatures,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.description || !formData.category) {
      alert("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    // Validate variants
    const validVariants = variants.filter((v) => {
      const hasName = v.name && v.name.trim() !== "";
      const hasPrice = v.price !== "" && v.price !== null && v.price !== undefined;
      const hasStock = v.stock !== "" && v.stock !== null && v.stock !== undefined;
      return hasName && hasPrice && hasStock;
    });

    console.log("✅ Valid variants:", validVariants);
    
    if (validVariants.length === 0) {
      alert("Minimal 1 varian harus diisi lengkap");
      return;
    }

    // Filter out empty images
    const validImages = formData.images.filter((img) => img && img.trim());

    // Filter out empty features
    const validFeatures = formData.features.filter((feature) => feature.trim());

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        images: validImages,
        features: validFeatures,
        variants: validVariants.map((v) => ({
          id: v.id, // Keep existing ID if available
          name: v.name,
          price: parseFloat(v.price),
          stock: parseInt(v.stock),
        })),
      };

      console.log("📤 Sending update payload:", payload);
      console.log("📦 Variants to update:", payload.variants);

      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("📥 Update response:", data);

      if (response.ok) {
        alert("Produk berhasil diupdate!");
        // Refresh data before redirecting to show latest state
        await fetchProduct();
        setTimeout(() => {
          router.push("/admin/products");
        }, 500);
      } else {
        console.error("❌ Update failed:", data);
        alert(data.message || "Gagal mengupdate produk");
      }
    } catch (error) {
      console.error("❌ Update error:", error);
      alert("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <Loading />
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Produk tidak ditemukan</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Produk</h1>
          <p className="text-gray-600 mt-2">Update informasi produk</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Informasi Dasar
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nama Produk <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Kopi Arabica Gayo"
                  className="w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Deskripsi <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Deskripsi produk..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Kategori <span className="text-red-600">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Gambar Produk</h2>
              <button
                type="button"
                onClick={addImageField}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                + Tambah Gambar
              </button>
            </div>

            <div className="space-y-4">
              {formData.images.map((image, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Gambar {index + 1}{" "}
                      {index === 0 && (
                        <span className="text-blue-600">(Utama)</span>
                      )}
                    </h3>
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  {/* Image Preview */}
                  {imagePreviews[index] && (
                    <div className="mb-3 relative">
                      <img
                        src={imagePreviews[index]}
                        alt={`Preview ${index + 1}`}
                        className="w-full aspect-square object-cover border border-gray-200 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newPreviews = [...imagePreviews];
                          newPreviews[index] = "";
                          setImagePreviews(newPreviews);

                          const newImages = [...formData.images];
                          newImages[index] = "";
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded hover:bg-red-700"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors mb-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(index, file);
                      }}
                      disabled={uploading}
                      className="hidden"
                      id={`image-upload-${index}`}
                    />
                    <label
                      htmlFor={`image-upload-${index}`}
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-700"></div>
                      ) : (
                        <>
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-base font-medium text-gray-700">
                            Click to upload
                          </span>
                          <span className="text-sm text-gray-500">
                            PNG, JPG, GIF up to 5MB
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Or URL Input */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2 text-center">
                      Or paste image URL
                    </p>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Upload gambar atau masukkan URL. Gambar pertama akan menjadi
              gambar utama.
            </p>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">
                Informasi Produk (Features)
              </h2>
              <button
                type="button"
                onClick={addFeature}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold uppercase tracking-wider"
              >
                + Tambah Info
              </button>
            </div>

            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Contoh: 100% Arabica Premium`}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-colors font-semibold uppercase tracking-wider"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Tambahkan informasi penting tentang produk seperti jenis biji,
              tingkat sangrai, atau karakteristik rasa. Akan ditampilkan dengan
              ikon checklist.
            </p>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">
                Varian Produk <span className="text-red-600">*</span>
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold uppercase tracking-wider"
              >
                + Tambah Varian
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-900 uppercase tracking-wider">
                      Varian {index + 1}
                    </h3>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-colors font-semibold text-sm uppercase tracking-wider"
                      >
                        Hapus Varian
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Size/Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Ukuran/Tipe
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) =>
                          handleVariantChange(index, "name", e.target.value)
                        }
                        placeholder="100g, 250g, 1kg"
                        className="w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Harga (Rp)
                      </label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          handleVariantChange(index, "price", e.target.value)
                        }
                        placeholder="50000"
                        min="0"
                        className="w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* Stock */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Stok
                      </label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                          handleVariantChange(index, "stock", e.target.value)
                        }
                        placeholder="100"
                        min="0"
                        className="w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 relative min-h-12"
              disabled={saving}
            >
              <span className={saving ? "invisible" : "visible"}>
                Simpan Perubahan
              </span>
              {saving && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
