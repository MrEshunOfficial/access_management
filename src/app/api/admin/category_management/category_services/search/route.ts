// src/app/api/services/search/route.ts
import { connect } from '@/lib/dbconfigue/dbConfigue';
import { ServiceService } from '@/lib/admin/services/serviceServices';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/services/search - Search services
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
    
    const services = await ServiceService.searchServices(query);
    
    return NextResponse.json({
      success: true,
      data: services,
      message: 'Search completed successfully'
    });
  } catch (error) {
    console.error('GET /api/services/search error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed'
    }, { status: 500 });
  }
}