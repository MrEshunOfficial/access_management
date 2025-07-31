// src/app/api/categories/search/route.ts
import { connect } from '@/lib/dbconfigue/dbConfigue';
import { CategoryService } from '@/lib/admin/services/categoryService';
import { NextRequest, NextResponse } from 'next/server';


// GET /api/categories/search - Search categories
export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Search query parameter "q" is required'
      }, { status: 400 });
    }
    
    const categories = await CategoryService.searchCategories(query);
    
    return NextResponse.json({
      success: true,
      data: categories,
      message: 'Search completed successfully'
    });
  } catch (error) {
    console.error('GET /api/categories/search error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed'
    }, { status: 500 });
  }
}