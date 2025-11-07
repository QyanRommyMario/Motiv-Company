"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function GuestLanding() {
  const [stories, setStories] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    async function fetchStories() {
      try {
        const response = await fetch("/api/stories");
        const data = await response.json();
        setStories(data.stories || []);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    }
    fetchStories();

    // Detect scroll for navbar
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Transparent Navbar - Like Onyx */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-black/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link
              href="/"
              className={`text-2xl font-['Playfair_Display'] tracking-[0.15em] font-bold transition-colors ${
                scrolled ? "text-[#1A1A1A]" : "text-white"
              }`}
            >
              MOTIV
            </Link>
            <div className="flex items-center gap-12">
              <Link
                href="/products"
                className={`text-base font-medium transition-colors ${
                  scrolled
                    ? "text-[#6B7280] hover:text-[#1A1A1A]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Coffee
              </Link>
              <Link
                href="/login"
                className={`text-base font-medium transition-colors ${
                  scrolled
                    ? "text-[#6B7280] hover:text-[#1A1A1A]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Account
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - FULL BLACK with Background Image */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
        {/* Background Image/Pattern - Subtle texture */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/coffee-texture.jpg')] bg-cover bg-center opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        </div>

        {/* Subtle lighting effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* Hero Content */}
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

        {/* Scroll indicator */}
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

      {/* Stories Section - CLEAN WHITE */}
      {stories.length > 0 && (
        <section className="relative py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-5xl lg:text-6xl font-['Playfair_Display'] text-[#1A1A1A] leading-tight font-bold">
                Stories
              </h2>
            </div>

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

      {/* Footer - DARK */}
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
                2024 MOTIV. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
