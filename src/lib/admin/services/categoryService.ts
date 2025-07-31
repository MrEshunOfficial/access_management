// src/services/category.service.ts

import { CategoryModel, ICategoryLean } from "@/app/models/category-service-models/categoryModel";
import { ServiceModel } from "@/app/models/category-service-models/serviceModel";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "@/store/types/dataTypes";
import { Types } from "mongoose";
import type { PipelineStage } from "mongoose";

// Updated interfaces to match your type definitions
export interface CategoryDeleteOptions {
  force?: boolean;         
  cascade?: boolean;       
  migrateTo?: Types.ObjectId | string;     
  createDefault?: boolean;
}

export interface CategoryQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'serviceCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  tags?: string[];
  includeServices?: boolean;
}

export interface CategoryDeletionInfo {
  categoryName: string;
  serviceCount: number;
  services: Array<{ _id: string; title: string; }>;
  canDeleteSafely: boolean;
}

export interface CategoryDeleteResult {
  success: boolean; 
  deletedServicesCount?: number; 
  migratedServicesCount?: number; 
  message?: string;
}

export interface CategoryBulkDeleteResult {
  successful: string[];
  failed: Array<{ id: string; error: string; }>;
  totalDeleted: number;
  totalServicesMigrated: number;
  totalServicesDeleted: number;
}

export interface CategoryWithCount {
  _id: string;
  categoryName: string;
  serviceCount: number;
}

export interface CategoryQueryResult {
  categories: Category[];
  total: number;
  page: number;
  totalPages: number;
}

export class CategoryService {
  private static async updateCategoryServiceCount(categoryId: string | Types.ObjectId): Promise<void> {
    try {
      const id = typeof categoryId === 'string' ? categoryId : categoryId.toString();
      
      if (!Types.ObjectId.isValid(id)) {
        console.warn(`Invalid category ID provided: ${id}`);
        return;
      }
      
      const serviceCount = await ServiceModel?.countDocuments({ categoryId: new Types.ObjectId(id) }) ?? 0;
      await CategoryModel.findByIdAndUpdate(id, { serviceCount }, { new: false });
    } catch (error) {
      console.error(`Failed to update service count for category ${categoryId}:`, error);
    }
  }

  /**
   * Create a new category
   */
  static async createCategory(input: CreateCategoryInput): Promise<Category> {
    try {
      // Check for existing category with case-insensitive search
      const existingCategory = await CategoryModel.findOne({
        categoryName: { $regex: new RegExp(`^${input.categoryName.trim()}$`, 'i') }
      }).lean();

      if (existingCategory) {
        throw new Error('Category with this name already exists');
      }

      const categoryData = {
        ...input,
        categoryName: input.categoryName.trim(),
        serviceCount: 0,
        serviceIds: [] as Types.ObjectId[]
      };

      const category = new CategoryModel(categoryData);
      const savedCategory = await category.save();
      
      return CategoryModel.transformLeanToCategory(savedCategory.toObject());
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create category: ${error.message}`);
      }
      throw new Error('Failed to create category');
    }
  }

  /**
   * Get category by ID with proper type handling
   */
  static async getCategoryById(
    id: string | Types.ObjectId, 
    includeServices: boolean = false
  ): Promise<Category | null> {
    try {
      const categoryId = typeof id === 'string' ? id : id.toString();
      
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new Error('Invalid category ID');
      }

      let query = CategoryModel.findById(categoryId);
      
      if (includeServices) {
        query = query.populate('services');
      }

      const category = await query.lean<ICategoryLean>();
      
      if (!category) {
        return null;
      }

      return CategoryModel.transformLeanToCategory(category);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get category: ${error.message}`);
      }
      throw new Error('Failed to get category');
    }
  }

  /**
   * Get all categories with filtering and pagination - optimized
   */
  static async getCategories(options: CategoryQueryOptions = {}): Promise<CategoryQueryResult> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        tags,
        includeServices = false
      } = options;

      // Validate pagination parameters
      const validatedPage = Math.max(1, page);
      const validatedLimit = Math.min(Math.max(1, limit), 100); // Cap at 100 for performance

      // Build filter query with proper indexing
      const filter: Record<string, unknown> = {};

      if (search?.trim()) {
        const searchRegex = { $regex: search.trim(), $options: 'i' };
        filter.$or = [
          { categoryName: searchRegex },
          { description: searchRegex }
        ];
      }

      if (tags && tags.length > 0) {
        filter.tags = { $in: tags };
      }

      // Build sort object with proper field mapping
      const sortOptions: Record<string, 1 | -1> = {};
      switch (sortBy) {
        case 'name':
          sortOptions.categoryName = sortOrder === 'asc' ? 1 : -1;
          break;
        case 'serviceCount':
          sortOptions.serviceCount = sortOrder === 'asc' ? 1 : -1;
          break;
        default:
          sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
      }

      const skip = (validatedPage - 1) * validatedLimit;

      // Use aggregation for better performance with counting
      const pipeline: PipelineStage[] = [
        { $match: filter },
        {
          $facet: {
            data: [
              { $sort: sortOptions },
              { $skip: skip },
              { $limit: validatedLimit },
              ...(includeServices ? [
                {
                  $lookup: {
                    from: 'services',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'services'
                  }
                }
              ] : [])
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }
      ];

      const [result] = await CategoryModel.aggregate(pipeline);
      const categories = result.data as ICategoryLean[];
      const total = result.totalCount[0]?.count || 0;

      const transformedCategories = categories.map(cat => 
        CategoryModel.transformLeanToCategory(cat)
      );

      return {
        categories: transformedCategories,
        total,
        page: validatedPage,
        totalPages: Math.ceil(total / validatedLimit)
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get categories: ${error.message}`);
      }
      throw new Error('Failed to get categories');
    }
  }

  /**
   * Update category by ID with improved validation
   */
  static async updateCategory(
    id: string | Types.ObjectId, 
    input: UpdateCategoryInput
  ): Promise<Category | null> {
    try {
      const categoryId = typeof id === 'string' ? id : id.toString();
      
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new Error('Invalid category ID');
      }

      // Clean input data
      const updateData = { ...input };
      if (updateData.categoryName) {
        updateData.categoryName = updateData.categoryName.trim();
      }

      // Check for duplicate name if categoryName is being updated
      if (updateData.categoryName) {
        const existingCategory = await CategoryModel.findOne({
          _id: { $ne: categoryId },
          categoryName: { $regex: new RegExp(`^${updateData.categoryName}$`, 'i') }
        }).lean();

        if (existingCategory) {
          throw new Error('Category with this name already exists');
        }
      }

      const updatedCategory = await CategoryModel.findByIdAndUpdate(
        categoryId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).lean<ICategoryLean>();

      if (!updatedCategory) {
        return null;
      }

      return CategoryModel.transformLeanToCategory(updatedCategory);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update category: ${error.message}`);
      }
      throw new Error('Failed to update category');
    }
  }

  /**
   * Delete category by ID with multiple handling options for associated services
   */
  static async deleteCategory(
    id: string | Types.ObjectId, 
    options: CategoryDeleteOptions = {}
  ): Promise<CategoryDeleteResult> {
    try {
      const categoryId = typeof id === 'string' ? id : id.toString();
      
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new Error('Invalid category ID');
      }

      const { force = false, cascade = false, migrateTo, createDefault = false } = options;

      // Check if category exists
      const category = await CategoryModel.findById(categoryId).lean();
      if (!category) {
        throw new Error('Category not found');
      }

      // Check for associated services using proper ObjectId
      const serviceCount = await ServiceModel?.countDocuments({ 
        categoryId: new Types.ObjectId(categoryId) 
      }) ?? 0;
      
      if (serviceCount > 0) {
        if (cascade) {
          // Delete all associated services
          const deleteResult = await ServiceModel?.deleteMany({ 
            categoryId: new Types.ObjectId(categoryId) 
          });
          const deletedCount = deleteResult?.deletedCount ?? 0;
          
          // Then delete the category
          await CategoryModel.findByIdAndDelete(categoryId);
          
          return {
            success: true,
            deletedServicesCount: deletedCount,
            message: `Category deleted along with ${deletedCount} associated services`
          };
          
        } else if (migrateTo) {
          // Migrate services to another category
          const targetId = typeof migrateTo === 'string' ? migrateTo : migrateTo.toString();
          const migratedCount = await this.migrateServices(categoryId, targetId);
          
          // Then delete the category
          await CategoryModel.findByIdAndDelete(categoryId);
          
          return {
            success: true,
            migratedServicesCount: migratedCount,
            message: `Category deleted and ${migratedCount} services migrated`
          };
          
        } else if (createDefault) {
          // Create/get default category and migrate
          const defaultCategoryId = await this.getOrCreateDefaultCategory();
          const migratedCount = await this.migrateServices(categoryId, defaultCategoryId);
          
          // Then delete the category
          await CategoryModel.findByIdAndDelete(categoryId);
          
          return {
            success: true,
            migratedServicesCount: migratedCount,
            message: `Category deleted and ${migratedCount} services moved to 'Uncategorized'`
          };
          
        } else if (force) {
          // Force delete without handling services (dangerous!)
          await CategoryModel.findByIdAndDelete(categoryId);
          
          return {
            success: true,
            message: `Category force deleted. ${serviceCount} services now have invalid category references!`
          };
          
        } else {
          // Default behavior - prevent deletion
          throw new Error(
            `Cannot delete category with ${serviceCount} associated services. ` +
            'Use one of these options: cascade, migrateTo, createDefault, or force'
          );
        }
      } else {
        // No associated services, safe to delete
        await CategoryModel.findByIdAndDelete(categoryId);
        return {
          success: true,
          message: 'Category deleted successfully'
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete category: ${error.message}`);
      }
      throw new Error('Failed to delete category');
    }
  }

  /**
   * Helper: Migrate services from one category to another with proper type handling
   */
  private static async migrateServices(
    fromCategoryId: string | Types.ObjectId, 
    toCategoryId: string | Types.ObjectId
  ): Promise<number> {
    try {
      const fromId = typeof fromCategoryId === 'string' ? fromCategoryId : fromCategoryId.toString();
      const toId = typeof toCategoryId === 'string' ? toCategoryId : toCategoryId.toString();
      
      if (!Types.ObjectId.isValid(toId)) {
        throw new Error('Invalid target category ID');
      }

      // Verify target category exists
      const targetCategory = await CategoryModel.findById(toId).lean();
      if (!targetCategory) {
        throw new Error('Target category not found');
      }

      // Migrate services using proper ObjectId types
      const migrateResult = await ServiceModel?.updateMany(
        { categoryId: new Types.ObjectId(fromId) },
        { $set: { categoryId: new Types.ObjectId(toId) } }
      );

      const migratedCount = migrateResult?.modifiedCount ?? 0;

      // Update service counts for both categories
      if (migratedCount > 0) {
        await Promise.all([
          this.updateCategoryServiceCount(fromId),
          this.updateCategoryServiceCount(toId)
        ]);
      }

      return migratedCount;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to migrate services: ${error.message}`);
      }
      throw new Error('Failed to migrate services');
    }
  }

  /**
   * Helper: Get or create default "Uncategorized" category
   */
  private static async getOrCreateDefaultCategory(): Promise<string> {
    try {
      const defaultCategory = await CategoryModel.findOneAndUpdate(
        { categoryName: { $regex: /^uncategorized$/i } },
        { 
          categoryName: 'Uncategorized',
          description: 'Default category for services without a specific category',
          tags: ['default', 'system'],
          serviceIds: [] as Types.ObjectId[]
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true 
        }
      );
      
      // Update service count for the default category
      await this.updateCategoryServiceCount(defaultCategory._id.toString());
      
      return defaultCategory._id.toString();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get/create default category: ${error.message}`);
      }
      throw new Error('Failed to get/create default category');
    }
  }

  /**
   * Get category deletion info (preview what will happen)
   */
  static async getCategoryDeletionInfo(id: string | Types.ObjectId): Promise<CategoryDeletionInfo> {
    try {
      const categoryId = typeof id === 'string' ? id : id.toString();
      
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new Error('Invalid category ID');
      }

      const category = await CategoryModel.findById(categoryId).lean();
      if (!category) {
        throw new Error('Category not found');
      }

      interface ServiceLean {
        _id: Types.ObjectId | string;
        title: string;
      }

      const services = await ServiceModel?.find({ categoryId: new Types.ObjectId(categoryId) })
        .select('_id title')
        .lean<ServiceLean[]>() ?? [];

      return {
        categoryName: category.categoryName,
        serviceCount: services.length,
        services: services.map(s => ({ 
          _id: (s._id as Types.ObjectId | string).toString(), 
          title: s.title 
        })),
        canDeleteSafely: services.length === 0
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get deletion info: ${error.message}`);
      }
      throw new Error('Failed to get deletion info');
    }
  }

  /**
   * Refresh all service counts - optimized with bulk operations
   */
  static async refreshAllServiceCounts(): Promise<{ updated: number; errors: number }> {
    try {
      // Use aggregation to calculate service counts efficiently
      const serviceCounts = await ServiceModel?.aggregate([
        {
          $group: {
            _id: '$categoryId',
            count: { $sum: 1 }
          }
        }
      ]) ?? [];

      // Create a map for quick lookup
      const countMap = new Map<string, number>();
      serviceCounts.forEach(item => {
        if (item._id) {
          countMap.set(item._id.toString(), item.count);
        }
      });

      // Get all categories
      const categories = await CategoryModel.find({}, '_id').lean();
      let updated = 0;
      let errors = 0;

      // Use bulk operations for better performance
      const bulkOps = categories.map(category => {
        const categoryId = category._id.toString();
        const serviceCount = countMap.get(categoryId) || 0;
        
        return {
          updateOne: {
            filter: { _id: category._id },
            update: { $set: { serviceCount } }
          }
        };
      });

      if (bulkOps.length > 0) {
        try {
          const result = await CategoryModel.bulkWrite(bulkOps);
          updated = result.modifiedCount;
        } catch (error) {
          console.error('Bulk update failed:', error);
          errors = bulkOps.length;
        }
      }

      return { updated, errors };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to refresh service counts: ${error.message}`);
      }
      throw new Error('Failed to refresh service counts');
    }
  }

  /**
   * Bulk delete categories with different strategies
   */
  static async bulkDeleteCategories(
    categoryIds: (string | Types.ObjectId)[],
    options: CategoryDeleteOptions = {}
  ): Promise<CategoryBulkDeleteResult> {
    const results: CategoryBulkDeleteResult = {
      successful: [],
      failed: [],
      totalDeleted: 0,
      totalServicesMigrated: 0,
      totalServicesDeleted: 0
    };

    for (const id of categoryIds) {
      try {
        const result = await this.deleteCategory(id, options);
        if (result.success) {
          const stringId = typeof id === 'string' ? id : id.toString();
          results.successful.push(stringId);
          results.totalDeleted++;
          results.totalServicesMigrated += result.migratedServicesCount ?? 0;
          results.totalServicesDeleted += result.deletedServicesCount ?? 0;
        }
      } catch (error) {
        const stringId = typeof id === 'string' ? id : id.toString();
        results.failed.push({
          id: stringId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Get categories with service counts - optimized with aggregation
   */
  static async getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
    try {
      return await CategoryModel.aggregate([
        {
          $lookup: {
            from: 'services',
            localField: '_id',
            foreignField: 'categoryId',
            as: 'services'
          }
        },
        {
          $project: {
            categoryName: 1,
            serviceCount: { $size: '$services' }
          }
        },
        {
          $sort: { serviceCount: -1 }
        }
      ]);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get category counts: ${error.message}`);
      }
      throw new Error('Failed to get category counts');
    }
  }

  /**
   * Search categories by name or tags - optimized with proper indexing
   */
  static async searchCategories(query: string): Promise<Category[]> {
    try {
      if (!query?.trim()) {
        return [];
      }

      const searchRegex = { $regex: query.trim(), $options: 'i' };
      
      const categories = await CategoryModel.find({
        $or: [
          { categoryName: searchRegex },
          { description: searchRegex },
          { tags: { $elemMatch: searchRegex } }
        ]
      })
      .sort({ serviceCount: -1, categoryName: 1 }) // Sort by relevance
      .limit(20) // Limit results for performance
      .lean<ICategoryLean[]>();

      return categories.map(cat => CategoryModel.transformLeanToCategory(cat));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search categories: ${error.message}`);
      }
      throw new Error('Failed to search categories');
    }
  }

  // Convenience methods with proper return types
  static async cascadeDeleteCategory(id: string | Types.ObjectId): Promise<{ 
    success: boolean; 
    deletedServicesCount: number; 
  }> {
    const result = await this.deleteCategory(id, { cascade: true });
    return {
      success: result.success,
      deletedServicesCount: result.deletedServicesCount ?? 0
    };
  }

  static async safeDeleteCategory(id: string | Types.ObjectId): Promise<{ 
    success: boolean; 
    migratedServicesCount: number; 
  }> {
    const result = await this.deleteCategory(id, { createDefault: true });
    return {
      success: result.success,
      migratedServicesCount: result.migratedServicesCount ?? 0
    };
  }

  static async forceDeleteCategory(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.deleteCategory(id, { force: true });
    return result.success;
  }
}