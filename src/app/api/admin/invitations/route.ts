// app/api/admin/invitations/route.ts - Admin invitation management
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sendAdminInvitationByEmail, getAllPendingInvitations } from '@/lib/admin/management/adminManagement';
import { revokeAdminInvitation } from '@/lib/admin/adminService';

// GET - Get all pending invitations
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const invitations = await getAllPendingInvitations();
    return NextResponse.json({ invitations });
    
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new admin invitation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role = 'admin' } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check role permissions
    if (role === 'super_admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Only super admins can create super admin invitations' }, { status: 403 });
    }

    const result = await sendAdminInvitationByEmail(
      session.user.email!,
      email,
      role,
    );
    
    if (result.success) {
      return NextResponse.json({ 
        message: 'Admin invitation sent successfully',
        invitationId: result.invitationId
      });
    } else {
      return NextResponse.json({ error: result.error || 'Failed to send invitation' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Revoke admin invitation
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invitationId } = await request.json();
    
    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }

    const result = await revokeAdminInvitation(session.user.email!, invitationId);
    
    if (result.success) {
      return NextResponse.json({ message: 'Invitation revoked successfully' });
    } else {
      return NextResponse.json({ error: result.error || 'Failed to revoke invitation' }, { status: 400 });
    }
    
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

