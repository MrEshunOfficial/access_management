// src/services/service.service.ts
import { CategoryModel } from "@/app/models/category-service-models/categoryModel";
import { ServiceModel, IServiceDocument } from "@/app/models/category-service-models/serviceModel";
import { CreateServiceInput, PaginatedResponse, Service, UpdateServiceInput, ServiceFilters } from "@/store/types/dataTypes";
import { Types } from "mongoose";


export interface ServiceQueryOptions {
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

export interface ServiceStats {
  total: number;
  active: number;
  popular: number;
  byCategory: Array<{ categoryName: string; count: number }>;
}

export class ServiceService {
  /**
   * Private helper to validate ObjectId
   */
  private static validateObjectId(id: string | Types.ObjectId, fieldName: string = 'ID'): void {
    const idString = typeof id === 'string' ? id : id.toString();
    if (!Types.ObjectId.isValid(idString)) {
      throw new Error(`Invalid ${fieldName}: ${idString}`);
    }
  }

  /**
   * Private helper to convert string to ObjectId if needed
   */
  private static toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    return typeof id === 'string' ? new Types.ObjectId(id) : id;
  }

  /**
   * Update category service count - Fixed to handle both string and ObjectId
   */
  private static async updateCategoryServiceCount(categoryId: string | Types.ObjectId): Promise<void> {
    try {
      this.validateObjectId(categoryId, 'category ID');
      
      const objectId = this.toObjectId(categoryId);
      const serviceCount = await ServiceModel?.countDocuments({ categoryId: objectId }) ?? 0;
      
      await CategoryModel.findByIdAndUpdate(objectId, { serviceCount });
    } catch (error) {
      console.error(`Failed to update service count for category ${categoryId}:`, error);
    }
  }

  /**
   * Create a new service - Fixed input type consistency
   */
  static async createService(input: CreateServiceInput): Promise<IServiceDocument> {
    try {
      // Validate and convert categoryId to ObjectId
      this.validateObjectId(input.categoryId, 'category ID');
      const categoryObjectId = this.toObjectId(input.categoryId);

      // Validate category exists
      const categoryExists = await CategoryModel.findById(categoryObjectId);
      if (!categoryExists) {
        throw new Error('Category not found');
      }

      // Create service with proper ObjectId
      const serviceData = {
        ...input,
        categoryId: categoryObjectId
      };

      const service = new ServiceModel!(serviceData);
      const savedService = await service.save();
      
      // Update category service count
      await this.updateCategoryServiceCount(categoryObjectId);
      
      return savedService;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create service: ${error.message}`);
      }
      throw new Error('Failed to create service');
    }
  }

  /**
   * Get service by ID - Improved error handling and type safety
   */
  static async getServiceById(
    id: string | Types.ObjectId, 
    includeCategory: boolean = false
  ): Promise<IServiceDocument | null> {
    try {
      this.validateObjectId(id, 'service ID');
      const objectId = this.toObjectId(id);

      let query = ServiceModel?.findById(objectId);
      
      if (includeCategory) {
        query = query?.populate('category');
      }

      return await query?.exec() ?? null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get service: ${error.message}`);
      }
      throw new Error('Failed to get service');
    }
  }

  /**
   * Get all services with filtering and pagination - Fixed return type consistency
   */
  static async getServices(options: ServiceQueryOptions = {}): Promise<PaginatedResponse<Service>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        categoryId,
        isActive,
        popular,
        tags,
        includeCategory = false
      } = options;

      // Build filter query
      const filter: Record<string, unknown> = {};

      if (search) {
        filter.$text = { $search: search };
      }

      if (categoryId) {
        this.validateObjectId(categoryId, 'category ID');
        filter.categoryId = this.toObjectId(categoryId);
      }

      if (typeof isActive === 'boolean') {
        filter.isActive = isActive;
      }

      if (typeof popular === 'boolean') {
        filter.popular = popular;
      }

      if (tags && tags.length > 0) {
        filter.tags = { $in: tags };
      }

      // Build sort object
      const sortOptions: Record<string, 1 | -1> = {};
      switch (sortBy) {
        case 'title':
          sortOptions.title = sortOrder === 'asc' ? 1 : -1;
          break;
        case 'popular':
          sortOptions.popular = sortOrder === 'asc' ? 1 : -1;
          break;
        default:
          sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
      }

      const skip = (page - 1) * limit;

      let query = ServiceModel?.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      if (includeCategory) {
        query = query?.populate('category');
      }

      const [servicesRaw, totalRaw] = await Promise.all([
        query?.exec(),
        ServiceModel?.countDocuments(filter)
      ]);

      const services: IServiceDocument[] = servicesRaw ?? [];
      const total: number = totalRaw ?? 0;
      const totalPages = Math.ceil(total / limit);

      // Transform to Service type for consistency with your types
      const transformedServices: Service[] = services.map(service => ({
        _id: service._id,
        title: service.title,
        description: service.description,
        categoryId: service.categoryId,
        serviceImage: service.serviceImage,
        popular: service.popular,
        isActive: service.isActive,
        tags: service.tags,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      }));

      return {
        data: transformedServices,
        total,
        page,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get services: ${error.message}`);
      }
      throw new Error('Failed to get services');
    }
  }

  /**
   * Update service by ID - Fixed input type and validation
   */
  static async updateService(
    id: string | Types.ObjectId, 
    input: UpdateServiceInput
  ): Promise<IServiceDocument | null> {
    try {
      this.validateObjectId(id, 'service ID');
      const serviceObjectId = this.toObjectId(id);

      // Get current service to check if category is changing
      const currentService = await ServiceModel?.findById(serviceObjectId);
      if (!currentService) {
        throw new Error('Service not found');
      }

      const oldCategoryId = currentService.categoryId;
      let newCategoryObjectId: Types.ObjectId | undefined;

      // Validate new category if being updated
      if (input.categoryId) {
        this.validateObjectId(input.categoryId, 'category ID');
        newCategoryObjectId = this.toObjectId(input.categoryId);

        const categoryExists = await CategoryModel.findById(newCategoryObjectId);
        if (!categoryExists) {
          throw new Error('Category not found');
        }
      }

      // Prepare update data with proper ObjectId
      const updateData = {
        ...input,
        ...(newCategoryObjectId && { categoryId: newCategoryObjectId })
      };

      const updatedService = await ServiceModel?.findByIdAndUpdate(
        serviceObjectId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).exec();

      // Update service counts if category changed
      if (newCategoryObjectId && !newCategoryObjectId.equals(oldCategoryId)) {
        await Promise.all([
          this.updateCategoryServiceCount(oldCategoryId), // Update old category
          this.updateCategoryServiceCount(newCategoryObjectId) // Update new category
        ]);
      }

      return updatedService ?? null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update service: ${error.message}`);
      }
      throw new Error('Failed to update service');
    }
  }

  /**
   * Delete service by ID - Fixed validation and return type
   */
  static async deleteService(id: string | Types.ObjectId): Promise<boolean> {
    try {
      this.validateObjectId(id, 'service ID');
      const serviceObjectId = this.toObjectId(id);

      // Get service to know which category to update
      const service = await ServiceModel?.findById(serviceObjectId);
      if (!service) {
        return false;
      }

      const categoryId = service.categoryId;
      const result = await ServiceModel?.findByIdAndDelete(serviceObjectId);
      
      if (result) {
        // Update category service count
        await this.updateCategoryServiceCount(categoryId);
      }
      
      return !!result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete service: ${error.message}`);
      }
      throw new Error('Failed to delete service');
    }
  }

  /**
   * Update multiple category service counts - Fixed to handle ObjectId properly
   */
  static async updateMultipleCategoryServiceCounts(
    categoryIds: (string | Types.ObjectId)[]
  ): Promise<void> {
    try {
      const updatePromises = categoryIds
        .filter(id => {
          try {
            this.validateObjectId(id);
            return true;
          } catch {
            return false;
          }
        })
        .map(categoryId => this.updateCategoryServiceCount(categoryId));
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Failed to update multiple category service counts:', error);
    }
  }

  /**
   * Recalculate all service counts - Performance optimized
   */
  static async recalculateAllServiceCounts(): Promise<{ updated: number; errors: number }> {
    try {
      const categories = await CategoryModel.find({}, '_id').lean();
      let updated = 0;
      let errors = 0;

      // Process in batches for better performance
      const batchSize = 10;
      for (let i = 0; i < categories.length; i += batchSize) {
        const batch = categories.slice(i, i + batchSize);
        const batchPromises = batch.map(async (category) => {
          try {
            await this.updateCategoryServiceCount(category._id);
            return { success: true };
          } catch (error) {
            console.error(`Failed to update count for category ${category._id}:`, error);
            return { success: false };
          }
        });

        const results = await Promise.all(batchPromises);
        updated += results.filter(r => r.success).length;
        errors += results.filter(r => !r.success).length;
      }

      return { updated, errors };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to recalculate service counts: ${error.message}`);
      }
      throw new Error('Failed to recalculate service counts');
    }
  }

  /**
   * Get services by category - Fixed to handle ObjectId properly
   */
  static async getServicesByCategory(
    categoryId: string | Types.ObjectId,
    includeInactive: boolean = false
  ): Promise<Service[]> {
    try {
      this.validateObjectId(categoryId, 'category ID');
      const categoryObjectId = this.toObjectId(categoryId);

      const filter: Record<string, unknown> = { categoryId: categoryObjectId };
      
      // Add active filter unless explicitly including inactive services
      if (!includeInactive) {
        filter.isActive = true;
      }

      const services = await ServiceModel?.find(filter)
        .sort({ popular: -1, createdAt: -1 })
        .lean()
        .exec() ?? [];

      // Transform to Service type
      return services.map(service => ({
        _id: service._id,
        title: service.title,
        description: service.description,
        categoryId: service.categoryId,
        serviceImage: service.serviceImage,
        popular: service.popular,
        isActive: service.isActive,
        tags: service.tags,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get services by category: ${error.message}`);
      }
      throw new Error('Failed to get services by category');
    }
  }

  /**
   * Get popular services - Fixed to handle ObjectId and performance optimized
   */
  static async getPopularServices(
    limit: number = 10,
    includeInactive: boolean = false
  ): Promise<Service[]> {
    try {
      const filter: Record<string, unknown> = { popular: true };
      
      // Add active filter unless explicitly including inactive services
      if (!includeInactive) {
        filter.isActive = true;
      }

      const services = await ServiceModel?.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('category', 'categoryName catImage')
        .lean()
        .exec() ?? [];

      // Transform to Service type
      return services.map(service => ({
        _id: service._id,
        title: service.title,
        description: service.description,
        categoryId: service.categoryId,
        serviceImage: service.serviceImage,
        popular: service.popular,
        isActive: service.isActive,
        tags: service.tags,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get popular services: ${error.message}`);
      }
      throw new Error('Failed to get popular services');
    }
  }

  /**
   * Search services - Performance optimized with proper filtering
   */
  static async searchServices(
    query: string,
    filters?: ServiceFilters
  ): Promise<Service[]> {
    try {
      const searchFilter: Record<string, unknown> = {
        $text: { $search: query }
      };

      // Apply additional filters
      if (filters?.categoryId) {
        this.validateObjectId(filters.categoryId, 'category ID');
        searchFilter.categoryId = this.toObjectId(filters.categoryId);
      }

      if (typeof filters?.isActive === 'boolean') {
        searchFilter.isActive = filters.isActive;
      } else {
        // Default to active services only
        searchFilter.isActive = true;
      }

      if (typeof filters?.popular === 'boolean') {
        searchFilter.popular = filters.popular;
      }

      const results = await ServiceModel?.find(searchFilter)
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .populate('category', 'categoryName catImage')
        .lean()
        .exec() ?? [];

      // Transform to Service type
      return results.map(service => ({
        _id: service._id,
        title: service.title,
        description: service.description,
        categoryId: service.categoryId,
        serviceImage: service.serviceImage,
        popular: service.popular,
        isActive: service.isActive,
        tags: service.tags,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search services: ${error.message}`);
      }
      throw new Error('Failed to search services');
    }
  }

  /**
   * Toggle service popularity - Fixed validation
   */
  static async togglePopular(id: string | Types.ObjectId): Promise<IServiceDocument | null> {
    try {
      this.validateObjectId(id, 'service ID');
      const serviceObjectId = this.toObjectId(id);

      const service = await ServiceModel?.findById(serviceObjectId);
      if (!service) {
        throw new Error('Service not found');
      }

      service.popular = !service.popular;
      return await service.save();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to toggle service popularity: ${error.message}`);
      }
      throw new Error('Failed to toggle service popularity');
    }
  }

  /**
   * Toggle service active status - Fixed validation
   */
  static async toggleActive(id: string | Types.ObjectId): Promise<IServiceDocument | null> {
    try {
      this.validateObjectId(id, 'service ID');
      const serviceObjectId = this.toObjectId(id);

      const service = await ServiceModel?.findById(serviceObjectId);
      if (!service) {
        throw new Error('Service not found');
      }

      service.isActive = !service.isActive;
      return await service.save();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to toggle service status: ${error.message}`);
      }
      throw new Error('Failed to toggle service status');
    }
  }

  /**
   * Get service statistics - Performance optimized
   */
  static async getServiceStats(): Promise<ServiceStats> {
    try {
      const [total, active, popular, byCategory] = await Promise.all([
        ServiceModel?.countDocuments().exec(),
        ServiceModel?.countDocuments({ isActive: true }).exec(),
        ServiceModel?.countDocuments({ popular: true }).exec(),
        ServiceModel?.aggregate([
          {
            $lookup: {
              from: 'categories',
              localField: 'categoryId',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $unwind: '$category'
          },
          {
            $group: {
              _id: '$category._id',
              categoryName: { $first: '$category.categoryName' },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { count: -1 }
          },
          {
            $project: {
              _id: 0,
              categoryName: 1,
              count: 1
            }
          }
        ]).exec()
      ]);

      return {
        total: total ?? 0,
        active: active ?? 0,
        popular: popular ?? 0,
        byCategory: (byCategory ?? []) as { categoryName: string; count: number }[]
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get service statistics: ${error.message}`);
      }
      throw new Error('Failed to get service statistics');
    }
  }

  /**
   * Bulk operations for better performance
   */
  static async bulkCreateServices(inputs: CreateServiceInput[]): Promise<{
    created: IServiceDocument[];
    errors: Array<{ index: number; error: string }>;
  }> {
    const created: IServiceDocument[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < inputs.length; i++) {
      try {
        const service = await this.createService(inputs[i]);
        created.push(service);
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { created, errors };
  }

  /**
   * Bulk update services
   */
  static async bulkUpdateServices(updates: Array<{
    id: string | Types.ObjectId;
    input: UpdateServiceInput;
  }>): Promise<{
    updated: IServiceDocument[];
    errors: Array<{ index: number; error: string }>;
  }> {
    const updated: IServiceDocument[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < updates.length; i++) {
      try {
        const service = await this.updateService(updates[i].id, updates[i].input);
        if (service) {
          updated.push(service);
        }
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { updated, errors };
  }
}