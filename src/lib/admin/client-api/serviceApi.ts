// src/lib/api/serviceApi.ts

import { IServiceDocument } from "@/app/models/category-service-models/serviceModel";

export interface CreateServiceInput {
  title: string;
  description: string;
  categoryId: string;
  serviceImage?: {
    url: string;
    serviceName: string;
  };
  popular?: boolean;
  isActive?: boolean;
  tags?: string[];
}

export interface UpdateServiceInput {
  title?: string;
  description?: string;
  categoryId?: string;
  serviceImage?: {
    url: string;
    serviceName: string;
  };
  popular?: boolean;
  isActive?: boolean;
  tags?: string[];
}

export interface ServiceQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'popular' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  popular?: boolean;
  tags?: string[];
  includeCategory?: boolean;
}

export interface ServicesResponse {
  services: IServiceDocument[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ServiceStats {
  total: number;
  active: number;
  popular: number;
  byCategory: Array<{ categoryName: string; count: number }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
   statusCode?: number;
}

class ServiceApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ServiceApiError';
  }
}

export class ServiceApi {
  private static baseUrl = '/api/admin/category_management/category_services';

  private static async handleResponse<T>(response: Response): Promise<T> {
    const data: ApiResponse<T> = await response.json();
    
    if (!response.ok || !data.success) {
      throw new ServiceApiError(
        data.error || `HTTP error! status: ${response.status}`,
        response.status
      );
    }
    
    return data.data as T;
  }

  private static buildQueryString(params: Record<string, string | number | boolean | string[] | undefined | null>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          searchParams.set(key, value.join(','));
        } else {
          searchParams.set(key, String(value));
        }
      }
    });
    
    return searchParams.toString();
  }

  /**
   * Get all services with filtering and pagination
   */
  static async getServices(options: ServiceQueryOptions = {}): Promise<ServicesResponse> {
    try {
      const queryString = this.buildQueryString({ ...options } as Record<string, string | number | boolean | string[] | null | undefined>);
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse<ServicesResponse>(response);
    } catch (error) {
      if (error instanceof ServiceApiError) {
        throw error;
      }
      throw new ServiceApiError(`Failed to fetch services: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get service by ID
   */
  static async getServiceById(id: string, includeCategory: boolean = false): Promise<IServiceDocument | null> {
    try {
      const queryString = includeCategory ? '?includeCategory=true' : '';
      const response = await fetch(`${this.baseUrl}/${id}${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      return await this.handleResponse<IServiceDocument>(response);
    } catch (error) {
      if (error instanceof ServiceApiError) {
        throw error;
      }
      throw new ServiceApiError(`Failed to fetch service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new service
   */
  static async createService(input: CreateServiceInput): Promise<IServiceDocument> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      return await this.handleResponse<IServiceDocument>(response);
    } catch (error) {
      if (error instanceof ServiceApiError) {
        throw error;
      }
      throw new ServiceApiError(`Failed to create service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update service by ID
   */
  static async updateService(id: string, input: UpdateServiceInput): Promise<IServiceDocument> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      return await this.handleResponse<IServiceDocument>(response);
    } catch (error) {
      if (error instanceof ServiceApiError) {
        throw error;
      }
      throw new ServiceApiError(`Failed to update service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete service by ID
   */
  static async deleteService(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await this.handleResponse<{ deleted: boolean }>(response);
      return true;
    } catch (error) {
      if (error instanceof ServiceApiError) {
        throw error;
      }
      throw new ServiceApiError(`Failed to delete service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get services by category
   */
  static async getServicesByCategory(categoryId: string): Promise<IServiceDocument[]> {
    try {
      const response = await fetch(`${this.baseUrl}/category/${categoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse<IServiceDocument[]>(response);
    } catch (error) {
      if (error instanceof ServiceApiError) {
        throw error;
      }
      throw new ServiceApiError(`Failed to fetch services by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get popular services
   */
  static async getPopularServices(limit: number = 10): Promise<IServiceDocument[]> {
    try {
      const response = await fetch(`${this.baseUrl}/popular?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse<IServiceDocument[]>(response);
    } catch (error) {
      if (error instanceof ServiceApiError) {
        throw error;
      }
      throw new ServiceApiError(`Failed to fetch popular services: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search services
   */
  static async searchServices(query: string): Promise<IServiceDocument[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse<IServiceDocument[]>(response);
    } catch (error) {
      if (error instanceof ServiceApiError) {
        throw error;
      }
      throw new ServiceApiError(`Failed to search services: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Toggle service popularity
   */
  static async togglePopular(id: string): Promise<IServiceDocument> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/toggle-popular`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse<IServiceDocument>(response);
    } catch (error) {
      if (error instanceof ServiceApiError) {
        throw error;
      }
      throw new ServiceApiError(`Failed to toggle service popularity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Toggle service active status
   */
  static async toggleActive(id: string): Promise<IServiceDocument> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse<IServiceDocument>(response);
    } catch (error) {
      if (error instanceof ServiceApiError) {
        throw error;
      }
      throw new ServiceApiError(`Failed to toggle service active status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get service statistics
   */
  static async getServiceStats(): Promise<ServiceStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse<ServiceStats>(response);
    } catch (error) {
      if (error instanceof ServiceApiError) {
        throw error;
      }
      throw new ServiceApiError(`Failed to fetch service statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}