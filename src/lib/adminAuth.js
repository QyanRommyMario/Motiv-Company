/**
 * Admin Middleware
 * Checks if user is admin before accessing admin routes
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  return session;
}
