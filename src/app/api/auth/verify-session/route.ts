// File: app/api/auth/verify-session/route.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// Helper function to get CORS headers
function getCorsHeaders() {
  const allowedOrigin = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'https://errandmate.vercel.app';
  
  console.log('🔧 CORS Debug Info:');
  console.log('- NEXT_PUBLIC_AUTH_SERVICE_URL:', process.env.NEXT_PUBLIC_AUTH_SERVICE_URL);
  console.log('- Allowed Origin:', allowedOrigin);
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  };
}

export async function GET() {
  console.log('🚀 GET /api/auth/verify-session called');
  
  try {
    // Get the session using your NextAuth configuration
    const session = await auth();
    console.log('📋 Session from auth():', session ? 'Session exists' : 'No session');
    console.log('📋 Session details:', {
      hasUser: !!session?.user,
      userId: session?.user?.id,
      sessionId: session?.sessionId
    });
    
    const corsHeaders = getCorsHeaders();
    console.log('🔧 CORS Headers:', corsHeaders);
    
    if (!session?.user) {
      console.log('❌ No active session found, returning 401');
      return NextResponse.json(
        { 
          authenticated: false,
          message: 'No active session found'
        }, 
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    console.log('✅ Active session found, returning user data');
    
    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        role: session.user.role,
        email: session.user.email,
        name: session.user.name,
        provider: session.user.provider,
        providerId: session.user.providerId
      },
      sessionId: session.sessionId
    }, {
      headers: corsHeaders
    });
    
    return response;
    
  } catch (error: unknown) {
    console.error('💥 Session verification error:', error);
    
    const corsHeaders = getCorsHeaders();
    
    return NextResponse.json(
      { 
        authenticated: false,
        message: 'Session verification failed',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, 
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  console.log('🔧 OPTIONS /api/auth/verify-session called (CORS preflight)');
  
  const corsHeaders = getCorsHeaders();
  console.log('🔧 Preflight CORS Headers:', corsHeaders);
  
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}