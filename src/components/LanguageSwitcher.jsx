"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LanguageSwitcher({ variant = "light" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // State lokal untuk tampilan UI segera
  const [locale, setLocale] = useState("en");

  // Load initial locale dari cookie saat mount
  useEffect(() => {
    const cookieLocale = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="))
      ?.split("=")[1];

    if (cookieLocale) setLocale(cookieLocale);
  }, []);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "id", name: "Indonesia", flag: "🇮🇩" },
  ];

  const currentLang =
    languages.find((lang) => lang.code === locale) || languages[0];

  const changeLanguage = (newLocale) => {
    // 1. Tutup dropdown
    setIsOpen(false);

    // 2. Optimistic UI update
    setLocale(newLocale);

    startTransition(() => {
      // 3. Set Cookie (Max-Age 1 tahun)
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

      // 4. Refresh halaman agar server membaca cookie baru
      router.refresh();
      // Fallback reload keras jika router.refresh tidak cukup (opsional)
      // window.location.reload();
    });
  };

  const buttonStyles =
    variant === "dark"
      ? "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white"
      : "border border-[#E5E7EB] hover:border-[#1A1A1A] text-[#6B7280] hover:text-[#1A1A1A]";

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${buttonStyles}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isPending}
      >
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="text-sm font-medium uppercase tracking-widest hidden sm:inline">
          {currentLang?.code}
        </span>
        <motion.svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    locale === lang.code
                      ? "bg-gray-100 font-bold"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-gray-900">{lang.name}</span>
                  {locale === lang.code && (
                    <span className="ml-auto text-green-600">✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
