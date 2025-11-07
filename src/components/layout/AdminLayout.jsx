"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Loading from "@/components/ui/Loading";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!session || session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <AdminSidebar user={session?.user} />
      <div className="flex-1 overflow-y-auto">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
