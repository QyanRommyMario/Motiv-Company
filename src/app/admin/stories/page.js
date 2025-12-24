"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";

export default function AdminStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
    isPublished: false,
    order: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchStories();
      }
    }
  }, [status, session, router]);

  const fetchStories = async () => {
    try {
      const response = await fetch("/api/stories");
      const data = await response.json();
      setStories(data.stories || []);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
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
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        setImagePreview(data.url);
      } else {
        alert(data.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingStory
        ? `/api/stories/${editingStory.id}`
        : "/api/stories";
      const method = editingStory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchStories();
        setShowForm(false);
        setEditingStory(null);
        setFormData({
          title: "",
          content: "",
          imageUrl: "",
          isPublished: false,
          order: 0,
        });
      }
    } catch (error) {
      console.error("Error saving story:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      content: story.content,
      imageUrl: story.imageUrl || "",
      isPublished: story.isPublished,
      order: story.order,
    });
    setImagePreview(story.imageUrl || "");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      await fetch(`/api/stories/${id}`, { method: "DELETE" });
      fetchStories();
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  if (loading && !stories.length) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#E5E7EB] border-t-[#1A1A1A] rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-[#6B7280] uppercase tracking-widest">
              Memuat cerita...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">
              Manage Stories
            </h1>
            <p className="text-[#6B7280] mt-2">
              Create and manage stories for the landing page
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingStory(null);
              setFormData({
                title: "",
                content: "",
                imageUrl: "",
                isPublished: false,
                order: 0,
              });
              setImagePreview("");
            }}
            className="px-6 py-3 bg-[#1A1A1A] text-white hover:bg-black transition-colors font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Story
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <h2 className="text-2xl font-['Playfair_Display'] text-[#1A1A1A] mb-6 font-bold">
                {editingStory ? "Edit Story" : "Add New Story"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    required
                    rows={8}
                    placeholder="Tuliskan cerita atau promosi Anda di sini. Gunakan paragraf untuk memisahkan konten..."
                    className="w-full px-4 py-3 border-2 border-gray-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tips: Gunakan paragraf (tekan Enter 2x) untuk memisahkan
                    bagian cerita. Di halaman utama, hanya 3 baris pertama yang
                    ditampilkan. Pengunjung perlu klik "Baca Selengkapnya" untuk
                    membaca keseluruhan.
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {formData.content.length} karakter
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Image *
                  </label>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mb-4 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover border border-[#E5E7EB]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setFormData({ ...formData, imageUrl: "" });
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 hover:bg-red-700 transition-colors"
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
                  <div className="border-2 border-dashed border-[#E5E7EB] p-8 text-center hover:border-[#1A1A1A] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      {uploading ? (
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1A1A1A]"></div>
                      ) : (
                        <>
                          <svg
                            className="w-14 h-14 text-[#6B7280]"
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
                          <span className="text-base font-semibold text-[#1A1A1A]">
                            Click to upload image
                          </span>
                          <span className="text-sm text-[#6B7280]">
                            PNG, JPG, GIF up to 5MB
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Or use URL */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-[#6B7280] mb-2 text-center">
                      Or paste image URL
                    </p>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        order: value === "" ? 0 : parseInt(value) || 0,
                      });
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                  <label
                    htmlFor="isPublished"
                    className="text-sm font-medium text-[#1A1A1A]"
                  >
                    Publish to landing page
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#1A1A1A] text-white py-3 hover:bg-black transition-colors font-medium disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : editingStory
                      ? "Update Story"
                      : "Create Story"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingStory(null);
                    }}
                    className="flex-1 border border-[#E5E7EB] text-[#1A1A1A] py-3 hover:bg-[#F5F5F0] transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stories List */}
        <div className="space-y-6">
          {stories.length === 0 ? (
            <div className="text-center py-12 bg-white border border-[#E5E7EB] shadow-sm">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-[#9CA3AF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p className="text-[#6B7280] font-medium">
                No stories yet. Create your first story!
              </p>
            </div>
          ) : (
            stories.map((story) => (
              <div
                key={story.id}
                className="bg-white border border-[#E5E7EB] shadow-sm hover:border-[#1A1A1A] transition-all p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-[#1A1A1A]">
                        {story.title}
                      </h3>
                      {story.isPublished ? (
                        <span className="bg-[#DCFCE7] text-[#16A34A] text-xs px-3 py-1 font-bold uppercase tracking-wider">
                          PUBLISHED
                        </span>
                      ) : (
                        <span className="bg-[#F3F4F6] text-[#6B7280] text-xs px-3 py-1 font-bold uppercase tracking-wider">
                          DRAFT
                        </span>
                      )}
                    </div>
                    <p className="text-[#6B7280] line-clamp-2 mb-4">
                      {story.content}
                    </p>
                    <p className="text-sm text-[#6B7280] font-medium">
                      Order: {story.order} • Created:{" "}
                      {new Date(story.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-6">
                    <button
                      onClick={() => handleEdit(story)}
                      className="px-4 py-2 bg-[#1A1A1A] text-white hover:bg-black transition-colors text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="px-4 py-2 border-2 border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-all text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
