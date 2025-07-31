// src/store/slices/categorySlice.ts
import { CategoryApi } from '@/lib/admin/client-api/categoryApi';
import { CategoryQueryOptions } from '@/lib/admin/services/categoryService';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '../types/dataTypes';
import { CategoryDeleteOptions } from '@/lib/admin/services/categoryService';

// Import the API's delete options type to ensure compatibility
type ApiDeleteOptions = {
  force?: boolean;
  cascade?: boolean;
  migrateTo?: string;
  createDefault?: boolean;
};

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
  filters: CategoryQueryOptions;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: Array<{
    _id: string;
    categoryName: string;
    serviceCount: number;
  }> | null;
  deletionInfo: {
    categoryName: string;
    serviceCount: number;
    services: Array<{ _id: string; title: string; }>;
    canDeleteSafely: boolean;
  } | null;
  bulkDeleteResult: {
    successful: string[];
    failed: Array<{ id: string; error: string; }>;
    totalDeleted: number;
    totalServicesMigrated: number;
    totalServicesDeleted: number;
  } | null;
}

const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    total: 0,
    page: 1,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  stats: null,
  deletionInfo: null,
  bulkDeleteResult: null,
};

// Helper function to convert CategoryDeleteOptions to ApiDeleteOptions
const convertToApiOptions = (options?: CategoryDeleteOptions): ApiDeleteOptions | undefined => {
  if (!options) return undefined;
  
  return {
    force: options.force,
    cascade: options.cascade,
    createDefault: options.createDefault,
    // Convert ObjectId to string if needed
    migrateTo: options.migrateTo ? options.migrateTo.toString() : undefined,
  };
};

// Async Thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (
    args: CategoryQueryOptions | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await CategoryApi.getCategories(args);
      return response;
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to fetch category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async ({ id, includeServices }: { id: string; includeServices?: boolean }, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.getCategoryById(id, includeServices);
      return response;
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to get category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData: CreateCategoryInput, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.createCategory(categoryData);
      return response;
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to create category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }: { id: string; data: UpdateCategoryInput }, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.updateCategory(id, data);
      return response;
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to update category';
      return rejectWithValue(errorMessage);
    }
  }
);

// Updated delete category thunk with proper type conversion
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async ({ id, options }: { id: string; options?: CategoryDeleteOptions }, { rejectWithValue }) => {
    try {
      const apiOptions = convertToApiOptions(options);
      const response = await CategoryApi.deleteCategory(id, apiOptions);
      return { id, response };
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to delete category';
      return rejectWithValue(errorMessage);
    }
  }
);

// New thunks for specific delete operations
export const simpleDeleteCategory = createAsyncThunk(
  'categories/simpleDeleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.simpleDeleteCategory(id);
      return { id, response };
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to delete category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const safeDeleteCategory = createAsyncThunk(
  'categories/safeDeleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.safeDeleteCategory(id);
      return { id, response };
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to safely delete category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const cascadeDeleteCategory = createAsyncThunk(
  'categories/cascadeDeleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.cascadeDeleteCategory(id);
      return { id, response };
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to cascade delete category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const migrateDeleteCategory = createAsyncThunk(
  'categories/migrateDeleteCategory',
  async ({ id, targetCategoryId }: { id: string; targetCategoryId: string }, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.migrateDeleteCategory(id, targetCategoryId);
      return { id, response };
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to migrate delete category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const forceDeleteCategory = createAsyncThunk(
  'categories/forceDeleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.forceDeleteCategory(id);
      return { id, response };
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to force delete category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const getCategoryDeletionInfo = createAsyncThunk(
  'categories/getCategoryDeletionInfo',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.getCategoryDeletionInfo(id);
      return response;
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to get deletion info';
      return rejectWithValue(errorMessage);
    }
  }
);

export const bulkDeleteCategories = createAsyncThunk(
  'categories/bulkDeleteCategories',
  async ({ categoryIds, options }: { categoryIds: string[]; options?: CategoryDeleteOptions }, { rejectWithValue }) => {
    try {
      const apiOptions = convertToApiOptions(options);
      const response = await CategoryApi.bulkDeleteCategories(categoryIds, apiOptions);
      return response;
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to bulk delete categories';
      return rejectWithValue(errorMessage);
    }
  }
);

export const searchCategories = createAsyncThunk(
  'categories/searchCategories',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.searchCategories(query);
      return response;
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to search category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCategoriesWithCounts = createAsyncThunk(
  'categories/fetchCategoriesWithCounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.getCategoriesWithCounts();
      return response;
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to fetch category counts';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
export const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CategoryQueryOptions>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearDeletionInfo: (state) => {
      state.deletionInfo = null;
    },
    clearBulkDeleteResult: (state) => {
      state.bulkDeleteResult = null;
    },
    resetState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          hasNext: action.payload.page < action.payload.totalPages,
          hasPrev: action.payload.page > 1,
        };
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Category By ID
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Category
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.categories.unshift(action.payload);
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.categories.findIndex(cat => cat._id === action.payload!._id);
          if (index !== -1) {
            state.categories[index] = action.payload;
          }
          if (state.selectedCategory && state.selectedCategory._id === action.payload._id) {
            state.selectedCategory = action.payload;
          }
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Helper function to handle delete success
    const handleDeleteSuccess = (state: CategoryState, categoryId: string) => {
      state.loading = false;
      state.categories = state.categories.filter(cat => cat._id.toString() !== categoryId);
      if (state.selectedCategory && state.selectedCategory._id.toString() === categoryId) {
        state.selectedCategory = null;
      }
    };

    // Helper function to handle delete pending
    const handleDeletePending = (state: CategoryState) => {
      state.loading = true;
      state.error = null;
    };

    // Helper function to handle delete rejected
    const handleDeleteRejected = (state: CategoryState, action: PayloadAction<unknown>) => {
      state.loading = false;
      state.error = action.payload as string;
    };

    // Delete Category (generic)
    builder
      .addCase(deleteCategory.pending, handleDeletePending)
      .addCase(deleteCategory.fulfilled, (state, action) => {
        handleDeleteSuccess(state, action.payload.id);
      })
      .addCase(deleteCategory.rejected, handleDeleteRejected);

    // Simple Delete Category
    builder
      .addCase(simpleDeleteCategory.pending, handleDeletePending)
      .addCase(simpleDeleteCategory.fulfilled, (state, action) => {
        handleDeleteSuccess(state, action.payload.id);
      })
      .addCase(simpleDeleteCategory.rejected, handleDeleteRejected);

    // Safe Delete Category
    builder
      .addCase(safeDeleteCategory.pending, handleDeletePending)
      .addCase(safeDeleteCategory.fulfilled, (state, action) => {
        handleDeleteSuccess(state, action.payload.id);
      })
      .addCase(safeDeleteCategory.rejected, handleDeleteRejected);

    // Cascade Delete Category
    builder
      .addCase(cascadeDeleteCategory.pending, handleDeletePending)
      .addCase(cascadeDeleteCategory.fulfilled, (state, action) => {
        handleDeleteSuccess(state, action.payload.id);
      })
      .addCase(cascadeDeleteCategory.rejected, handleDeleteRejected);

    // Migrate Delete Category
    builder
      .addCase(migrateDeleteCategory.pending, handleDeletePending)
      .addCase(migrateDeleteCategory.fulfilled, (state, action) => {
        handleDeleteSuccess(state, action.payload.id);
      })
      .addCase(migrateDeleteCategory.rejected, handleDeleteRejected);

    // Force Delete Category
    builder
      .addCase(forceDeleteCategory.pending, handleDeletePending)
      .addCase(forceDeleteCategory.fulfilled, (state, action) => {
        handleDeleteSuccess(state, action.payload.id);
      })
      .addCase(forceDeleteCategory.rejected, handleDeleteRejected);

    // Get Category Deletion Info
    builder
      .addCase(getCategoryDeletionInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoryDeletionInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.deletionInfo = action.payload;
      })
      .addCase(getCategoryDeletionInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Bulk Delete Categories
    builder
      .addCase(bulkDeleteCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkDeleteCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.bulkDeleteResult = action.payload;
        // Remove successfully deleted categories from the state
        state.categories = state.categories.filter(
          cat => !action.payload.successful.includes(cat._id.toString())
        );
      })
      .addCase(bulkDeleteCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Search Categories
    builder
      .addCase(searchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(searchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Categories with Counts
    builder
      .addCase(fetchCategoriesWithCounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesWithCounts.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchCategoriesWithCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedCategory,
  clearError,
  clearDeletionInfo,
  clearBulkDeleteResult,
  resetState,
} = categorySlice.actions;

export default categorySlice.reducer;