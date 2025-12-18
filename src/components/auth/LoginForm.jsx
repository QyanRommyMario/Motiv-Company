"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function LoginForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await signIn("credentials", {
      ...formData,
      redirect: false,
    });
    if (result?.ok) window.location.href = "/";
    else setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        name="email"
        type="email"
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder={t("loginHere")}
        className="w-full px-4 py-3 border border-[#E5E7EB]"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#1A1A1A] text-white py-3.5 uppercase tracking-widest text-sm font-medium"
      >
        {isLoading ? tCommon("loading") : t("loginButton")}
      </button>
    </form>
  );
}
