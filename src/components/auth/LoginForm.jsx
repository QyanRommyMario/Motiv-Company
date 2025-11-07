"use client";

/**
 * Login Form Component
 * Handles user login with email and password
 */

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Loading from "@/components/ui/Loading";

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
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

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Force reload to get fresh session
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs uppercase tracking-widest text-[#6B7280] mb-2">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="your@email.com"
          disabled={isLoading}
          className="w-full px-4 py-3 border border-[#E5E7EB] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-[#6B7280] mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="••••••••"
          disabled={isLoading}
          className="w-full px-4 py-3 border border-[#E5E7EB] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#1A1A1A] text-white py-3.5 uppercase tracking-widest text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Signing In...</span>
          </span>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}
