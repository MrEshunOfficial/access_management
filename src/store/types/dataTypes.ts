// src/types/base.ts
import { Types } from "mongoose";

export interface BaseEntity {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// src/types/category.ts
export interface Category extends BaseEntity {
  categoryName: string;
  description?: string;
  catImage?: {
    url: string;
    catName: string;
  };
  tags?: string[];
  serviceIds: Types.ObjectId[]; // Changed from string[] to Types.ObjectId[]
  serviceCount?: number;
}

export interface Service extends BaseEntity {
  title: string;
  description: string;
  categoryId: Types.ObjectId; // Changed from string to Types.ObjectId
  serviceImage?: {
    url: string;
    serviceName: string;
  };
  popular: boolean;
  isActive: boolean;
  tags?: string[];
}

// src/types/composed.ts - For when you need populated data
export interface CategoryWithServices extends Omit<Category, "serviceIds"> {
  services: Service[];
}

export interface ServiceWithCategory extends Service {
  category: Pick<Category, "_id" | "categoryName" | "description" | "catImage">;
}

// src/types/operations.ts - For CRUD operations
export interface CreateServiceInput {
  title: string;
  description: string;
  categoryId: Types.ObjectId; // Changed from string to Types.ObjectId
  serviceImage?: {
    url: string;
    serviceName: string;
  };
  popular?: boolean;
  isActive?: boolean;
  tags?: string[];
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
  _id: Types.ObjectId;
}

export interface CreateCategoryInput {
  categoryName: string;
  description?: string;
  catImage?: {
    url: string;
    catName: string;
  };
  tags?: string[];
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  _id: Types.ObjectId;
}

// For API responses
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ServiceFilters {
  categoryId?: Types.ObjectId; // Changed from string to Types.ObjectId
  isActive?: boolean;
  popular?: boolean;
  search?: string;
}