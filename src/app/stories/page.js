"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Loading from "@/components/ui/Loading";
import Link from "next/link";

export default function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Stories & Inspirasi
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Temukan cerita menarik, tips, dan inspirasi seputar kopi dari kami
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        )}

        {/* Stories Grid */}
        {!loading && stories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {stories.map((story) => (
              <Link key={story.id} href={`/stories/${story.id}`}>
                <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full cursor-pointer group">
                  {/* Image */}
                  {story.featuredImage && (
                    <div className="aspect-video relative bg-gray-200 overflow-hidden">
                      <img
                        src={story.featuredImage}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <time className="text-xs sm:text-sm text-gray-500">
                      {formatDate(story.createdAt)}
                    </time>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-2 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors">
                      {story.title}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 line-clamp-3 mb-4">
                      {story.content}
                    </p>
                    <div className="flex items-center text-gray-900 group-hover:text-gray-700 font-medium text-sm sm:text-base transition-colors">
                      Baca Selengkapnya
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && stories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No stories available yet
            </h3>
            <p className="text-gray-600 mb-6">
              Check back soon for our latest coffee stories
            </p>
            <Link href="/products">
              <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                Browse Products
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
