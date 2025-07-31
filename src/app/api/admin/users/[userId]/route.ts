// app/api/admin/users/[userId]/route.ts - Updated with restore functionality
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  suspendUser, 
  blockUser, 
  deleteUser, 
  reactivateUser,
  restoreUser, // NEW: Import restore function
  getUserById 
} from '@/lib/admin/management/userManagementService';

interface RouteParams {
  params: Promise<{
    userId: string;
  }>;
}

// Helper function to get client IP address
function getClientIP(request: NextRequest): string {
  // Try various headers for the real IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to connection remote address (may not always be available)
  return request.headers.get('x-forwarded-host') || 'unknown';
}

// Helper function to safely parse JSON from request
async function safeJsonParse(request: NextRequest): Promise<{ data: Record<string, unknown>; error?: string }> {
  try {
    const text = await request.text();
    if (!text) {
      return { data: {} };
    }
    const data = JSON.parse(text) as Record<string, unknown>;
    return { data };
  } catch {
    return { data: {}, error: 'Invalid JSON in request body' };
  }
}

// GET - Get specific user details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update user status (suspend, block, reactivate, restore)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    
    // Safely parse JSON with error handling
    const { data: body, error: parseError } = await safeJsonParse(request);
    if (parseError) {
      return NextResponse.json({ error: parseError }, { status: 400 });
    }

    const action = body.action as string;
    const reason = body.reason as string;
    const duration = body.duration as number | undefined;
    const ipAddress = getClientIP(request);

    let result: { success: boolean; error?: string };

    switch (action) {
      case 'suspend':
        result = await suspendUser({
          userId,
          reason,
          duration,
          suspendedBy: session.user.email!,
          ipAddress
        });
        break;

      case 'block':
        result = await blockUser(
          session.user.email!,
          userId,
          reason,
          ipAddress
        );
        break;

      case 'reactivate':
        result = await reactivateUser(
          session.user.email!,
          userId,
          ipAddress
        );
        break;

      case 'restore':
        // NEW: Handle restore action
        // Only super admins can restore deleted users
        if (session.user.role !== 'super_admin') {
          return NextResponse.json({ 
            error: 'Only super admins can restore deleted users' 
          }, { status: 403 });
        }
        
        result = await restoreUser(
          session.user.email!,
          userId,
          reason || 'User restoration requested',
          ipAddress
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json({ 
        message: `User ${action}ed successfully`,
        action 
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error performing user action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Soft delete user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Only super admins can delete users' }, { status: 403 });
    }

    const { userId } = await params;
    
    // Safely parse JSON with error handling
    const { data: body, error: parseError } = await safeJsonParse(request);
    if (parseError) {
      return NextResponse.json({ error: parseError }, { status: 400 });
    }

    const reason = body.reason as string;
    const ipAddress = getClientIP(request);

    if (!reason) {
      return NextResponse.json({ error: 'Deletion reason is required' }, { status: 400 });
    }

    const result = await deleteUser(
      session.user.email!,
      userId,
      reason,
      ipAddress
    );

    if (result.success) {
      return NextResponse.json({ message: 'User deleted successfully' });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}