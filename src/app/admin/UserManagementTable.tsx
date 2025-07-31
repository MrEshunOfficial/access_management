// components/admin/UserManagementTable.tsx
"use client";

import React from "react";
import { UserWithAdminInfo } from "@/lib/admin/management/adminManagement";
import { UserRole, UserStatus } from "@/hooks/admin/useAdminContext";

interface UserManagementTableProps {
  users: UserWithAdminInfo[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onUserAction: (
    user: UserWithAdminInfo,
    action:
      | "suspend"
      | "block"
      | "delete"
      | "reactivate"
      | "promote"
      | "demote"
      | "restore"
  ) => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onUserAction,
}) => {
  const getStatusBadge = (status: UserStatus) => {
    const configs = {
      active: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-300",
        ring: "ring-green-600/20 dark:ring-green-400/30",
        dot: "bg-green-500 dark:bg-green-400",
      },
      suspended: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-800 dark:text-amber-300",
        ring: "ring-amber-600/20 dark:ring-amber-400/30",
        dot: "bg-amber-500 dark:bg-amber-400",
      },
      blocked: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-800 dark:text-orange-300",
        ring: "ring-orange-600/20 dark:ring-orange-400/30",
        dot: "bg-orange-500 dark:bg-orange-400",
      },
      deleted: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-300",
        ring: "ring-red-600/20 dark:ring-red-400/30",
        dot: "bg-red-500 dark:bg-red-400",
      },
    };

    const config = configs[status];
    return (
      <span
        className={`inline-flex items-center gap-x-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text} ring-1 ring-inset ${config.ring}`}
      >
        <svg
          className={`h-1.5 w-1.5 fill-current ${config.dot}`}
          viewBox="0 0 6 6"
        >
          <circle cx={3} cy={3} r={3} />
        </svg>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role: UserRole) => {
    const configs = {
      user: {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-800 dark:text-gray-300",
        ring: "ring-gray-600/20 dark:ring-gray-400/30",
        icon: "👤",
      },
      admin: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-300",
        ring: "ring-blue-600/20 dark:ring-blue-400/30",
        icon: "⚡",
      },
      super_admin: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-800 dark:text-purple-300",
        ring: "ring-purple-600/20 dark:ring-purple-400/30",
        icon: "👑",
      },
    };

    const labels = {
      user: "User",
      admin: "Admin",
      super_admin: "Super Admin",
    };

    const config = configs[role];
    return (
      <span
        className={`inline-flex items-center gap-x-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text} ring-1 ring-inset ${config.ring}`}
      >
        <span>{config.icon}</span>
        {labels[role]}
      </span>
    );
  };

  const renderActionButtons = (user: UserWithAdminInfo) => {
    return (
      <div className="flex flex-wrap gap-2">
        {user.status === "active" && (
          <>
            {user.role === "user" && (
              <button
                onClick={() => onUserAction(user, "promote")}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
              >
                ⬆️ Promote
              </button>
            )}
            {user.role !== "user" && (
              <button
                onClick={() => onUserAction(user, "demote")}
                className="px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
              >
                ⬇️ Demote
              </button>
            )}
            <button
              onClick={() => onUserAction(user, "suspend")}
              className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors"
            >
              ⏸️ Suspend
            </button>
            <button
              onClick={() => onUserAction(user, "block")}
              className="px-3 py-1.5 text-xs font-medium text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800/50 transition-colors"
            >
              🚫 Block
            </button>
            <button
              onClick={() => onUserAction(user, "delete")}
              className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
            >
              🗑️ Delete
            </button>
          </>
        )}
        {(user.status === "suspended" || user.status === "blocked") && (
          <button
            onClick={() => onUserAction(user, "reactivate")}
            className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
          >
            ✅ Reactivate
          </button>
        )}
        {user.status === "deleted" && (
          <button
            onClick={() => onUserAction(user, "restore")}
            className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
          >
            🔄 Restore {user.name}
          </button>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="bg-gray-50/80 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      currentPage === page
                        ? "bg-blue-600 dark:bg-blue-700 text-white"
                        : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Loading users...
            </p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Users Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No users match your current filter criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase() ||
                            user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {user.name || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status || "active")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">{renderActionButtons(user)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};
