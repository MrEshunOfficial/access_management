// src/store/slices/serviceSlice.ts
import { IServiceDocument } from '@/app/models/category-service-models/serviceModel';
import { ServicesResponse, ServiceApi } from '@/lib/admin/client-api/serviceApi';
import { ServiceStats } from '@/lib/admin/services/serviceServices';
import { createSlice, createAsyncThunk, PayloadAction, Draft } from '@reduxjs/toolkit';
import { Types } from 'mongoose';

// Define API-compatible types that match what your ServiceApi expects
interface ApiServiceQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'popular' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  categoryId?: string; // API expects string, not ObjectId
  isActive?: boolean;
  popular?: boolean;
  tags?: string[];
  includeCategory?: boolean;
}

interface ApiCreateServiceInput {
  title: string;
  description: string;
  categoryId: string; // API expects string, not ObjectId
  serviceImage?: {
    url: string;
    serviceName: string;
  };
  popular?: boolean;
  isActive?: boolean;
  tags?: string[];
}

interface ApiUpdateServiceInput extends Partial<ApiCreateServiceInput> {
  _id?: string; // API expects string, not ObjectId
}

// Internal state types (can use ObjectId)
interface ServiceQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'popular' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  categoryId?: Types.ObjectId | string;
  isActive?: boolean;
  popular?: boolean;
  tags?: string[];
  includeCategory?: boolean;
}

interface CreateServiceInput {
  title: string;
  description: string;
  categoryId: Types.ObjectId | string;
  serviceImage?: {
    url: string;
    serviceName: string;
  };
  popular?: boolean;
  isActive?: boolean;
  tags?: string[];
}

interface UpdateServiceInput extends Partial<CreateServiceInput> {
  _id?: Types.ObjectId | string;
}

interface ServiceState {
  services: IServiceDocument[];
  popularServices: IServiceDocument[];
  selectedService: IServiceDocument | null;
  loading: boolean;
  error: string | null;
  filters: ServiceQueryOptions;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: ServiceStats | null;
}

const initialState: ServiceState = {
  services: [],
  popularServices: [],
  selectedService: null,
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    isActive: true,
  },
  pagination: {
    total: 0,
    page: 1,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  stats: null,
};

// Helper function to convert internal types to API types
const convertToApiFilters = (filters: ServiceQueryOptions): ApiServiceQueryOptions => {
  // Destructure and convert categoryId if needed
  const { categoryId, ...rest } = filters;
  const apiFilters: ApiServiceQueryOptions = {
    ...rest,
    categoryId: categoryId
      ? typeof categoryId === 'string'
        ? categoryId
        : categoryId.toString()
      : undefined,
  };
  return apiFilters;
};

const convertToApiCreateInput = (input: CreateServiceInput): ApiCreateServiceInput => {
  return {
    ...input,
    categoryId: typeof input.categoryId === 'string' 
      ? input.categoryId 
      : input.categoryId.toString()
  };
};

const convertToApiUpdateInput = (input: UpdateServiceInput): ApiUpdateServiceInput => {
  const apiInput: ApiUpdateServiceInput = {
    ...input,
    // Ensure _id is a string if present
    _id: input._id
      ? typeof input._id === 'string'
        ? input._id
        : input._id.toString()
      : undefined,
    // Ensure categoryId is a string if present
    categoryId: input.categoryId
      ? typeof input.categoryId === 'string'
        ? input.categoryId
        : input.categoryId.toString()
      : undefined,
  };

  return apiInput;
};

type PaginationResponseVariant = {
  total?: number;
  totalCount?: number;
  count?: number;
  page?: number;
  currentPage?: number;
  hasNext?: boolean;
  hasNextPage?: boolean;
  hasPrev?: boolean;
  hasPrevPage?: boolean;
} & Record<string, unknown>;

// Type guard functions
const hasDataProperty = (obj: unknown): obj is { data: unknown } => {
  return typeof obj === 'object' && obj !== null && 'data' in obj;
};

const hasServicesProperty = (obj: unknown): obj is { services: unknown } => {
  return typeof obj === 'object' && obj !== null && 'services' in obj;
};

const hasItemsProperty = (obj: unknown): obj is { items: unknown } => {
  return typeof obj === 'object' && obj !== null && 'items' in obj;
};

const isServiceDocumentArray = (arr: unknown): arr is IServiceDocument[] => {
  return Array.isArray(arr) && (
    arr.length === 0 || 
    (typeof arr[0] === 'object' && arr[0] !== null && '_id' in arr[0])
  );
};

const extractServicesFromResponse = (response: ServicesResponse): IServiceDocument[] => {
  if (hasDataProperty(response) && isServiceDocumentArray(response.data)) {
    return response.data;
  }
  
  if (hasServicesProperty(response) && isServiceDocumentArray(response.services)) {
    return response.services;
  }
  
  if (hasItemsProperty(response) && isServiceDocumentArray(response.items)) {
    return response.items;
  }
  
  if (isServiceDocumentArray(response)) {
    return response;
  }
  
  // If response is an object with unknown structure, log it and return empty array
  console.warn('Unknown ServicesResponse structure:', response);
  return [];
};

// Helper function to safely extract pagination info from response
const extractPaginationFromResponse = (response: ServicesResponse) => {
  const paginationResponse = response as unknown as PaginationResponseVariant;
  
  return {
    total: paginationResponse.total ?? paginationResponse.totalCount ?? paginationResponse.count ?? 0,
    page: paginationResponse.page ?? paginationResponse.currentPage ?? 1,
    hasNext: paginationResponse.hasNext ?? paginationResponse.hasNextPage ?? false,
    hasPrev: paginationResponse.hasPrev ?? paginationResponse.hasPrevPage ?? false,
  };
};

// Async Thunks
export const fetchServices = createAsyncThunk<
  ServicesResponse,
  ServiceQueryOptions | undefined,
  { rejectValue: string }
>(
  'services/fetchServices',
  async (filters, { rejectWithValue }) => {
    try {
      // Provide default filters if none are provided
      const defaultFilters: ServiceQueryOptions = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        isActive: true,
      };
      
      // Merge with provided filters
      const finalFilters: ServiceQueryOptions = {
        ...defaultFilters,
        ...filters,
      };
      
      // Convert to API-compatible format
      const apiFilters = convertToApiFilters(finalFilters);
      
      console.log('Fetching services with filters:', apiFilters);
      const response = await ServiceApi.getServices(apiFilters);
      console.log('Services fetched successfully:', response);
      
      return response;
    } catch (error) {
      console.error('Error in fetchServices thunk:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch services';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchServiceById = createAsyncThunk<
  IServiceDocument | null,
  { id: string; includeCategory?: boolean },
  { rejectValue: string }
>(
  'services/fetchServiceById',
  async ({ id, includeCategory }, { rejectWithValue }) => {
    try {
      const response = await ServiceApi.getServiceById(id, includeCategory);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch service';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createService = createAsyncThunk<
  IServiceDocument,
  CreateServiceInput,
  { rejectValue: string }
>(
  'services/createService',
  async (serviceData, { rejectWithValue }) => {
    try {
      // Convert internal type to API type
      const apiServiceData = convertToApiCreateInput(serviceData);
      const response = await ServiceApi.createService(apiServiceData);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create service';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateService = createAsyncThunk<
  IServiceDocument,
  { id: string; data: UpdateServiceInput },
  { rejectValue: string }
>(
  'services/updateService',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Convert internal type to API type
      const apiData = convertToApiUpdateInput(data);
      const response = await ServiceApi.updateService(id, apiData);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update service';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteService = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'services/deleteService',
  async (id, { rejectWithValue }) => {
    try {
      const success = await ServiceApi.deleteService(id);
      if (!success) {
        throw new Error('Failed to delete service');
      }
      return id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete service';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleServicePopular = createAsyncThunk<
  IServiceDocument,
  string,
  { rejectValue: string }
>(
  'services/toggleServicePopular',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await ServiceApi.togglePopular(id);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle service popularity';
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleServiceActive = createAsyncThunk<
  { updatedService: IServiceDocument; shouldRemoveFromList: boolean },
  string,
  { rejectValue: string }
>(
  'services/toggleServiceActive',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ServiceApi.toggleActive(id);
      // If service becomes inactive, it should be removed from the list
      const shouldRemoveFromList = !response.isActive;
      return { updatedService: response, shouldRemoveFromList };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle service active status';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchPopularServices = createAsyncThunk<
  IServiceDocument[],
  { limit?: number },
  { rejectValue: string }
>(
  'services/fetchPopularServices',
  async ({ limit }, { rejectWithValue }) => {
    try {
      const response = await ServiceApi.getPopularServices(limit);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch popular services';
      return rejectWithValue(errorMessage);
    }
  }
);

export const searchServices = createAsyncThunk<
  IServiceDocument[],
  string,
  { rejectValue: string }
>(
  'services/searchServices',
  async (query, { rejectWithValue }) => {
    try {
      const response = await ServiceApi.searchServices(query);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search services';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchServiceStats = createAsyncThunk<
  ServiceStats,
  void,
  { rejectValue: string }
>(
  'services/fetchServiceStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ServiceApi.getServiceStats();
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch service stats';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchServicesByCategory = createAsyncThunk<
  IServiceDocument[],
  string,
  { rejectValue: string }
>(
  'services/fetchServicesByCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await ServiceApi.getServicesByCategory(categoryId);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch services by category';
      return rejectWithValue(errorMessage);
    }
  }
);

// Helper function to update service in array
const updateServiceInArray = (
  services: Draft<IServiceDocument>[],
  updatedService: IServiceDocument
): void => {
  const index = services.findIndex(service => service._id === updatedService._id);
  if (index !== -1) {
    services[index] = updatedService as Draft<IServiceDocument>;
  }
};

// Helper function to remove service from array
const removeServiceFromArray = (
  services: Draft<IServiceDocument>[],
  serviceId: string
): Draft<IServiceDocument>[] => {
  return services.filter(service => String(service._id) !== serviceId);
};

// Slice
export const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ServiceQueryOptions>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedService: (state, action: PayloadAction<IServiceDocument | null>) => {
      state.selectedService = action.payload ? JSON.parse(JSON.stringify(action.payload)) : null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch Services - FIXED with safe property access
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('fetchServices pending');
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        console.log('fetchServices fulfilled with payload:', action.payload);
        state.loading = false;
        state.error = null;
        
        // FIXED: Use helper function to safely extract services
        const services = extractServicesFromResponse(action.payload);
        state.services = services as Draft<IServiceDocument>[];
        
        // FIXED: Use helper function to safely extract pagination info
        const paginationInfo = extractPaginationFromResponse(action.payload);
        const limit = state.filters.limit || 10;
        const totalPages = Math.ceil(paginationInfo.total / limit);
        
        state.pagination = {
          total: paginationInfo.total,
          page: paginationInfo.page,
          totalPages,
          hasNext: paginationInfo.hasNext || paginationInfo.page < totalPages,
          hasPrev: paginationInfo.hasPrev || paginationInfo.page > 1,
        };
        
        console.log('Services state updated:', state.services.length, 'services');
      })
      .addCase(fetchServices.rejected, (state, action) => {
        console.error('fetchServices rejected:', action.payload);
        state.loading = false;
        state.error = action.payload || 'Failed to fetch services';
        // Don't clear services on error, keep existing ones
      });

    // Fetch Service By ID
    builder
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedService = action.payload ? JSON.parse(JSON.stringify(action.payload)) : null;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch service';
      });

    // Create Service
    builder
      .addCase(createService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.loading = false;
        // Only add to list if the new service is active
        if (action.payload.isActive) {
          state.services.unshift(action.payload as Draft<IServiceDocument>);
        }
      })
      .addCase(createService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create service';
      });

    // Update Service
    builder
      .addCase(updateService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.loading = false;
        const updatedService = action.payload;
        
        // If service becomes inactive, remove it from the list
        if (!updatedService.isActive) {
          state.services = removeServiceFromArray(state.services, String(updatedService._id));
        } else {
          updateServiceInArray(state.services, updatedService);
        }
        
        if (state.selectedService && state.selectedService._id === updatedService._id) {
          state.selectedService = JSON.parse(JSON.stringify(updatedService));
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to update service';
      });

    // Delete Service
    builder
      .addCase(deleteService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.services = state.services.filter(service => 
          String(service._id) !== deletedId
        ) as Draft<IServiceDocument>[];
        
        if (state.selectedService && String(state.selectedService._id) === deletedId) {
          state.selectedService = null;
        }
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete service';
      });

    // Toggle Service Popular
    builder
      .addCase(toggleServicePopular.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleServicePopular.fulfilled, (state, action) => {
        state.loading = false;
        const updatedService = action.payload;
        
        updateServiceInArray(state.services, updatedService);
        
        if (state.selectedService && state.selectedService._id === updatedService._id) {
          state.selectedService = JSON.parse(JSON.stringify(updatedService));
        }
      })
      .addCase(toggleServicePopular.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to toggle service popularity';
      });

    // Toggle Service Active
    builder
      .addCase(toggleServiceActive.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleServiceActive.fulfilled, (state, action) => {
        state.loading = false;
        const { updatedService, shouldRemoveFromList } = action.payload;
        
        if (shouldRemoveFromList) {
          // Remove inactive service from the list
          state.services = removeServiceFromArray(state.services, String(updatedService._id));
        } else {
          // Update the service in the list
          updateServiceInArray(state.services, updatedService);
        }
        
        if (state.selectedService && state.selectedService._id === updatedService._id) {
          state.selectedService = JSON.parse(JSON.stringify(updatedService));
        }
      })
      .addCase(toggleServiceActive.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to toggle service active status';
      });

    // Fetch Popular Services
    builder
      .addCase(fetchPopularServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularServices.fulfilled, (state, action) => {
        state.loading = false;
        state.popularServices = action.payload as Draft<IServiceDocument>[];
      })
      .addCase(fetchPopularServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch popular services';
      });

    // Search Services
    builder
      .addCase(searchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload as Draft<IServiceDocument>[];
      })
      .addCase(searchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to search services';
      });

    // Fetch Service Stats
    builder
      .addCase(fetchServiceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchServiceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch service stats';
      });

    // Fetch Services By Category
    builder
      .addCase(fetchServicesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload as Draft<IServiceDocument>[];
      })
      .addCase(fetchServicesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch services by category';
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedService,
  clearError,
  resetState,
} = serviceSlice.actions;

export default serviceSlice.reducer;

// Export types for use in components
export type { ServiceQueryOptions, CreateServiceInput, UpdateServiceInput };