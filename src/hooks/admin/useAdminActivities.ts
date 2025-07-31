// hooks/useAdminActivities.ts - Custom hook for activity logs
'use client';

import { useCallback, useEffect } from 'react';
import { useAdminContext } from './useAdminContext';

export function useAdminActivities(limit: number = 50) {
  const { state, dispatch } = useAdminContext();

  const fetchActivities = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { section: 'activities', loading: true } });
    
    try {
      const response = await fetch(`/api/admin/activities?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      const data = await response.json();
      dispatch({ type: 'SET_ACTIVITIES', payload: data.activities });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          section: 'activities', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      });
    }
  }, [dispatch, limit]);

  useEffect(() => {
    if (state.activities.length === 0 && !state.loading.activities) {
      fetchActivities();
    }
  }, [state.activities.length, state.loading.activities, fetchActivities]);

  return {
    activities: state.activities,
    loading: state.loading.activities,
    error: state.error.activities,
    refetch: fetchActivities,
  };
}