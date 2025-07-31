// src/hooks/useCategories.ts - Updated with service count refresh capability

import { CategoryDeleteOptions, CategoryQueryOptions } from '@/lib/admin/services/categoryService';
import { AppDispatch, RootState } from '@/store';
import { fetchCategories, fetchCategoriesWithCounts, createCategory, deleteCategory, simpleDeleteCategory, safeDeleteCategory, cascadeDeleteCategory, migrateDeleteCategory, forceDeleteCategory, bulkDeleteCategories, fetchCategoryById, updateCategory, getCategoryDeletionInfo, searchCategories, setFilters, clearFilters, setSelectedCategory, clearError, clearDeletionInfo, clearBulkDeleteResult, resetState } from '@/store/slices/categorySlice';
import { CreateCategoryInput, UpdateCategoryInput, Category } from '@/store/types/dataTypes';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useCategories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    categories,
    selectedCategory,
    loading,
    error,
    filters,
    pagination,
    stats,
    deletionInfo,
    bulkDeleteResult,
  } = useSelector((state: RootState) => state.categories);

  // Refresh both categories and counts - UPDATED to be more comprehensive
  const refreshCategoriesData = useCallback(async (options?: CategoryQueryOptions) => {
    try {
      // Fetch categories and their counts simultaneously
      const results = await Promise.allSettled([
        dispatch(fetchCategories(options || { limit: 50 })),
        dispatch(fetchCategoriesWithCounts())
      ]);

      // Log any errors but don't throw
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to refresh categories data (${index === 0 ? 'categories' : 'counts'}):`, result.reason);
        }
      });
    } catch (error) {
      console.error('Error refreshing categories data:', error);
    }
  }, [dispatch]);

  // New method: Force refresh service counts for all categories
  const refreshServiceCounts = useCallback(async () => {
    try {
      await dispatch(fetchCategoriesWithCounts());
    } catch (error) {
      console.error('Error refreshing service counts:', error);
    }
  }, [dispatch]);

  // Enhanced method: Refresh after service operations
  const refreshAfterServiceOperation = useCallback(async () => {
    try {
      // For now, refresh all counts
      await refreshServiceCounts();
      
      // Optionally refresh the full categories list if needed
      if (categories.length > 0) {
        await dispatch(fetchCategories({ limit: 50 }));
      }
    } catch (error) {
      console.error('Error refreshing after service operation:', error);
    }
  }, [dispatch, refreshServiceCounts, categories.length]);

  // Enhanced add category with immediate refresh
  const addCategory = useCallback(
    async (categoryData: CreateCategoryInput) => {
      try {
        const result = await dispatch(createCategory(categoryData));
        // Refresh categories list after adding
        await refreshCategoriesData();
        return result;
      } catch (error) {
        console.error('Error adding category:', error);
        throw error;
      }
    },
    [dispatch, refreshCategoriesData]
  );

  // Enhanced delete methods with immediate refresh
  const removeCategory = useCallback(
    async (id: string, options?: CategoryDeleteOptions) => {
      try {
        const result = await dispatch(deleteCategory({ id, options }));
        // Refresh categories and counts after deletion
        await refreshCategoriesData();
        return result;
      } catch (error) {
        console.error('Error removing category:', error);
        throw error;
      }
    },
    [dispatch, refreshCategoriesData]
  );

  const removeCategorySimple = useCallback(
    async (id: string) => {
      try {
        const result = await dispatch(simpleDeleteCategory(id));
        await refreshCategoriesData();
        return result;
      } catch (error) {
        console.error('Error removing category (simple):', error);
        throw error;
      }
    },
    [dispatch, refreshCategoriesData]
  );

  const removeCategorySafely = useCallback(
    async (id: string) => {
      try {
        const result = await dispatch(safeDeleteCategory(id));
        await refreshCategoriesData();
        return result;
      } catch (error) {
        console.error('Error removing category (safe):', error);
        throw error;
      }
    },
    [dispatch, refreshCategoriesData]
  );

  const removeCategoryCascade = useCallback(
    async (id: string) => {
      try {
        const result = await dispatch(cascadeDeleteCategory(id));
        await refreshCategoriesData();
        return result;
      } catch (error) {
        console.error('Error removing category (cascade):', error);
        throw error;
      }
    },
    [dispatch, refreshCategoriesData]
  );

  const removeCategoryWithMigration = useCallback(
    async (id: string, targetCategoryId: string) => {
      try {
        const result = await dispatch(migrateDeleteCategory({ id, targetCategoryId }));
        await refreshCategoriesData();
        return result;
      } catch (error) {
        console.error('Error removing category (migration):', error);
        throw error;
      }
    },
    [dispatch, refreshCategoriesData]
  );

  const removeCategoryForce = useCallback(
    async (id: string) => {
      try {
        const result = await dispatch(forceDeleteCategory(id));
        await refreshCategoriesData();
        return result;
      } catch (error) {
        console.error('Error removing category (force):', error);
        throw error;
      }
    },
    [dispatch, refreshCategoriesData]
  );

  // Enhanced bulk delete with immediate refresh
  const removeCategoriesBulk = useCallback(
    async (categoryIds: string[], options?: CategoryDeleteOptions) => {
      try {
        const result = await dispatch(bulkDeleteCategories({ categoryIds, options }));
        await refreshCategoriesData();
        return result;
      } catch (error) {
        console.error('Error bulk removing categories:', error);
        throw error;
      }
    },
    [dispatch, refreshCategoriesData]
  );

  // Rest of the original methods remain the same...
  const getCategories = useCallback(
    (options?: CategoryQueryOptions) => {
      return dispatch(fetchCategories(options));
    },
    [dispatch]
  );

  const getCategoryById = useCallback(
    (id: string, includeServices?: boolean) => {
      return dispatch(fetchCategoryById({ id, includeServices }));
    },
    [dispatch]
  );

  const editCategory = useCallback(
    (id: string, data: UpdateCategoryInput) => {
      return dispatch(updateCategory({ id, data }));
    },
    [dispatch]
  );

  const getDeletionInfo = useCallback(
    (id: string) => {
      return dispatch(getCategoryDeletionInfo(id));
    },
    [dispatch]
  );

  const searchCategoriesByQuery = useCallback(
    (query: string) => {
      return dispatch(searchCategories(query));
    },
    [dispatch]
  );

  const getCategoriesWithCounts = useCallback(() => {
    return dispatch(fetchCategoriesWithCounts());
  }, [dispatch]);

  const updateFilters = useCallback(
    (newFilters: Partial<CategoryQueryOptions>) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const selectCategory = useCallback(
    (category: Category | null) => {
      dispatch(setSelectedCategory(category));
    },
    [dispatch]
  );

  const clearCategoryError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCategoryDeletionInfo = useCallback(() => {
    dispatch(clearDeletionInfo());
  }, [dispatch]);

  const clearCategoryBulkDeleteResult = useCallback(() => {
    dispatch(clearBulkDeleteResult());
  }, [dispatch]);

  const resetCategoryState = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  // Helper methods remain the same...
  const getServiceCount = useCallback((categoryId: string): number => {
    const stat = stats?.find(s => s._id === categoryId);
    return stat?.serviceCount || 0;
  }, [stats]);

  const canDeleteSafely = useCallback((categoryId: string): boolean => {
    return getServiceCount(categoryId) === 0;
  }, [getServiceCount]);

  const getEmptyCategories = useCallback((): Category[] => {
    if (!stats) return [];
    const emptyCategoryIds = stats.filter(s => s.serviceCount === 0).map(s => s._id.toString());
    return categories.filter(cat => emptyCategoryIds.includes(cat._id.toString()));
  }, [categories, stats]);

  const getCategoriesWithServices = useCallback((): Category[] => {
    if (!stats) return [];
    const nonEmptyCategoryIds = stats.filter(s => s.serviceCount > 0).map(s => s._id.toString());
    return categories.filter(cat => nonEmptyCategoryIds.includes(cat._id.toString()));
  }, [categories, stats]);

  const getDeletionSummary = useCallback(() => {
    if (!deletionInfo) return null;
    
    return {
      categoryName: deletionInfo.categoryName,
      serviceCount: deletionInfo.serviceCount,
      canDeleteSafely: deletionInfo.canDeleteSafely,
      affectedServices: deletionInfo.services,
      recommendedAction: deletionInfo.canDeleteSafely 
        ? 'simple' 
        : deletionInfo.serviceCount > 0 
          ? 'migrate' 
          : 'safe'
    };
  }, [deletionInfo]);

  const getBulkDeleteSummary = useCallback(() => {
    if (!bulkDeleteResult) return null;
    
    return {
      totalAttempted: bulkDeleteResult.successful.length + bulkDeleteResult.failed.length,
      successful: bulkDeleteResult.successful.length,
      failed: bulkDeleteResult.failed.length,
      totalDeleted: bulkDeleteResult.totalDeleted,
      totalServicesMigrated: bulkDeleteResult.totalServicesMigrated,
      totalServicesDeleted: bulkDeleteResult.totalServicesDeleted,
      failedCategories: bulkDeleteResult.failed,
      successRate: Math.round((bulkDeleteResult.successful.length / (bulkDeleteResult.successful.length + bulkDeleteResult.failed.length)) * 100)
    };
  }, [bulkDeleteResult]);

  return {
    // State
    categories,
    selectedCategory,
    loading,
    error,
    filters,
    pagination,
    stats,
    deletionInfo,
    bulkDeleteResult,
        
    // Enhanced CRUD Actions
    getCategories,
    getCategoryById,
    addCategory, // Enhanced with refresh
    editCategory,
    removeCategory, // Enhanced with refresh
    
    // Enhanced Delete Actions
    removeCategorySimple, // Enhanced with refresh
    removeCategorySafely, // Enhanced with refresh
    removeCategoryCascade, // Enhanced with refresh
    removeCategoryWithMigration, // Enhanced with refresh
    removeCategoryForce, // Enhanced with refresh
    getDeletionInfo,
    removeCategoriesBulk, // Enhanced with refresh
    
    // Other Actions
    searchCategoriesByQuery,
    getCategoriesWithCounts,
    refreshCategoriesData, // Enhanced
    refreshServiceCounts, // New method
    refreshAfterServiceOperation, // New method for service operations
    updateFilters,
    resetFilters,
    selectCategory,
    clearCategoryError,
    clearCategoryDeletionInfo,
    clearCategoryBulkDeleteResult,
    resetCategoryState,
    
    // Helper Methods
    getServiceCount,
    canDeleteSafely,
    getEmptyCategories,
    getCategoriesWithServices,
    getDeletionSummary,
    getBulkDeleteSummary,
  };
};