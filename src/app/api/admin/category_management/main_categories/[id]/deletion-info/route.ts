// app/api/categories/[id]/deletion-info/route.ts
import { connect } from '@/lib/dbconfigue/dbConfigue';
import { CategoryService } from '@/lib/admin/services/categoryService';
import { NextRequest, NextResponse } from 'next/server';

// Type definition for Next.js 15+ App Router - matches your main file
interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/categories/[id]/deletion-info - Preview deletion impact
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Connect to database first
    await connect();
    
    // Await the params promise - consistent with your main file pattern
    const { id } = await context.params;
    
    // Validate the ID parameter
    if (!id || id.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'Category ID is required'
      }, { status: 400 });
    }
    
    // Get deletion info from service
    const deletionInfo = await CategoryService.getCategoryDeletionInfo(id);
    
    // Return successful response with consistent structure
    return NextResponse.json({
      success: true,
      data: deletionInfo,
      message: 'Deletion info retrieved successfully'
    });
    
  } catch (error) {
    console.error(`GET /api/categories/[id]/deletion-info error:`, error);
    
    // Enhanced error handling with specific error types
    if (error instanceof Error) {
      // Handle specific error cases
      if (error.message.includes('Invalid category ID') || 
          error.message.includes('invalid ObjectId')) {
        return NextResponse.json({
          success: false,
          error: 'Invalid category ID format'
        }, { status: 400 });
      }
      
      if (error.message.includes('Category not found') || 
          error.message.includes('not found')) {
        return NextResponse.json({
          success: false,
          error: 'Category not found'
        }, { status: 404 });
      }
      
      // Database connection errors
      if (error.message.includes('connection') || 
          error.message.includes('database')) {
        return NextResponse.json({
          success: false,
          error: 'Database connection error'
        }, { status: 503 });
      }
      
      // Return specific error message for other known errors
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
    
    // Fallback for unknown error types
    return NextResponse.json({
      success: false,
      error: 'Failed to get deletion info'
    }, { status: 500 });
  }
}