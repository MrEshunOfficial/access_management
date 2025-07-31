// contexts/AdminContext.tsx - Fixed types
"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  UserWithAdminInfo,
  PendingInvitation,
} from "@/lib/admin/management/adminManagement";

// Define proper activity type instead of any
interface AdminActivity {
  _id: string;
  action: string;
  adminEmail?: string;
  targetEmail?: string;
  role?: string;
  timestamp: Date;
  ipAddress?: string;
  details?: string;
  invitedBy?: string;
}

// Types
interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalSuperAdmins: number;
  pendingInvitations: number;
  recentSignups: number;
}

interface UsersState {
  users: UserWithAdminInfo[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

interface AdminState {
  stats: AdminStats | null;
  users: UsersState;
  invitations: PendingInvitation[];
  activities: AdminActivity[];
  loading: {
    stats: boolean;
    users: boolean;
    invitations: boolean;
    activities: boolean;
  };
  error: {
    stats: string | null;
    users: string | null;
    invitations: string | null;
    activities: string | null;
  };
}

// Define valid user roles and statuses - aligned with UserWithAdminInfo
type UserRole = "user" | "admin" | "super_admin";
type UserStatus = "active" | "suspended" | "blocked" | "deleted"; // Fixed: removed "inactive" and "pending", added "blocked" and "deleted"

// Add new action types
type AdminAction =
  | {
      type: "SET_LOADING";
      payload: { section: keyof AdminState["loading"]; loading: boolean };
    }
  | {
      type: "SET_ERROR";
      payload: { section: keyof AdminState["error"]; error: string | null };
    }
  | { type: "SET_STATS"; payload: AdminStats }
  | {
      type: "SET_USERS";
      payload: {
        users: UserWithAdminInfo[];
        totalUsers: number;
        totalPages: number;
        currentPage: number;
      };
    }
  | { type: "SET_INVITATIONS"; payload: PendingInvitation[] }
  | { type: "SET_ACTIVITIES"; payload: AdminActivity[] }
  | { type: "UPDATE_USER_ROLE"; payload: { userId: string; newRole: UserRole } }
  | {
      type: "UPDATE_USER_STATUS";
      payload: { userId: string; status: UserStatus };
    }
  | { type: "REMOVE_USER"; payload: string }
  | { type: "REMOVE_INVITATION"; payload: string }
  | { type: "ADD_INVITATION"; payload: PendingInvitation };

// Initial state
const initialState: AdminState = {
  stats: null,
  users: {
    users: [],
    totalUsers: 0,
    totalPages: 0,
    currentPage: 1,
    loading: false,
    error: null,
  },
  invitations: [],
  activities: [],
  loading: {
    stats: false,
    users: false,
    invitations: false,
    activities: false,
  },
  error: {
    stats: null,
    users: null,
    invitations: null,
    activities: null,
  },
};

// Reducer with proper typing
function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.section]: action.payload.loading,
        },
      };

    case "SET_ERROR":
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.section]: action.payload.error,
        },
      };

    case "SET_STATS":
      return {
        ...state,
        stats: action.payload,
        loading: { ...state.loading, stats: false },
        error: { ...state.error, stats: null },
      };

    case "SET_USERS":
      return {
        ...state,
        users: {
          ...action.payload,
          loading: false,
          error: null,
        },
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: null },
      };

    case "SET_INVITATIONS":
      return {
        ...state,
        invitations: action.payload,
        loading: { ...state.loading, invitations: false },
        error: { ...state.error, invitations: null },
      };

    case "SET_ACTIVITIES":
      return {
        ...state,
        activities: action.payload,
        loading: { ...state.loading, activities: false },
        error: { ...state.error, activities: null },
      };

    case "UPDATE_USER_ROLE":
      return {
        ...state,
        users: {
          ...state.users,
          users: state.users.users.map((user) =>
            user._id === action.payload.userId
              ? { ...user, role: action.payload.newRole }
              : user
          ),
        },
      };

    case "REMOVE_INVITATION":
      return {
        ...state,
        invitations: state.invitations.filter(
          (inv) => inv._id !== action.payload
        ),
      };

    case "ADD_INVITATION":
      return {
        ...state,
        invitations: [action.payload, ...state.invitations],
      };

    case "UPDATE_USER_STATUS":
      return {
        ...state,
        users: {
          ...state.users,
          users: state.users.users.map((user) =>
            user._id === action.payload.userId
              ? { ...user, status: action.payload.status }
              : user
          ),
        },
      };

    case "REMOVE_USER":
      return {
        ...state,
        users: {
          ...state.users,
          users: state.users.users.filter(
            (user) => user._id !== action.payload
          ),
          totalUsers: state.users.totalUsers - 1,
        },
      };

    default:
      return state;
  }
}

// Context type definition
interface AdminContextType {
  state: AdminState;
  dispatch: React.Dispatch<AdminAction>;
}

// Context
const AdminContext = createContext<AdminContextType | null>(null);

// Provider
export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  return (
    <AdminContext.Provider value={{ state, dispatch }}>
      {children}
    </AdminContext.Provider>
  );
}

// Hook to use admin context
export function useAdminContext(): AdminContextType {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within AdminProvider");
  }
  return context;
}

// Export types for use in other files
export type {
  AdminActivity,
  AdminStats,
  UsersState,
  AdminState,
  UserRole,
  UserStatus,
  AdminAction,
  AdminContextType,
};
