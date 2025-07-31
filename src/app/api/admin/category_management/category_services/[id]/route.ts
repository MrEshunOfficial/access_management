// src/app/api/services/[id]/route.ts
import { connect } from '@/lib/dbconfigue/dbConfigue';
import { ServiceService } from '@/lib/admin/services/serviceServices';
import { NextRequest, NextResponse } from 'next/server';

// Type definition for Next.js 15+ App Router
interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/services/[id] - Get service by ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connect();
    
    // Await the params promise
    const { id } = await context.params;
    
    const searchParams = request.nextUrl.searchParams;
    const includeCategory = searchParams.get('includeCategory') === 'true';
    
    const service = await ServiceService.getServiceById(id, includeCategory);
    
    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Service not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: service,
      message: 'Service retrieved successfully'
    });
  } catch (error) {
    console.error(`GET /api/services/[id] error:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get service'
    }, { status: 500 });
  }
}

// PUT /api/services/[id] - Update service by ID
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await connect();
    
    // Await the params promise
    const { id } = await context.params;
    
    const body = await request.json();
    
    const service = await ServiceService.updateService(id, body);
    
    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Service not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: service,
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error(`PUT /api/services/[id] error:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update service'
    }, { status: 500 });
  }
}

// DELETE /api/services/[id] - Delete service by ID
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await connect();
    
    // Await the params promise
    const { id } = await context.params;
    
    const deleted = await ServiceService.deleteService(id);
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Service not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error(`DELETE /api/services/[id] error:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete service'
    }, { status: 500 });
  }
}