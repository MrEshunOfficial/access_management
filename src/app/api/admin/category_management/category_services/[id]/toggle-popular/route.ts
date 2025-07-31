// src/app/api/services/[id]/toggle-popular/route.ts
import { connect } from '@/lib/dbconfigue/dbConfigue';
import { ServiceService } from '@/lib/admin/services/serviceServices';
import { NextRequest, NextResponse } from 'next/server';

// Type definition for Next.js 15+ App Router
interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/services/[id]/toggle-popular - Toggle service popularity
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await connect();
    
    // Await the params promise
    const { id } = await context.params;
    
    const service = await ServiceService.togglePopular(id);
    
    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Service not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: service,
      message: `Service ${service.popular ? 'marked as popular' : 'unmarked as popular'}`
    });
  } catch (error) {
    console.error(`PATCH /api/services/[id]/toggle-popular error:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle popularity'
    }, { status: 500 });
  }
}