// components/admin/AdminDashboard.tsx - Dashboard component with dark/light mode
"use client";

import { useAdminStats } from "@/hooks/admin/useAdminStats";
import Link from "next/link";

export default function AdminDashboard() {
  const { stats, loading, error, refetch } = useAdminStats();

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 dark:text-red-200 font-medium">
                Error loading dashboard
              </h3>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors flex items-center gap-2"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Total Users
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl text-blue-500 dark:text-blue-400">👥</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Total Admins
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {stats.totalAdmins.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl text-green-500 dark:text-green-400">
              ⚡
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Super Admins
              </h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {stats.totalSuperAdmins.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl text-purple-500 dark:text-purple-400">
              👑
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Pending Invitations
              </h3>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                {stats.pendingInvitations.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl text-orange-500 dark:text-orange-400">
              📧
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-blue-600 dark:text-blue-400">👤</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    New Signups
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Last 7 days
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.recentSignups}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-green-600 dark:text-green-400">⚡</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Active Admins
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Currently online
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.totalAdmins}
              </span>
            </div>

            {stats.pendingInvitations > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-orange-600 dark:text-orange-400">⏳</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Pending Actions
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Invitations awaiting response
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.pendingInvitations}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="space-y-3">
            <Link
              href="/admin/users"
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="text-blue-600 dark:text-blue-400">👥</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Manage Users
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and edit user roles
                  </p>
                </div>
              </div>
              <div className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                →
              </div>
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="text-indigo-600 dark:text-indigo-400">🏷️</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Manage Categories
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Organize and edit categories
                  </p>
                </div>
              </div>
              <div className="text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                →
              </div>
            </Link>

            <Link
              href="/admin/invitations"
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="text-green-600 dark:text-green-400">📧</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                    Send Invitations
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Invite new admins
                  </p>
                </div>
              </div>
              <div className="text-gray-400 dark:text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400">
                →
              </div>
            </Link>

            <Link
              href="/admin/activities"
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="text-purple-600 dark:text-purple-400">📝</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    View Activities
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check admin activity logs
                  </p>
                </div>
              </div>
              <div className="text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                →
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            System Overview
          </h3>
          <span className="text-2xl">🖥️</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {((stats.totalAdmins / (stats.totalUsers || 1)) * 100).toFixed(1)}
              %
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Admin Coverage
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.recentSignups > 0 ? "📈" : "📊"}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Growth Trend
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.pendingInvitations === 0 ? "✅" : "⏳"}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              System Status
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
