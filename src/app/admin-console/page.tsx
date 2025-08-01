"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/user/login");
      return;
    }

    // Check if user has admin privileges
    if (!["admin", "super_admin"].includes(session.user.role)) {
      // Redirect non-admin users to their profile
<<<<<<< HEAD
      const profileUrl = process.env.NEXT_PUBLIC_AUTH_ACCESS_URL
        ? `${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/profile`
=======
      const profileUrl = process.env.USER_SERVICE_URL
        ? `${process.env.USER_SERVICE_URL}/profile`
>>>>>>> 2f792cf023e0f32cc52f3497d410f7404a1f70ba
        : "/admin";
      window.location.href = profileUrl;
      return;
    }

    setLoading(false);
  }, [session, status, router]);

  const handleNavigateToProfile = () => {
<<<<<<< HEAD
    const profileUrl = process.env.NEXT_PUBLIC_AUTH_ACCESS_URL
      ? `${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/profile`
=======
    const profileUrl = process.env.USER_SERVICE_URL
      ? `${process.env.USER_SERVICE_URL}/profile`
>>>>>>> 2f792cf023e0f32cc52f3497d410f7404a1f70ba
      : "/profile";
    window.location.href = profileUrl;
  };

  const handleNavigateToAdmin = () => {
    router.push("/admin");
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 dark:border-t-blue-300 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!session || !["admin", "super_admin"].includes(session.user.role)) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Admin Console
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Management Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
                {session.user.role === "super_admin" ? "Super Admin" : "Admin"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {session.user.name}
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            You have{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {session.user.role}
            </span>{" "}
            privileges. Choose your destination to continue managing the
            platform.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Profile Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            <button
              onClick={handleNavigateToProfile}
              className="relative w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 transition-all duration-300 group-hover:border-transparent group-hover:shadow-2xl group-hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 group-hover:from-white group-hover:to-white group-hover:text-blue-600 rounded-2xl flex items-center justify-center transition-all duration-300">
                  <svg
                    className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-white mb-2">
                    My Profile
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 group-hover:text-blue-100">
                    Access your personal dashboard and manage your account
                    settings
                  </p>
                </div>
                <div className="flex items-center text-blue-600 dark:text-blue-400 group-hover:text-white font-medium">
                  <span>Continue to Profile</span>
                  <svg
                    className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5-5 5M6 12h12"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {/* Admin Panel Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            <button
              onClick={handleNavigateToAdmin}
              className="relative w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 transition-all duration-300 group-hover:border-transparent group-hover:shadow-2xl group-hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 group-hover:from-white group-hover:to-white group-hover:text-purple-600 rounded-2xl flex items-center justify-center transition-all duration-300">
                  <svg
                    className="w-8 h-8 text-purple-600 dark:text-purple-400 group-hover:text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-white mb-2">
                    Admin Panel
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 group-hover:text-purple-100">
                    Access administrative tools and manage platform operations
                  </p>
                </div>
                <div className="flex items-center text-purple-600 dark:text-purple-400 group-hover:text-white font-medium">
                  <span>Enter Admin Panel</span>
                  <svg
                    className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5-5 5M6 12h12"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-slate-600 dark:text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Account Information
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Current session details
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Email Address
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {session.user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Access Level
                </p>
                <p className="font-medium text-slate-900 dark:text-white capitalize">
                  {session.user.role.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
