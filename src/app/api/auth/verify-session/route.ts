// File: app/api/auth/verify-session/route.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the session using your NextAuth configuration
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { 
          authenticated: false,
          message: 'No active session found'
        }, 
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'https://errandmate.vercel.app',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // Verify session is still active in your session management
    if (session.sessionId) {
      // Here you can add additional logic to verify the session ID if needed
      // For example, check if the session ID exists in your database or cache
      // This is a placeholder for your session verification logic
      // const isValidSession = await verifySessionId(session.sessionId);
      // if (!isValidSession) {
      //   return NextResponse.json(
      //     { authenticated: false, message: 'Invalid session' },
      //     { status: 401 }
      //   );
      // }
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
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'https://errandmate.vercel.app');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
    
  } catch (error) {
    console.error('Session verification error:', error);
    
    return NextResponse.json(
      { 
        authenticated: false,
        message: 'Session verification failed'
      }, 
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'https://errandmate.vercel.app',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'https://errandmate.vercel.app',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}