// src/app/api/services/stats/route.ts
import { connect } from '@/lib/dbconfigue/dbConfigue';
import { ServiceService } from '@/lib/admin/services/serviceServices';
import { NextResponse } from 'next/server';


// GET /api/services/stats - Get service statistics
export async function GET() {
  try {
    await connect();
    
    const stats = await ServiceService.getServiceStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Service statistics retrieved successfully'
    });
  } catch (error) {
    console.error('GET /api/services/stats error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get statistics'
    }, { status: 500 });
  }
}