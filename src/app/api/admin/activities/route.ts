// app/api/admin/activities/route.ts - Admin activity audit log
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getRecentAdminActivities } from '@/lib/admin/management/adminManagement';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const activities = await getRecentAdminActivities(limit);
    return NextResponse.json({ activities });
    
  } catch (error) {
    console.error('Error fetching admin activities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}