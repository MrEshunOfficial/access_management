// hooks/useAdminStats.ts - Custom hook for admin statistics
'use client';

import { useCallback, useEffect } from 'react';
import { useAdminContext } from './useAdminContext';

export function useAdminStats() {
  const { state, dispatch } = useAdminContext();

  const fetchStats = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { section: 'stats', loading: true } });
    
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const stats = await response.json();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          section: 'stats', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      });
    }
  }, [dispatch]);

  useEffect(() => {
    if (!state.stats && !state.loading.stats) {
      fetchStats();
    }
  }, [state.stats, state.loading.stats, fetchStats]);

  return {
    stats: state.stats,
    loading: state.loading.stats,
    error: state.error.stats,
    refetch: fetchStats,
  };
}