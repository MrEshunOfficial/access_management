// hooks/useAdminInvitations.ts - Fixed version
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAdminContext } from './useAdminContext';

export function useAdminInvitations() {
  const { state, dispatch } = useAdminContext();
  const hasInitiallyFetched = useRef(false);

  const fetchInvitations = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { section: 'invitations', loading: true } });
   
    try {
      const response = await fetch('/api/admin/invitations');
      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }
     
      const data = await response.json();
      dispatch({ type: 'SET_INVITATIONS', payload: data.invitations });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          section: 'invitations',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }, [dispatch]);

  const createInvitation = useCallback(async (
    email: string,
    role: 'admin' | 'super_admin' = 'admin'
  ) => {
    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create invitation');
      }

      const result = await response.json();
     
      // Refetch invitations to get the latest data
      await fetchInvitations();
     
      return { success: true, invitationId: result.invitationId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [fetchInvitations]);

  const revokeInvitation = useCallback(async (invitationId: string) => {
    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to revoke invitation');
      }

      dispatch({ type: 'REMOVE_INVITATION', payload: invitationId });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [dispatch]);

  // Alternative approach: Check if we need to fetch data
  useEffect(() => {
    if (!hasInitiallyFetched.current && !state.loading.invitations && state.invitations.length === 0) {
      hasInitiallyFetched.current = true;
      fetchInvitations();
    }
  }, [fetchInvitations, state.loading.invitations, state.invitations.length]);

  return {
    invitations: state.invitations,
    loading: state.loading.invitations,
    error: state.error.invitations,
    refetch: fetchInvitations,
    createInvitation,
    revokeInvitation,
  };
}
