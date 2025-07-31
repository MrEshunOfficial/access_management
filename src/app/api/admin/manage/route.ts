// app/api/admin/manage/route.ts - Updated admin management API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { promoteExistingUser } from '@/lib/admin/management/adminManagement';
import { demoteAdminToUser, getAllAdmins, promoteUserToAdmin } from '@/lib/admin/adminService';

// GET - Get all admins
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admins = await getAllAdmins();
    return NextResponse.json({ admins });
    
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Promote user to admin (updated to use new function signatures)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, targetEmail, newRole = 'admin' } = await request.json();
    
    // Support both userId (from user list) and targetEmail (direct email input)
    if (!userId && !targetEmail) {
      return NextResponse.json({ error: 'Either userId or targetEmail is required' }, { status: 400 });
    }

    // Check role permissions
    if (newRole === 'super_admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Only super admins can promote to super admin' }, { status: 403 });
    }

    let result;
    
    if (userId) {
      // Promote from user list in admin panel
      result = await promoteExistingUser(session.user.email!, userId, newRole);
    } else {
      // Promote by email (direct)
      result = await promoteUserToAdmin(session.user.email!, targetEmail, newRole);
    }
    
    if (result.success) {
      return NextResponse.json({ message: `User promoted to ${newRole} successfully` });
    } else {
      return NextResponse.json({ error: result.error || 'Promotion failed' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error promoting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Demote admin to user (updated to use new function signatures)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetEmail } = await request.json();
    
    if (!targetEmail) {
      return NextResponse.json({ error: 'Target email is required' }, { status: 400 });
    }

    const result = await demoteAdminToUser(session.user.email!, targetEmail);
    
    if (result.success) {
      return NextResponse.json({ message: 'Admin demoted to user successfully' });
    } else {
      return NextResponse.json({ error: result.error || 'Demotion failed' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error demoting admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

