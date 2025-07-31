// hooks/useAdminUsers.ts - Updated with restore functionality
'use client';

import { useCallback, useEffect } from 'react';
import { useAdminContext } from './useAdminContext';

interface UseAdminUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  roleFilter?: 'all' | 'user' | 'admin' | 'super_admin';
  statusFilter?: 'all' | 'active' | 'suspended' | 'blocked' | 'deleted';
}

export function useAdminUsers(options: UseAdminUsersOptions = {}) {
  const { state, dispatch } = useAdminContext();
  const { 
    page = 1, 
    limit = 20, 
    search, 
    roleFilter = 'all',
    statusFilter = 'all'
  } = options;

  const fetchUsers = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { section: 'users', loading: true } });
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      
      // Add defensive checks for the response structure
      const users = data.users || [];
      const pagination = data.pagination || {};
      
      dispatch({ 
        type: 'SET_USERS', 
        payload: {
          users,
          totalUsers: pagination.count || pagination.total || users.length,
          totalPages: pagination.pages || pagination.totalPages || Math.ceil((pagination.count || users.length) / limit),
          currentPage: pagination.current || pagination.page || page,
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          section: 'users',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { section: 'users', loading: false } });
    }
  }, [dispatch, page, limit, search, roleFilter, statusFilter]);

  const promoteUser = useCallback(async (userId: string, newRole: 'admin' | 'super_admin') => {
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to promote user');
      }

      dispatch({ type: 'UPDATE_USER_ROLE', payload: { userId, newRole } });
      return { success: true };
    } catch (error) {
      console.error('Error promoting user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [dispatch]);

  const demoteUser = useCallback(async (targetEmail: string) => {
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to demote user');
      }

      // Find user and update their role
      const user = state.users.users.find(u => u.email === targetEmail);
      if (user) {
        dispatch({ type: 'UPDATE_USER_ROLE', payload: { userId: user._id, newRole: 'user' } });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error demoting user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [dispatch, state.users.users]);

  const suspendUser = useCallback(async (
    userId: string, 
    reason: string, 
    duration?: number
  ) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suspend',
          reason,
          duration,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to suspend user');
      }

      dispatch({ 
        type: 'UPDATE_USER_STATUS', 
        payload: { userId, status: 'suspended' } 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error suspending user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [dispatch]);

  const blockUser = useCallback(async (userId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'block',
          reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to block user');
      }

      dispatch({ 
        type: 'UPDATE_USER_STATUS', 
        payload: { userId, status: 'blocked' } 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error blocking user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [dispatch]);

  const deleteUser = useCallback(async (userId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      dispatch({ 
        type: 'UPDATE_USER_STATUS', 
        payload: { userId, status: 'deleted' } 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [dispatch]);

  const reactivateUser = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reactivate'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reactivate user');
      }

      dispatch({ 
        type: 'UPDATE_USER_STATUS', 
        payload: { userId, status: 'active' } 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error reactivating user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [dispatch]);

  // NEW: Restore deleted user function
  const restoreUser = useCallback(async (userId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'restore',
          reason: reason || 'User restoration requested'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to restore user');
      }

      dispatch({ 
        type: 'UPDATE_USER_STATUS', 
        payload: { userId, status: 'active' } 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error restoring user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [dispatch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users: state.users.users,
    totalUsers: state.users.totalUsers,
    totalPages: state.users.totalPages,
    currentPage: state.users.currentPage,
    loading: state.loading.users,
    error: state.error.users,
    refetch: fetchUsers,
    promoteUser,
    demoteUser,
    suspendUser,
    blockUser,
    deleteUser,
    reactivateUser,
    restoreUser, // NEW: Export the restore function
  };
}