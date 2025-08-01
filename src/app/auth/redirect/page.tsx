"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Helper function that mirrors the server-side getRoleBasedRedirectUrl logic
function getRoleBasedRedirectUrl(
  role: string,
  baseUrl: string,
  callbackUrl?: string
): string {
  if (
    callbackUrl &&
    !callbackUrl.includes("/auth/users/login") &&
    !callbackUrl.includes("/auth/users/register") &&
    callbackUrl !== "/"
  ) {
    if (role === "admin" || role === "super_admin") {
      if (callbackUrl.startsWith("/admin/")) {
        return callbackUrl.startsWith("/")
          ? `${baseUrl}${callbackUrl}`
          : callbackUrl;
      }
    } else {
      return callbackUrl.startsWith("/")
        ? `${baseUrl}${callbackUrl}`
        : callbackUrl;
    }
  }

  switch (role) {
    case "admin":
    case "super_admin":
      return `${baseUrl}/admin-console`;
    case "user":
<<<<<<< HEAD
      return process.env.NEXT_PUBLIC_AUTH_ACCESS_URL
        ? `${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/profile`
=======
      return process.env.USER_SERVICE_URL
        ? `${process.env.USER_SERVICE_URL}/profile`
>>>>>>> 2f792cf023e0f32cc52f3497d410f7404a1f70ba
        : `${baseUrl}/profile`;
    default:
      return `${baseUrl}/user/login`;
  }
}

export default function AuthRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirectMessage, setRedirectMessage] = useState(
    "Preparing your dashboard..."
  );

  useEffect(() => {
    if (status === "loading") {
      setRedirectMessage("Authenticating...");
      return;
    }

    if (!session) {
      setRedirectMessage("Redirecting to login...");
      router.push("/user/login");
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl");
    const baseUrl = window.location.origin;

    // Set appropriate redirect message based on role
    switch (session.user.role) {
      case "admin":
      case "super_admin":
        setRedirectMessage("Loading admin console...");
        break;
      case "user":
        setRedirectMessage("Loading your profile...");
        break;
      default:
        setRedirectMessage("Redirecting...");
    }

    const redirectUrl = getRoleBasedRedirectUrl(
      session.user.role,
      baseUrl,
      callbackUrl || undefined
    );

    // Use window.location.href for external URLs, router.push for internal ones
    if (redirectUrl.startsWith("http") && !redirectUrl.startsWith(baseUrl)) {
      window.location.href = redirectUrl;
    } else {
      // Remove baseUrl if it's included to avoid duplication
      const finalUrl = redirectUrl.startsWith(baseUrl)
        ? redirectUrl.replace(baseUrl, "")
        : redirectUrl;
      router.push(finalUrl);
    }
  }, [session, status, router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-xl">
          {/* Logo/Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <svg
                className="w-10 h-10 text-white animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {session?.user
                ? `Hello, ${session.user.name}`
                : "Authenticating your session"}
            </p>
          </div>

          {/* Loading Animation */}
          <div className="flex flex-col items-center space-y-6">
            {/* Animated Spinner */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 dark:border-t-indigo-300 rounded-full animate-spin"
                style={{ animationDelay: "0.15s" }}></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-300 dark:border-t-purple-400 rounded-full animate-spin"
                style={{ animationDelay: "0.3s" }}></div>
            </div>

            {/* Progress Dots */}
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}></div>
              <div
                className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}></div>
            </div>

            {/* Status Message */}
            <div className="text-center">
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
                {redirectMessage}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This will only take a moment
              </p>
            </div>

            {/* User Role Badge (if available) */}
            {session?.user && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                  {session.user.role === "super_admin"
                    ? "Super Admin"
                    : session.user.role}{" "}
                  Access
                </span>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center space-x-2 text-slate-500 dark:text-slate-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="text-sm">Secure connection established</span>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Taking you to your personalized dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
