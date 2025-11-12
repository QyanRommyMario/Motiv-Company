"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function GuestLanding() {
  const t = useTranslations("landing");
  const tNav = useTranslations("nav");
  const [stories, setStories] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50,
      });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Ultra Premium Navbar - Seamless Glass Morphism */}
      <motion.nav
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
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href="/"
                className="text-xl sm:text-2xl font-['Playfair_Display'] text-white tracking-[0.2em] font-bold transition-all duration-300"
              >
                MOTIV
              </Link>
            </motion.div>
            <div className="flex gap-3 sm:gap-4 items-center">
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              <motion.div
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
              </motion.div>
              <motion.div
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
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - LUXURY ANIMATED - RESPONSIVE */}
      <section className="relative min-h-screen h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Premium lighting effects with 3D parallax */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            transform: `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0)`,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
        >
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-[120px]"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          />
        </motion.div>

        {/* Hero Content - PREMIUM ANIMATIONS */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="space-y-6 sm:space-y-8">
            {/* Ultra-premium title animation */}
            <motion.h1
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[140px] font-['Playfair_Display'] text-white tracking-tight leading-none font-bold"
              initial={{ opacity: 0, y: 80, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 1.4,
                ease: [0.16, 1, 0.3, 1], // Premium easing curve
                delay: 0.2,
              }}
            >
              <motion.span
                className="inline-block"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(255,255,255,0.1)",
                    "0 0 40px rgba(255,255,255,0.2)",
                    "0 0 20px rgba(255,255,255,0.1)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                MOTIV
              </motion.span>
            </motion.h1>

            {/* Elegant subtitle with reveal effect */}
            <motion.div
              className="relative overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.8 }}
            >
              <motion.p
                className="text-white/70 uppercase tracking-[0.2em] sm:tracking-[0.35em] text-xs sm:text-sm md:text-base lg:text-lg font-light"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 0.7 }}
                transition={{
                  duration: 1,
                  delay: 1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {t("hero.subtitle")}
              </motion.p>
              <motion.div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 1.2, delay: 1.4, ease: "easeOut" }}
              />
            </motion.div>

            {/* Luxury CTA with sophisticated hover */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/products">
                <motion.button
                  className="group relative mt-8 px-8 sm:px-12 py-3 sm:py-4 border border-white/30 text-white uppercase tracking-[0.2em] text-xs sm:text-sm font-light overflow-hidden"
                  whileHover={{
                    scale: 1.05,
                    borderColor: "rgba(255,255,255,0.5)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.span
                    className="absolute inset-0 bg-white"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                  <span className="relative z-10 group-hover:text-black transition-colors duration-400">
                    {t("hero.cta")}
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Elegant scroll indicator with floating animation */}
        <motion.div
          className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-xs uppercase tracking-[0.2em] flex-col items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2 }}
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {t("scroll")}
          </motion.span>
          <motion.svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{
              y: [0, 12, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </motion.svg>
        </motion.div>
      </section>

      {/* Stories Section - LUXURY REVEAL ANIMATION - RESPONSIVE */}
      {stories.length > 0 && (
        <section className="relative py-16 sm:py-24 lg:py-32 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12 sm:mb-16 lg:mb-20"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.h2
                className="text-4xl sm:text-5xl lg:text-6xl font-['Playfair_Display'] text-[#1A1A1A] leading-tight font-bold"
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                whileInView={{ opacity: 1, letterSpacing: "0em" }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                {t("stories.title")}
              </motion.h2>
            </motion.div>

            <div className="space-y-16 sm:space-y-20 lg:space-y-24">
              {stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  className={`grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center ${
                    index % 2 === 1 ? "md:grid-flow-dense" : ""
                  }`}
                  initial={{ opacity: 0, y: 80 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-150px" }}
                  transition={{
                    duration: 1,
                    delay: index * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <motion.div
                    className={`space-y-4 sm:space-y-6 ${
                      index % 2 === 1 ? "md:col-start-2" : ""
                    }`}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                      duration: 1,
                      delay: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-['Playfair_Display'] text-[#1A1A1A] leading-tight font-bold">
                      {story.title}
                    </h3>
                    <p className="text-[#6B7280] text-base sm:text-lg leading-relaxed whitespace-pre-line line-clamp-6">
                      {story.content}
                    </p>
                    <motion.div
                      whileHover={{ x: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link
                        href={`/stories/${story.id}`}
                        className="inline-flex items-center gap-2 text-[#1A1A1A] font-medium hover:underline"
                      >
                        {t("stories.readMore")}
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          →
                        </motion.span>
                      </Link>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className={`relative h-64 sm:h-80 lg:h-[400px] shadow-2xl rounded-lg overflow-hidden group ${
                      index % 2 === 1 ? "md:col-start-1 md:row-start-1" : ""
                    }`}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                      x: index % 2 === 0 ? 60 : -60,
                    }}
                    whileInView={{ opacity: 1, scale: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                      duration: 1,
                      delay: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ scale: 1.03, y: -5 }}
                  >
                    {story.featuredImage ? (
                      <>
                        <motion.img
                          src={story.featuredImage}
                          alt={story.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          initial={{ scale: 1.2 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <motion.div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E8] flex items-center justify-center">
                        <motion.span
                          className="text-5xl sm:text-6xl font-['Playfair_Display'] text-[#1A1A1A]/10 font-bold"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          M
                        </motion.span>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* View All Stories Button with luxury effect */}
            <motion.div
              className="text-center mt-12 sm:mt-16 lg:mt-20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/stories">
                <motion.button
                  className="group relative inline-block bg-[#1A1A1A] text-white px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base uppercase tracking-[0.2em] font-medium shadow-xl overflow-hidden"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                  <span className="relative z-10">{t("stories.viewAll")}</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section - LUXURY ANIMATED - RESPONSIVE */}
      <section className="relative py-16 sm:py-24 lg:py-32 bg-white overflow-hidden">
        {/* Subtle animated background */}
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage:
              "radial-gradient(circle, #1A1A1A 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-['Playfair_Display'] text-[#1A1A1A] mb-6 sm:mb-8 leading-tight font-bold"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {t("cta.title")}
          </motion.h2>

          <motion.p
            className="text-[#6B7280] text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {t("cta.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/products">
              <motion.button
                className="group relative inline-block bg-[#1A1A1A] text-white px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base uppercase tracking-[0.2em] font-medium shadow-2xl overflow-hidden"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 30px 60px -15px rgba(0,0,0,0.3)",
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-black via-zinc-800 to-black"
                  initial={{ x: "-100%", opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
                <motion.span
                  className="relative z-10 inline-flex items-center gap-2"
                  whileHover={{ letterSpacing: "0.25em" }}
                  transition={{ duration: 0.3 }}
                >
                  {t("cta.button")}
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    →
                  </motion.span>
                </motion.span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer - DARK */}
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
  );
}
