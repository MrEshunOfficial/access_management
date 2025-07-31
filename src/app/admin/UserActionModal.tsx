// components/admin/UserActionModal.tsx
"use client";

import React, { useState } from "react";
import { UserWithAdminInfo } from "@/lib/admin/management/adminManagement";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface UserActionData {
  reason?: string;
  duration?: number;
  newRole?: "admin" | "super_admin";
}

interface UserActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithAdminInfo | null;
  action:
    | "suspend"
    | "block"
    | "delete"
    | "reactivate"
    | "promote"
    | "demote"
    | "restore";
  onConfirm: (data?: UserActionData) => Promise<void>;
}

export const UserActionModal: React.FC<UserActionModalProps> = ({
  isOpen,
  onClose,
  user,
  action,
  onConfirm,
}) => {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState<number | undefined>();
  const [newRole, setNewRole] = useState<"admin" | "super_admin">("admin");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const actionData: UserActionData = {};

      if (action === "suspend") {
        actionData.reason = reason;
        actionData.duration = duration;
      } else if (action === "promote") {
        actionData.newRole = newRole;
      } else if (["block", "delete"].includes(action)) {
        actionData.reason = reason;
      } else if (action === "restore") {
        actionData.reason = reason || "User restoration requested";
      }

      await onConfirm(actionData);

      // Show success toast
      const actionMessages = {
        suspend: `User ${
          user?.name || user?.email
        } has been suspended successfully`,
        block: `User ${
          user?.name || user?.email
        } has been blocked successfully`,
        delete: `User ${
          user?.name || user?.email
        } has been deleted successfully`,
        reactivate: `User ${
          user?.name || user?.email
        } has been reactivated successfully`,
        promote: `User ${user?.name || user?.email} has been promoted to ${
          newRole === "super_admin" ? "Super Admin" : "Admin"
        } successfully`,
        demote: `User ${
          user?.name || user?.email
        } has been demoted successfully`,
        restore: `User ${
          user?.name || user?.email
        } has been restored successfully`,
      };

      toast({
        title: "Action Completed",
        description: actionMessages[action],
        variant: "default",
      });

      onClose();
      setReason("");
      setDuration(undefined);
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);

      // Show error toast
      toast({
        title: "Action Failed",
        description: `Failed to ${action} user. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const getModalConfig = () => {
    const configs = {
      suspend: {
        title: "Suspend User",
        icon: "⏸️",
        buttonClass:
          "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600",
        bgClass: "bg-amber-50 dark:bg-amber-900/20",
        borderClass: "border-amber-200 dark:border-amber-800",
      },
      block: {
        title: "Block User",
        icon: "🚫",
        buttonClass:
          "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 dark:bg-orange-500 dark:hover:bg-orange-600",
        bgClass: "bg-orange-50 dark:bg-orange-900/20",
        borderClass: "border-orange-200 dark:border-orange-800",
      },
      delete: {
        title: "Delete User",
        icon: "🗑️",
        buttonClass:
          "bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600",
        bgClass: "bg-red-50 dark:bg-red-900/20",
        borderClass: "border-red-200 dark:border-red-800",
      },
      reactivate: {
        title: "Reactivate User",
        icon: "✅",
        buttonClass:
          "bg-green-600 hover:bg-green-700 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600",
        bgClass: "bg-green-50 dark:bg-green-900/20",
        borderClass: "border-green-200 dark:border-green-800",
      },
      promote: {
        title: "Promote User",
        icon: "⬆️",
        buttonClass:
          "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600",
        bgClass: "bg-blue-50 dark:bg-blue-900/20",
        borderClass: "border-blue-200 dark:border-blue-800",
      },
      demote: {
        title: "Demote User",
        icon: "⬇️",
        buttonClass:
          "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 dark:bg-purple-500 dark:hover:bg-purple-600",
        bgClass: "bg-purple-50 dark:bg-purple-900/20",
        borderClass: "border-purple-200 dark:border-purple-800",
      },
      restore: {
        title: "Restore User",
        icon: "🔄",
        buttonClass:
          "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-600",
        bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
        borderClass: "border-emerald-200 dark:border-emerald-800",
      },
    };
    return configs[action];
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 dark:bg-black/80">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div
          className={`${config.bgClass} ${config.borderClass} border-b px-6 py-4 rounded-t-2xl`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{config.icon}</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {config.title}
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.name?.charAt(0).toUpperCase() ||
                  user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.name || "N/A"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {action === "promote" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) =>
                    setNewRole(e.target.value as "admin" | "super_admin")
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            )}

            {action === "suspend" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={duration || ""}
                  onChange={(e) =>
                    setDuration(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="Leave empty for permanent suspension"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {["suspend", "block", "delete"].includes(action) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Please provide a detailed reason for this action..."
                />
              </div>
            )}

            {action === "restore" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Optional reason for restoring this user..."
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  This will restore the user account and set their status back
                  to active.
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 transition-all font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-3 text-white rounded-lg transition-all font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonClass}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  config.title
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
};
