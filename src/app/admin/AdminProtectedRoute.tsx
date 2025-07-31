// components/admin/AdminProtectedRoute.tsx - Client-side protection component
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "super_admin";
}

export function AdminProtectedRoute({
  children,
  requiredRole = "admin",
}: AdminProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/auth/signin?callbackUrl=/admin");
      return;
    }

    const userRole = session.user.role;
    const hasAccess =
      userRole === "super_admin" ||
      (requiredRole === "admin" && ["admin", "super_admin"].includes(userRole));

    if (!hasAccess) {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router, requiredRole]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user || !["admin", "super_admin"].includes(session.user.role)) {
    return null;
  }

  return <>{children}</>;
}
