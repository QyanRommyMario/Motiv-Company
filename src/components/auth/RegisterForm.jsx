"use client";

/**
 * Register Form Component
 * Handles new user registration
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Loading from "@/components/ui/Loading";

export default function RegisterForm() {
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
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
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

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Register error:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Alert
        type="success"
        message="Registrasi berhasil! Anda akan diarahkan ke halaman login..."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      <Input
        label="Nama Lengkap"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="John Doe"
        disabled={isLoading}
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="nama@email.com"
        disabled={isLoading}
      />

      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        placeholder="Minimal 6 karakter"
        disabled={isLoading}
      />

      <Input
        label="Konfirmasi Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        placeholder="Ulangi password"
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loading size="sm" />
            <span className="ml-2">Mendaftar...</span>
          </span>
        ) : (
          "Daftar"
        )}
      </Button>
    </form>
  );
}
