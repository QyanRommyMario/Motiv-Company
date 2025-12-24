"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, LazyMotion, domAnimation, m } from "framer-motion";
import { useTranslations } from "next-intl";
import Navbar from "@/components/layout/Navbar";

export default function GuestLanding() {
  const t = useTranslations("landing");
  const [stories, setStories] = useState([]);

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
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-white">
        {/* Navbar Fixed dengan latar belakang solid agar warna tidak berubah saat scroll */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-white/5">
          <Navbar />
        </div>

        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70 z-0" />

          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              /* Menggunakan !text-white untuk memastikan putih murni */
              className="text-7xl md:text-9xl font-display !text-white tracking-tighter font-bold"
            >
              MOTIV
            </m.h1>
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="!text-white uppercase tracking-[0.4em] text-xs md:text-sm mt-6 font-light opacity-60"
            >
              {t("hero.subtitle")}
            </m.p>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-10 mb-32"
            >
              <Link href="/products">
                <button className="group relative px-12 py-4 border border-white/30 !text-white uppercase tracking-[0.2em] text-xs font-light overflow-hidden hover:bg-white hover:!text-black transition-all duration-300">
                  <span className="relative z-10">{t("hero.cta")}</span>
                </button>
              </Link>
            </m.div>

            <m.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 !text-white/40 text-[10px] uppercase tracking-[0.3em]"
            >
              {t("scroll")}
            </m.div>
          </div>
        </section>

        {stories.length > 0 && (
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-4xl font-display text-center mb-16 tracking-tight">
                {t("stories.title")}
              </h2>
              <div className="grid gap-20">
                {stories.map((story, index) => (
                  <div
                    key={story.id}
                    className={`flex flex-col md:flex-row gap-12 items-center ${
                      index % 2 === 1 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <div className="flex-1 space-y-4">
                      <h3 className="text-3xl font-display leading-tight">
                        {story.title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed">
                        {story.content.substring(0, 250)}...
                      </p>
                      <Link
                        href={`/stories/${story.id}`}
                        className="inline-block text-black font-bold border-b-2 border-black pb-1 text-sm tracking-widest hover:opacity-70 transition-opacity uppercase"
                      >
                        {t("stories.readMore") || "READ MORE"} →
                      </Link>
                    </div>
                    <div className="flex-1 relative aspect-[4/3] w-full overflow-hidden rounded-sm shadow-2xl">
                      <Image
                        src={story.featuredImage || "/globe.svg"}
                        alt={story.title}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <footer className="bg-[#0A0A0A] py-16 text-center border-t border-white/5">
          <div className="space-y-4">
            <h4 className="!text-white font-display text-xl tracking-[0.2em]">
              MOTIV
            </h4>
            <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase">
              © {new Date().getFullYear()} MOTIV COFFEE COMPANY. ALL RIGHTS
              RESERVED.
            </p>
          </div>
        </footer>
      </div>
    </LazyMotion>
  );
}
