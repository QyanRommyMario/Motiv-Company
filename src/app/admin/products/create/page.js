"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import AdminLayout from "@/components/layout/AdminLayout";

export default function CreateProductPage() {
  const t = useTranslations("admin.createProduct");
  const tCats = useTranslations("products.categoryList");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "ARABICA",
    images: [""],
    features: [""],
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [variants, setVariants] = useState([
    { name: "100g", price: "", stock: "" },
  ]);

  const categories = [
    { value: "ARABICA", label: tCats("arabica") },
    { value: "ROBUSTA", label: tCats("robusta") },
    { value: "BLEND", label: tCats("blend") },
    { value: "INSTANT", label: tCats("instant") },
  ];

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

    // Update preview for URL input
    const newPreviews = [...imagePreviews];
    newPreviews[index] = value;
    setImagePreviews(newPreviews);
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (5MB)
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
      images: newImages,
    }));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prevVariants) => {
      const newVariants = [...prevVariants];
      newVariants[index] = {
        ...newVariants[index],
        [field]: value,
      };
      return newVariants;
    });
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
      alert(t("fillRequired"));
      return;
    }

    // Validate variants
    const validVariants = variants.filter(
      (v) =>
        v.name &&
        v.name.trim() !== "" &&
        v.price !== "" &&
        v.price !== null &&
        v.price !== undefined &&
        v.stock !== "" &&
        v.stock !== null &&
        v.stock !== undefined,
    );
    if (validVariants.length === 0) {
      alert(t("minOneVariant"));
      return;
    }

    // Filter out empty images
    const validImages = formData.images.filter((img) => img.trim());

    // Filter out empty features
    const validFeatures = formData.features.filter((feature) => feature.trim());

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        images: validImages,
        features: validFeatures,
        variants: validVariants.map((v) => ({
          name: v.name,
          price: parseFloat(v.price),
          stock: parseInt(v.stock),
        })),
      };

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert(t("productCreated"));
        router.push("/admin/products");
      } else {
        alert(data.message || t("createFailed"));
      }
    } catch (error) {
      alert(t("errorOccurred") + ": " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
            {t("back")}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-600 mt-2">{t("subtitle")}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t("basicInfo")}
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t("productName")} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t("productNamePlaceholder")}
                  className="w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t("description")} <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t("descriptionPlaceholder")}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t("category")} <span className="text-red-600">*</span>
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
              <h2 className="text-xl font-bold text-gray-900">
                {t("productImages")}
              </h2>
              <button
                type="button"
                onClick={addImageField}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t("addImage")}
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
                      {t("image")} {index + 1}{" "}
                      {index === 0 && (
                        <span className="text-blue-600">{t("mainImage")}</span>
                      )}
                    </h3>
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        {t("remove")}
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

                  {/* File Upload - Only show if no image uploaded yet */}
                  {!imagePreviews[index] && (
                    <>
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
                                {t("clickToUpload")}
                              </span>
                              <span className="text-sm text-gray-500">
                                {t("uploadHint")}
                              </span>
                            </>
                          )}
                        </label>
                      </div>

                      {/* Or URL Input */}
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2 text-center">
                          {t("orPasteUrl")}
                        </p>
                        <input
                          type="url"
                          value={image}
                          onChange={(e) =>
                            handleImageChange(index, e.target.value)
                          }
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">{t("imageHint")}</p>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">
                {t("productInfo")}
              </h2>
              <button
                type="button"
                onClick={addFeature}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold uppercase tracking-wider"
              >
                {t("addInfo")}
              </button>
            </div>

            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={t("featurePlaceholder")}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-colors font-semibold uppercase tracking-wider"
                    >
                      {t("remove")}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">{t("featureHint")}</p>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">
                {t("productVariants")} <span className="text-red-600">*</span>
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold uppercase tracking-wider"
              >
                {t("addVariant")}
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
                      {t("variant")} {index + 1}
                    </h3>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-colors font-semibold text-sm uppercase tracking-wider"
                      >
                        {t("removeVariant")}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Size/Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {t("sizeType")}
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) =>
                          handleVariantChange(index, "name", e.target.value)
                        }
                        placeholder={t("sizePlaceholder")}
                        className="w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {t("price")}
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
                        {t("stock")}
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
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              disabled={loading}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed relative min-h-12"
              disabled={loading || uploading}
            >
              <span className={loading ? "invisible" : "visible"}>
                {t("addProduct")}
              </span>
              {loading && (
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
