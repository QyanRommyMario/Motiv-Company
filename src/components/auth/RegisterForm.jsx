"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Loading from "@/components/ui/Loading";

export default function RegisterForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError(t("passwordMismatch"));
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t("passwordTooShort"));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Register error:", error);
      setError(tCommon("error"));
      setIsLoading(false);
    }
  };

  if (success) {
    return <Alert type="success" message={t("registerSuccess")} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      <Input
        label={t("name")}
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="John Doe"
        disabled={isLoading}
      />

      <Input
        label={t("email")}
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="nama@email.com"
        disabled={isLoading}
      />

      <Input
        label={t("password")}
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        placeholder={t("passwordPlaceholder")}
        disabled={isLoading}
      />

      <Input
        label={t("confirmPassword")}
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        placeholder={t("confirmPasswordPlaceholder")}
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loading size="sm" />
            <span className="ml-2">{t("registering")}</span>
          </span>
        ) : (
          t("registerButton")
        )}
      </Button>
    </form>
  );
}
