// File: app/api/auth/verify-session/route.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// Helper function to get CORS headers
function getCorsHeaders() {
  const allowedOrigin = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'https://errandmate.vercel.app';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  };
}

export async function GET() {
  try {
    // Get the session using your NextAuth configuration
    const session = await auth();
    
    const corsHeaders = getCorsHeaders();
    
    if (!session?.user) {
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

    // Verify session is still active in your session management
    if (session.sessionId) {
      // Optionally, you can add additional checks here if needed
    }
    
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
    console.error('Session verification error:', error);
    
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
  const corsHeaders = getCorsHeaders();
  
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}