// src/app/api/services/popular/route.ts
import { connect } from '@/lib/dbconfigue/dbConfigue';
import { ServiceService } from '@/lib/admin/services/serviceServices';
import { NextRequest, NextResponse } from 'next/server';


// GET /api/services/popular - Get popular services
export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const services = await ServiceService.getPopularServices(limit);
    
    return NextResponse.json({
      success: true,
      data: services,
      message: 'Popular services retrieved successfully'
    });
  } catch (error) {
    console.error('GET /api/services/popular error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get popular services'
    }, { status: 500 });
  }
}