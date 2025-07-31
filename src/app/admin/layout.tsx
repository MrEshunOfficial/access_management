import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { AdminNavigation } from "./AdminNavigation";
import { AdminProvider } from "@/hooks/admin/useAdminContext";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Administrative dashboard for user management",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      console.log("No session or user found, redirecting to login");
      redirect("/user/login?callbackUrl=/admin");
    }

    const userRole = session.user.role;
    const allowedRoles = ["admin", "super_admin"];

    if (!allowedRoles.includes(userRole)) {
      console.log(
        `User ${session.user.email} with role '${userRole}' attempted to access admin panel`
      );
      redirect("/profile?error=insufficient-permissions");
    }

    console.log(`Admin access granted for ${session.user.email} (${userRole})`);

    return (
      <AdminProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          <AdminNavigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </AdminProvider>
    );
  } catch {
    redirect("/user/login?error=session-error&callbackUrl=/admin");
  }
}
