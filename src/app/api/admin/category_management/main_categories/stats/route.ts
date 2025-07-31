// src/app/api/categories/stats/route.ts
import { connect } from '@/lib/dbconfigue/dbConfigue';
import { CategoryService } from '@/lib/admin/services/categoryService';
import { NextResponse } from 'next/server';


// GET /api/categories/stats - Get category statistics
export async function GET() {
  try {
    await connect();
    
    const stats = await CategoryService.getCategoriesWithCounts();
    
    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Category statistics retrieved successfully'
    });
  } catch (error) {
    console.error('GET /api/categories/stats error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get statistics'
    }, { status: 500 });
  }
}