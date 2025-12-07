"use client";

import Link from "next/link";
import Image from "next/image"; // Import Image Next.js
import { useState, useEffect } from "react";
import { motion, LazyMotion, domAnimation, m } from "framer-motion"; // Gunakan 'm' component
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function GuestLanding() {
  const t = useTranslations("landing");
  const tNav = useTranslations("nav");
  const [stories, setStories] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  // Menghapus mousePosition state yang memicu re-render berlebihan di main thread

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch("/api/stories?limit=3");
        const data = await response.json();
        setStories(data.stories || []);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    fetchStories();

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    // LazyMotion mengurangi ukuran bundle JS secara signifikan
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-white">
        {/* Navbar */}
        <m.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            scrolled
              ? "bg-black/80 backdrop-blur-xl shadow-2xl border-b border-white/5"
              : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              <m.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href="/"
                  className="text-xl sm:text-2xl font-['Playfair_Display'] text-white tracking-[0.2em] font-bold transition-all duration-300"
                >
                  MOTIV
                </Link>
              </m.div>
              <div className="flex gap-3 sm:gap-4 items-center">
                <LanguageSwitcher variant="dark" />
                <m.div
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="/login"
                    className="px-4 sm:px-6 py-2 text-white text-sm sm:text-base uppercase tracking-[0.15em] hover:text-white/80 transition-all duration-300 font-light"
                  >
                    {tNav("login")}
                  </Link>
                </m.div>
                <m.div
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="/register"
                    className="px-4 sm:px-6 py-2 bg-white text-black text-sm sm:text-base uppercase tracking-[0.15em] hover:bg-white/90 transition-all duration-300 font-medium shadow-lg hover:shadow-2xl"
                  >
                    {tNav("register")}
                  </Link>
                </m.div>
              </div>
            </div>
          </div>
        </m.nav>

        {/* Hero Section */}
        <section className="relative min-h-screen h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
          {/* Background Gradient - Disederhanakan untuk performa */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-black to-black opacity-50" />

          {/* Hero Content */}
          <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
            <div className="space-y-6 sm:space-y-8">
              {/* LCP OPTIMIZATION: JUDUL UTAMA TANPA ANIMASI AWAL */}
              {/* Menghapus motion.h1 yang punya initial opacity 0 */}
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[140px] font-['Playfair_Display'] text-white tracking-tight leading-none font-bold drop-shadow-2xl">
                MOTIV
              </h1>

              {/* Subtitle */}
              <m.div
                className="relative overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }} // Delay sedikit agar tidak berebut resource dengan LCP
              >
                <p className="text-white/70 uppercase tracking-[0.2em] sm:tracking-[0.35em] text-xs sm:text-sm md:text-base lg:text-lg font-light">
                  {t("hero.subtitle")}
                </p>
              </m.div>

              {/* CTA Button */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link href="/products">
                  <button className="group relative mt-8 px-8 sm:px-12 py-3 sm:py-4 border border-white/30 text-white uppercase tracking-[0.2em] text-xs sm:text-sm font-light overflow-hidden hover:bg-white hover:text-black transition-all duration-300">
                    <span className="relative z-10">{t("hero.cta")}</span>
                  </button>
                </Link>
              </m.div>
            </div>
          </div>
        </section>

        {/* Stories Section */}
        {stories.length > 0 && (
          <section className="relative py-16 sm:py-24 lg:py-32 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <m.div
                className="text-center mb-12 sm:mb-16 lg:mb-20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-['Playfair_Display'] text-[#1A1A1A] leading-tight font-bold">
                  {t("stories.title")}
                </h2>
              </m.div>

              <div className="space-y-16 sm:space-y-20 lg:space-y-24">
                {stories.map((story, index) => (
                  <m.div
                    key={story.id}
                    className={`grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center ${
                      index % 2 === 1 ? "md:grid-flow-dense" : ""
                    }`}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8 }}
                  >
                    {/* Content Text */}
                    <div
                      className={`space-y-4 sm:space-y-6 ${
                        index % 2 === 1 ? "md:col-start-2" : ""
                      }`}
                    >
                      <h3 className="text-3xl sm:text-4xl lg:text-5xl font-['Playfair_Display'] text-[#1A1A1A] leading-tight font-bold">
                        {story.title}
                      </h3>
                      <p className="text-[#6B7280] text-base sm:text-lg leading-relaxed whitespace-pre-line line-clamp-6">
                        {story.content}
                      </p>
                      <Link
                        href={`/stories/${story.id}`}
                        className="inline-flex items-center gap-2 text-[#1A1A1A] font-medium hover:underline"
                      >
                        {t("stories.readMore")} →
                      </Link>
                    </div>

                    {/* Image Optimized with Next/Image */}
                    <div
                      className={`relative h-64 sm:h-80 lg:h-[400px] shadow-2xl rounded-lg overflow-hidden group ${
                        index % 2 === 1 ? "md:col-start-1 md:row-start-1" : ""
                      }`}
                    >
                      {story.featuredImage ? (
                        <Image
                          src={story.featuredImage}
                          alt={story.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <span className="text-5xl font-['Playfair_Display'] text-gray-300">
                            M
                          </span>
                        </div>
                      )}
                    </div>
                  </m.div>
                ))}
              </div>

              {/* View All Button */}
              <div className="text-center mt-12 sm:mt-16 lg:mt-20">
                <Link href="/stories">
                  <button className="bg-[#1A1A1A] text-white px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base uppercase tracking-[0.2em] font-medium shadow-xl hover:bg-black transition-all">
                    {t("stories.viewAll")}
                  </button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="relative py-16 sm:py-24 lg:py-32 bg-white overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-['Playfair_Display'] text-[#1A1A1A] mb-6 sm:mb-8 leading-tight font-bold">
                {t("cta.title")}
              </h2>
              <p className="text-[#6B7280] text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto">
                {t("cta.subtitle")}
              </p>
              <Link href="/products">
                <button className="bg-[#1A1A1A] text-white px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base uppercase tracking-[0.2em] font-medium shadow-2xl hover:scale-105 transition-transform">
                  {t("cta.button")} →
                </button>
              </Link>
            </m.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#1A1A1A] py-16 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-['Playfair_Display'] text-white tracking-[0.15em] font-bold">
                {t("footer.brand")}
              </h3>
              <p className="text-white/40 text-sm uppercase tracking-[0.25em]">
                {t("footer.tagline")}
              </p>
              <div className="pt-6 border-t border-white/10">
                <p className="text-white/30 text-xs uppercase tracking-[0.2em]">
                  {t("footer.copyright")}
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </LazyMotion>
  );
}
