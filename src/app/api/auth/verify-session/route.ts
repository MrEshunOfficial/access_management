// File: app/api/auth/verify-session/route.ts
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

// Define allowed origins - add your profile service domain here
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.NEXT_PUBLIC_USER_SERVICE_URL,
  // Add your profile service domain explicitly
  'https://errandmate.vercel.app', // Replace with actual domain
].filter(Boolean); // Remove any undefined values

function setCorsHeaders(response: NextResponse, origin: string | null) {
  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // For same-origin requests or when origin is not present
    response.headers.set('Access-Control-Allow-Origin', allowedOrigins[0] || '*');
  }
  
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With, Accept, Cache-Control');
  
  return response;
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  try {
    // Get the session using your NextAuth configuration
    const session = await auth();
    
    if (!session?.user) {
      const response = NextResponse.json(
        {
          authenticated: false,
          message: 'No active session found'
        },
        { status: 401 }
      );
      
      return setCorsHeaders(response, origin);
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
    });

    return setCorsHeaders(response, origin);
    
  } catch (error) {
    console.error('Session verification error:', error);
    
    const response = NextResponse.json(
      {
        authenticated: false,
        message: 'Session verification failed'
      },
      { status: 500 }
    );
    
    return setCorsHeaders(response, origin);
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response, origin);
}