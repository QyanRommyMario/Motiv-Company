"use client";

/**
 * Story Detail Page
 * Display full story content
 */

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import Loading from "@/components/ui/Loading";

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("storiesPage");
  const locale = useLocale();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchStory();
    }
  }, [params.id]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setStory(data.story);
      } else {
        router.push("/stories");
      }
    } catch (error) {
      router.push("/stories");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (!story) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-12">
        {/* Back Button */}
        <button
          onClick={() => router.push("/stories")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          suppressHydrationWarning
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
          {t("backToStories")}
        </button>

        {/* Story Content */}
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Featured Image */}
          {story.featuredImage && (
            <div className="w-full aspect-video relative bg-gray-200">
              <img
                src={story.featuredImage}
                alt={story.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 sm:p-8 lg:p-12">
            {/* Date */}
            <time className="text-sm text-gray-500" suppressHydrationWarning>
              {formatDate(story.createdAt)}
            </time>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
              {story.title}
            </h1>

            {/* Story Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {story.content}
              </div>
            </div>

            {/* Metadata */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-500" suppressHydrationWarning>
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t("publishedAt")} {formatDate(story.createdAt)}
              </div>
            </div>
          </div>
        </article>

        {/* Related Stories / Call to Action */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4" suppressHydrationWarning>
            {t("interested")}
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/stories")}
              className="px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              suppressHydrationWarning
            >
              {t("readOtherStories")}
            </button>
            <button
              onClick={() => router.push("/products")}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
              suppressHydrationWarning
            >
              {t("viewOurProducts")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
