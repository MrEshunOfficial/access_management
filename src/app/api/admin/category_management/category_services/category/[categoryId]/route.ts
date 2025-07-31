// src/app/api/services/category/[categoryId]/route.ts
import { connect } from '@/lib/dbconfigue/dbConfigue';
import { ServiceService } from '@/lib/admin/services/serviceServices';
import { NextRequest, NextResponse } from 'next/server';

// Type definition for Next.js 15+ App Router
interface RouteContext {
  params: Promise<{ categoryId: string }>;
}

// GET /api/services/category/[categoryId] - Get services by category
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connect();
    
    // Await the params promise
    const { categoryId } = await context.params;
    
    const services = await ServiceService.getServicesByCategory(categoryId);
    
    return NextResponse.json({
      success: true,
      data: services,
      message: 'Services retrieved successfully'
    });
  } catch (error) {
    console.error(`GET /api/services/category/[categoryId] error:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get services by category'
    }, { status: 500 });
  }
}