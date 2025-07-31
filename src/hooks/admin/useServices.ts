// src/hooks/useServices.ts
import { IServiceDocument } from '@/app/models/category-service-models/serviceModel';
import { AppDispatch, RootState } from '@/store';
import { clearError, resetState } from '@/store/slices/categorySlice';
import { setFilters, clearFilters } from '@/store/slices/serviceSlice';
import { ServiceQueryOptions, fetchServices, fetchServiceById, createService, updateService, deleteService, toggleServicePopular, toggleServiceActive, fetchPopularServices, searchServices, fetchServiceStats, fetchServicesByCategory, setSelectedService } from '@/store/slices/serviceSlice';
import { CreateServiceInput, UpdateServiceInput } from '@/store/types/dataTypes';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useServices = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    services,
    popularServices,
    selectedService,
    loading,
    error,
    filters,
    pagination,
    stats,
  } = useSelector((state: RootState) => state.services);

  // Fetch all services with optional filters
  const getServices = useCallback(
    (options?: ServiceQueryOptions) => {
      return dispatch(fetchServices(options));
    },
    [dispatch]
  );

  // Fetch a single service by ID
  const getServiceById = useCallback(
    (id: string, includeCategory?: boolean) => {
      return dispatch(fetchServiceById({ id, includeCategory }));
    },
    [dispatch]
  );

  // Create a new service
  const addService = useCallback(
    (serviceData: CreateServiceInput) => {
      return dispatch(createService(serviceData));
    },
    [dispatch]
  );

  // Update an existing service
  const editService = useCallback(
    (id: string, data: UpdateServiceInput) => {
      return dispatch(updateService({ id, data }));
    },
    [dispatch]
  );

  // Delete a service
  const removeService = useCallback(
    (id: string) => {
      return dispatch(deleteService(id));
    },
    [dispatch]
  );

  // Toggle service popular status
  const togglePopular = useCallback(
    (id: string) => {
      return dispatch(toggleServicePopular(id));
    },
    [dispatch]
  );

  // Toggle service active status
  const toggleActive = useCallback(
    (id: string) => {
      return dispatch(toggleServiceActive(id));
    },
    [dispatch]
  );

  // Fetch popular services
  const getPopularServices = useCallback(
    (limit?: number) => {
      return dispatch(fetchPopularServices({ limit }));
    },
    [dispatch]
  );

  // Search services
  const searchServicesByQuery = useCallback(
    (query: string) => {
      return dispatch(searchServices(query));
    },
    [dispatch]
  );

  // Fetch service statistics
  const getServiceStats = useCallback(() => {
    return dispatch(fetchServiceStats());
  }, [dispatch]);

  // Fetch services by category
  const getServicesByCategory = useCallback(
    (categoryId: string) => {
      return dispatch(fetchServicesByCategory(categoryId));
    },
    [dispatch]
  );

  // Set filters
  const updateFilters = useCallback(
    (newFilters: Partial<ServiceQueryOptions>) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  // Clear filters
  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Set selected service
  const selectService = useCallback(
    (service: IServiceDocument | null) => {
      dispatch(setSelectedService(service));
    },
    [dispatch]
  );

  // Clear error
  const clearServiceError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Reset state
  const resetServiceState = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  return {
    // State
    services,
    popularServices,
    selectedService,
    loading,
    error,
    filters,
    pagination,
    stats,
    
    // Actions
    getServices,
    getServiceById,
    addService,
    editService,
    removeService,
    togglePopular,
    toggleActive,
    getPopularServices,
    searchServicesByQuery,
    getServiceStats,
    getServicesByCategory,
    updateFilters,
    resetFilters,
    selectService,
    clearServiceError,
    resetServiceState,
  };
};