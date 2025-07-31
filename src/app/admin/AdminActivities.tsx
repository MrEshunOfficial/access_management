"use client";

import { useState, useMemo } from "react";
import { useAdminActivities } from "@/hooks/admin/useAdminActivities";
import { AdminActivity } from "@/hooks/admin/useAdminContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Activity,
} from "lucide-react";

type SortField = "timestamp" | "action" | "targetEmail" | "adminEmail";
type SortOrder = "asc" | "desc";

export function AdminActivities() {
  const { activities, loading, error, refetch } = useAdminActivities(1000);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const actionTypes = [
    "all",
    "user_promoted",
    "user_demoted",
    "invitation_sent",
    "invitation_revoked",
    "user_registered",
    "role_updated",
    "user_created",
    "user_deleted",
    "user_suspended",
    "user_blocked",
    "user_reactivated",
    "restore_user",
    "admin_login",
    "admin_logout",
  ];

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString();
  };

  const formatDateShort = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return (
      dateObj.toLocaleDateString() +
      " " +
      dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "user_promoted":
        return "⬆️";
      case "user_demoted":
        return "⬇️";
      case "invitation_sent":
        return "📧";
      case "invitation_revoked":
        return "❌";
      case "user_registered":
        return "👤";
      case "role_updated":
        return "🔄";
      case "user_created":
        return "✨";
      case "user_deleted":
        return "🗑️";
      case "user_suspended":
        return "⏸️";
      case "user_blocked":
        return "🚫";
      case "user_reactivated":
        return "▶️";
      case "restore_user":
        return "♻️";
      case "admin_login":
        return "🔐";
      case "admin_logout":
        return "🚪";
      default:
        return "📝";
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "user_promoted":
        return "text-green-600 dark:text-green-400";
      case "user_demoted":
        return "text-red-600 dark:text-red-400";
      case "invitation_sent":
        return "text-blue-600 dark:text-blue-400";
      case "invitation_revoked":
        return "text-orange-600 dark:text-orange-400";
      case "user_registered":
      case "user_created":
        return "text-purple-600 dark:text-purple-400";
      case "role_updated":
        return "text-indigo-600 dark:text-indigo-400";
      case "user_deleted":
        return "text-red-700 dark:text-red-300";
      case "user_suspended":
      case "user_blocked":
        return "text-orange-700 dark:text-orange-300";
      case "user_reactivated":
      case "restore_user":
        return "text-green-700 dark:text-green-300";
      case "admin_login":
      case "admin_logout":
        return "text-blue-700 dark:text-blue-300";
      default:
        return "text-gray-600 dark:text-gray-300";
    }
  };

  const formatActionLabel = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getPerformedBy = (activity: AdminActivity): string => {
    if (activity.adminEmail) return activity.adminEmail;
    if (activity.invitedBy) return activity.invitedBy;
    return "System";
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredAndSortedActivities = useMemo(() => {
    const filtered = activities.filter((activity) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        activity.action.toLowerCase().includes(searchLower) ||
        activity.targetEmail?.toLowerCase().includes(searchLower) ||
        activity.adminEmail?.toLowerCase().includes(searchLower) ||
        getPerformedBy(activity).toLowerCase().includes(searchLower) ||
        activity.details?.toLowerCase().includes(searchLower);

      // Action type filter
      const matchesAction =
        selectedAction === "all" || activity.action === selectedAction;

      // Date range filter
      let matchesDate = true;
      if (dateRange.from || dateRange.to) {
        const activityDate = new Date(activity.timestamp);
        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          matchesDate = matchesDate && activityDate >= fromDate;
        }
        if (dateRange.to) {
          const toDate = new Date(dateRange.to + "T23:59:59");
          matchesDate = matchesDate && activityDate <= toDate;
        }
      }

      return matchesSearch && matchesAction && matchesDate;
    });

    // Type-safe sort function
    filtered.sort((a, b) => {
      switch (sortField) {
        case "timestamp": {
          const aValue = new Date(a.timestamp);
          const bValue = new Date(b.timestamp);
          if (aValue.getTime() < bValue.getTime())
            return sortOrder === "asc" ? -1 : 1;
          if (aValue.getTime() > bValue.getTime())
            return sortOrder === "asc" ? 1 : -1;
          return 0;
        }
        case "action": {
          const aValue = a.action;
          const bValue = b.action;
          if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
          if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
          return 0;
        }
        case "targetEmail": {
          const aValue = a.targetEmail || "";
          const bValue = b.targetEmail || "";
          if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
          if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
          return 0;
        }
        case "adminEmail": {
          const aValue = getPerformedBy(a);
          const bValue = getPerformedBy(b);
          if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
          if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
          return 0;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [activities, searchTerm, selectedAction, dateRange, sortField, sortOrder]);
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedAction("all");
    setDateRange({ from: "", to: "" });
    setSortField("timestamp");
    setSortOrder("desc");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header with Search and Filters */}
      <div className="flex-shrink-0 p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-4">
          {/* Title and Refresh */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Admin Activities
            </h1>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center gap-2"
            >
              <Activity size={16} />
              Refresh
            </button>
          </div>

          {/* Search and Filters Row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search activities, users, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Action Filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none min-w-[180px]"
              >
                <option value="all">All Actions</option>
                {actionTypes.slice(1).map((action) => (
                  <option key={action} value={action}>
                    {formatActionLabel(action)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, from: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, to: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="timestamp">Date</option>
              <option value="action">Action</option>
              <option value="targetEmail">Target User</option>
              <option value="adminEmail">Performed By</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
            </button>
            <span className="text-gray-500 dark:text-gray-400">
              {filteredAndSortedActivities.length} of {activities.length}{" "}
              activities
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-600 dark:text-gray-400">
              Loading activities...
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-600 dark:text-red-400">Error: {error}</div>
          </div>
        )}

        {!loading && !error && (
          <ScrollArea className="h-full">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedActivities.map((activity, index) => {
                const isExpanded = expandedItems.has(
                  activity._id || index.toString()
                );
                const activityId = activity._id || index.toString();

                return (
                  <div key={activityId} className="bg-white dark:bg-gray-800">
                    {/* Compact Row */}
                    <div
                      className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={() => toggleExpanded(activityId)}
                    >
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </div>

                      <div className="text-xl flex-shrink-0">
                        {getActivityIcon(activity.action)}
                      </div>

                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div
                          className={`font-medium truncate ${getActivityColor(
                            activity.action
                          )}`}
                        >
                          {formatActionLabel(activity.action)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {activity.targetEmail || "—"}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {getPerformedBy(activity)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDateShort(activity.timestamp)}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                              Activity Details
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                  Action:
                                </span>
                                <span
                                  className={`ml-2 ${getActivityColor(
                                    activity.action
                                  )}`}
                                >
                                  {formatActionLabel(activity.action)}
                                </span>
                              </div>
                              {activity.targetEmail && (
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-gray-400">
                                    Target:
                                  </span>
                                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                                    {activity.targetEmail}
                                  </span>
                                </div>
                              )}
                              {activity.role && (
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-gray-400">
                                    Role:
                                  </span>
                                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                                    {activity.role}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                  Performed by:
                                </span>
                                <span className="ml-2 text-gray-900 dark:text-gray-100">
                                  {getPerformedBy(activity)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                  Timestamp:
                                </span>
                                <span className="ml-2 text-gray-900 dark:text-gray-100">
                                  {formatDate(activity.timestamp)}
                                </span>
                              </div>
                              {activity.ipAddress && (
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-gray-400">
                                    IP Address:
                                  </span>
                                  <span className="ml-2 text-gray-900 dark:text-gray-100 font-mono">
                                    {activity.ipAddress}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {activity.details && (
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Additional Details
                              </h4>
                              <div className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded border">
                                {activity.details}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredAndSortedActivities.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ||
                  selectedAction !== "all" ||
                  dateRange.from ||
                  dateRange.to
                    ? "No activities match your filters"
                    : "No activities found"}
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
