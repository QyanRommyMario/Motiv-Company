"use client";

/**
 * Register Page
 * New user registration page
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-5xl font-display font-bold text-[#1A1A1A] tracking-tight">
              MOTIV
            </h1>
          </Link>
          <p className="mt-3 text-xs uppercase tracking-widest text-[#9CA3AF] letter-spacing-widest">
            {t("tagline")}
          </p>
          <h2 className="mt-8 text-2xl font-medium text-[#1A1A1A] tracking-tight">
            {t("registerTitle")}
          </h2>
        </div>

        {/* Register Form */}
        <div className="bg-white border border-[#E5E7EB] py-10 px-8 sm:px-12">
          <RegisterForm />

          {/* Links */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-white text-[#9CA3AF]">
                  {t("haveAccount")}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm uppercase tracking-widest text-[#1A1A1A] hover:opacity-70 transition-opacity font-medium border-b border-[#1A1A1A]"
              >
                {t("loginHere")}
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-[#6B7280] hover:text-[#1A1A1A]"
          >
            ← {tCommon("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
