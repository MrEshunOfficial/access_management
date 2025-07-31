// src/app/api/categories/route.ts
import { CategoryService } from '@/lib/admin/services/categoryService';
import { connect } from '@/lib/dbconfigue/dbConfigue';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/categories - Get all categories with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const searchParams = request.nextUrl.searchParams;
    
    const options = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: (searchParams.get('sortBy') as 'name' | 'serviceCount' | 'createdAt') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      includeServices: searchParams.get('includeServices') === 'true'
    };

    const result = await CategoryService.getCategories(options);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get categories'
    }, { status: 500 });
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.categoryName || typeof body.categoryName !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'categoryName is required and must be a string'
      }, { status: 400 });
    }

    const category = await CategoryService.createCategory(body);
    
    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create category'
    }, { status: 500 });
  }
}


