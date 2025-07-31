// app/api/admin/stats/route.ts - Fixed authentication handling
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAdminStats } from '@/lib/admin/management/adminManagement';

export async function GET() {
  try {
    const session = await auth();
    
    // Enhanced logging for debugging
    console.log('Admin stats route - Session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userRole: session?.user?.role,
      userEmail: session?.user?.email,
      sessionId: session?.sessionId
    });
    
    // More detailed authorization check
    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }
    
    if (!session.user) {
      console.log('No user in session');
      return NextResponse.json({ error: 'No user in session' }, { status: 401 });
    }
    
    if (!session.user.role) {
      console.log('No role found for user');
      return NextResponse.json({ error: 'User role not found' }, { status: 401 });
    }
    
    const allowedRoles = ['admin', 'super_admin'];
    if (!allowedRoles.includes(session.user.role)) {
      console.log(`Insufficient permissions. User role: ${session.user.role}, Required: ${allowedRoles.join(', ')}`);
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        userRole: session.user.role,
        requiredRoles: allowedRoles
      }, { status: 403 });
    }

    // If we get here, user is authenticated and authorized
    console.log(`User ${session.user.email} (${session.user.role}) accessing admin stats`);
    
    const stats = await getAdminStats();
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error in admin stats route:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

