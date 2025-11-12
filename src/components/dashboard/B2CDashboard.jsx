"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

export default function B2CDashboard({ session }) {
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch("/api/stories");
      const data = await response.json();
      setStories((data.stories || []).slice(0, 3)); // Get only 3 latest stories
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoadingStories(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        </div>

        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="space-y-8">
            <h1 className="text-[80px] md:text-[120px] lg:text-[140px] font-['Playfair_Display'] text-white tracking-tight leading-none font-bold">
              MOTIV
            </h1>

            <div className="relative">
              <p className="text-white/70 uppercase tracking-[0.35em] text-base md:text-lg font-light">
                Premium Coffee Experience
              </p>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-xs uppercase tracking-[0.2em] flex flex-col items-center gap-2">
          <span>Scroll</span>
          <svg
            className="w-6 h-6 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Stories Section - LIGHT GRAY */}
      {/* Stories Section - CLEAN WHITE */}
      {stories.length > 0 && (
        <section className="relative py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-5xl lg:text-6xl font-['Playfair_Display'] text-[#1A1A1A] leading-tight font-bold">
                Stories
              </h2>
            </div>

            {loadingStories ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-24">
                {stories.map((story, index) => (
                  <div
                    key={story.id}
                    className={`grid md:grid-cols-2 gap-16 items-center ${
                      index % 2 === 1 ? "md:grid-flow-dense" : ""
                    }`}
                  >
                    <div
                      className={`space-y-6 ${
                        index % 2 === 1 ? "md:col-start-2" : ""
                      }`}
                    >
                      <h3 className="text-4xl lg:text-5xl font-['Playfair_Display'] text-[#1A1A1A] leading-tight font-bold">
                        {story.title}
                      </h3>
                      <p className="text-[#6B7280] text-lg leading-relaxed whitespace-pre-line">
                        {story.content}
                      </p>
                    </div>

                    <div
                      className={`relative h-[400px] shadow-xl ${
                        index % 2 === 1 ? "md:col-start-1 md:row-start-1" : ""
                      }`}
                    >
                      {story.imageUrl ? (
                        <img
                          src={story.imageUrl}
                          alt={story.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E8] flex items-center justify-center">
                          <span className="text-6xl font-['Playfair_Display'] text-[#1A1A1A]/10 font-bold">
                            M
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-20">
              <Link
                href="/stories"
                className="inline-block px-10 py-4 bg-[#1A1A1A] text-white uppercase tracking-[0.2em] text-sm font-semibold hover:bg-[#6B7280] transition-all duration-300 shadow-lg"
              >
                View All Stories
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - CLEAN WHITE */}
      <section className="relative py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl lg:text-6xl font-['Playfair_Display'] text-[#1A1A1A] mb-8 leading-tight font-bold">
            Experience the Difference
          </h2>
          <p className="text-[#6B7280] text-lg mb-10 leading-relaxed">
            Join thousands of coffee enthusiasts who trust MOTIV for their daily
            ritual
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#1A1A1A] text-white px-10 py-4 text-base uppercase tracking-[0.2em] hover:bg-black transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            Shop Collection
          </Link>
        </div>
      </section>

      <footer className="bg-[#1A1A1A] py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-['Playfair_Display'] text-white tracking-[0.15em] font-bold">
              MOTIV
            </h3>
            <p className="text-white/40 text-sm uppercase tracking-[0.25em]">
              Premium Coffee Experience
            </p>
            <div className="pt-6 border-t border-white/10">
              <p className="text-white/30 text-xs uppercase tracking-[0.2em]">
                © 2025 MOTIV. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
