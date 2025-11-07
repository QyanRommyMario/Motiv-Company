/**
 * Register Page
 * New user registration page
 */

import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Daftar - MOTIV Coffee",
  description: "Buat akun MOTIV Coffee baru",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-600">MOTIV</h1>
          <p className="mt-2 text-sm text-gray-600">Coffee E-Commerce</p>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Buat Akun Baru
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Mulai berbelanja kopi premium pilihan
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          <RegisterForm />

          {/* Links */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Sudah punya akun?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="font-medium text-amber-600 hover:text-amber-500"
              >
                Login sekarang
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
