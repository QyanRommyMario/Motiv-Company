"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default function LoginForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        ...formData,
        redirect: false,
      });

      if (result?.ok) {
        window.location.href = "/";
      } else {
        setError(t("loginError"));
        setIsLoading(false);
      }
    } catch (err) {
      setError(tCommon("error"));
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      <div className="space-y-4">
        <Input
          label={t("email")}
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="nama@email.com"
          disabled={isLoading}
        />

        <Input
          label={t("password")}
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          placeholder="••••••••"
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        loading={isLoading}
        className="w-full"
        variant="primary"
      >
        {t("loginButton")}
      </Button>
    </form>
  );
}
