// components/admin/UserManagementDashboard.tsx
"use client";

import React, { useState, useCallback } from "react";
import { UserWithAdminInfo } from "@/lib/admin/management/adminManagement";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { UserRole, UserStatus } from "@/hooks/admin/useAdminContext";
import { UserActionModal } from "./UserActionModal";
import { UserManagementTable } from "./UserManagementTable";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface UserManagementDashboardProps {
  className?: string;
}

interface UserActionData {
  reason?: string;
  duration?: number;
  newRole?: "admin" | "super_admin";
}

// Main Dashboard Component with modern design
export const UserManagement: React.FC<UserManagementDashboardProps> = ({
  className = "",
}) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserWithAdminInfo | null>(
    null
  );
  const [actionType, setActionType] = useState<
    | "suspend"
    | "block"
    | "delete"
    | "reactivate"
    | "promote"
    | "demote"
    | "restore"
    | null
  >(null);

  const { toast } = useToast();

  const {
    users,
    totalUsers,
    totalPages,
    loading,
    error,
    refetch,
    promoteUser,
    demoteUser,
  } = useAdminUsers({
    page: currentPage,
    limit: 20,
    search: search.trim(),
    roleFilter,
  });

  // Filter users by status on frontend since the hook doesn't support status filtering
  const filteredUsers =
    statusFilter === "all"
      ? users
      : users.filter((user) => user.status === statusFilter);

  const handleUserAction = useCallback(
    async (
      user: UserWithAdminInfo,
      action:
        | "suspend"
        | "block"
        | "delete"
        | "reactivate"
        | "promote"
        | "demote"
        | "restore"
    ) => {
      setSelectedUser(user);
      setActionType(action);
    },
    []
  );

  const executeUserAction = useCallback(
    async (data?: UserActionData) => {
      if (!selectedUser || !actionType) return;

      try {
        let response: Response;

        switch (actionType) {
          case "suspend":
            response = await fetch(`/api/admin/users/${selectedUser._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "suspend",
                reason: data?.reason,
                duration: data?.duration,
              }),
            });
            break;

          case "block":
            response = await fetch(`/api/admin/users/${selectedUser._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "block",
                reason: data?.reason,
              }),
            });
            break;

          case "delete":
            response = await fetch(`/api/admin/users/${selectedUser._id}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reason: data?.reason,
              }),
            });
            break;

          case "reactivate":
            response = await fetch(`/api/admin/users/${selectedUser._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "reactivate",
              }),
            });
            break;

          case "restore":
            response = await fetch(`/api/admin/users/${selectedUser._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "restore",
                reason: data?.reason,
              }),
            });
            break;

          case "promote":
            if (data?.newRole) {
              await promoteUser(selectedUser._id, data.newRole);

              // Show success toast for promotion
              toast({
                title: "User Promoted",
                description: `${
                  selectedUser.name || selectedUser.email
                } has been promoted to ${
                  data.newRole === "super_admin" ? "Super Admin" : "Admin"
                } successfully`,
                variant: "default",
              });
            }
            return;

          case "demote":
            await demoteUser(selectedUser.email);

            // Show success toast for demotion
            toast({
              title: "User Demoted",
              description: `${
                selectedUser.name || selectedUser.email
              } has been demoted successfully`,
              variant: "default",
            });
            return;

          default:
            throw new Error(`Unknown action type: ${actionType}`);
        }

        if (response && !response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Action failed");
        }

        // Show success toast for API actions
        const actionMessages = {
          suspend: `${
            selectedUser.name || selectedUser.email
          } has been suspended successfully`,
          block: `${
            selectedUser.name || selectedUser.email
          } has been blocked successfully`,
          delete: `${
            selectedUser.name || selectedUser.email
          } has been deleted successfully`,
          reactivate: `${
            selectedUser.name || selectedUser.email
          } has been reactivated successfully`,
          restore: `${
            selectedUser.name || selectedUser.email
          } has been restored successfully`,
        };

        if (actionType in actionMessages) {
          toast({
            title: "Action Completed",
            description:
              actionMessages[actionType as keyof typeof actionMessages],
            variant: "default",
          });
        }

        await refetch();
      } catch (error) {
        console.error(`Error executing ${actionType}:`, error);

        // Show error toast
        toast({
          title: "Action Failed",
          description: `Failed to ${actionType} user. Please try again.`,
          variant: "destructive",
        });

        throw error;
      }
    },
    [selectedUser, actionType, promoteUser, demoteUser, refetch, toast]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  }, []);

  if (error) {
    return (
      <div
        className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 ${className}`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">❌</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
              Error Loading Users
            </h3>
            <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
            <button
              onClick={refetch}
              className="mt-3 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-blue-100 dark:text-blue-200">
              Manage users, roles, and permissions
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {totalUsers.toLocaleString()}
            </div>
            <div className="text-blue-100 dark:text-blue-200">Total Users</div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              🔍 Search Users
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              👥 Role Filter
            </label>
            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value as typeof roleFilter)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
              <option value="super_admin">Super Admins</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              📊 Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="blocked">Blocked</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full px-6 py-3 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <UserManagementTable
        users={filteredUsers}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onUserAction={handleUserAction}
      />

      {/* Action Modal */}
      <UserActionModal
        isOpen={!!selectedUser && !!actionType}
        onClose={() => {
          setSelectedUser(null);
          setActionType(null);
        }}
        user={selectedUser}
        action={actionType!}
        onConfirm={executeUserAction}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};
