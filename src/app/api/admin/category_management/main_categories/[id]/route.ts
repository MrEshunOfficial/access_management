// src/app/api/categories/[id]/route.ts
import { connect } from '@/lib/dbconfigue/dbConfigue';
import { CategoryService, CategoryDeleteOptions } from '@/lib/admin/services/categoryService';
import { NextRequest, NextResponse } from 'next/server';

// Type definition for Next.js 15+ App Router
interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/categories/[id] - Get category by ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connect();
    
    // Await the params promise
    const { id } = await context.params;
    
    const searchParams = request.nextUrl.searchParams;
    const includeServices = searchParams.get('includeServices') === 'true';
    
    const category = await CategoryService.getCategoryById(id, includeServices);
    
    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category retrieved successfully'
    });
  } catch (error) {
    console.error(`GET /api/categories/[id] error:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get category'
    }, { status: 500 });
  }
}

// PUT /api/categories/[id] - Update category by ID
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await connect();
    
    // Await the params promise
    const { id } = await context.params;
    
    const body = await request.json();
    
    const category = await CategoryService.updateCategory(id, body);
    
    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error(`PUT /api/categories/[id] error:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category'
    }, { status: 500 });
  }
}

// DELETE /api/categories/[id] - Delete category by ID with advanced options
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await connect();
    
    // Await the params promise
    const { id } = await context.params;
    
    // Parse query parameters for delete options
    const searchParams = request.nextUrl.searchParams;
    const deleteOptions: CategoryDeleteOptions = {
      force: searchParams.get('force') === 'true',
      cascade: searchParams.get('cascade') === 'true',
      migrateTo: searchParams.get('migrateTo') || undefined,
      createDefault: searchParams.get('createDefault') === 'true'
    };
    
    // Parse request body for delete options (alternative to query params)
    let bodyOptions: CategoryDeleteOptions = {};
    try {
      const body = await request.json();
      bodyOptions = body;
    } catch {
      // No body or invalid JSON, use query params only
    }
    
    // Merge options (body takes precedence over query params)
    const finalOptions: CategoryDeleteOptions = {
      ...deleteOptions,
      ...bodyOptions
    };
    
    const result = await CategoryService.deleteCategory(id, finalOptions);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete category'
      }, { status: 400 });
    }
    
    // Define a type for the response object
    interface DeleteCategoryResponse {
      success: boolean;
      message: string;
      deletedServicesCount?: number;
      migratedServicesCount?: number;
    }

    // Return detailed response based on what happened
    const response: DeleteCategoryResponse = {
      success: true,
      message: result.message || 'Category deleted successfully'
    };
    
    // Add additional info if services were affected
    if (result.deletedServicesCount !== undefined) {
      response.deletedServicesCount = result.deletedServicesCount;
    }
    
    if (result.migratedServicesCount !== undefined) {
      response.migratedServicesCount = result.migratedServicesCount;
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error(`DELETE /api/categories/[id] error:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete category'
    }, { status: 500 });
  }
}