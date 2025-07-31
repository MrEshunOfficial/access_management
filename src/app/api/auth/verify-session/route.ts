// File: app/api/auth/verify-session/route.ts
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// JWT secret - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

interface JWTPayload {
  sessionId: string;
  userId: string;
  exp?: number;
}

interface UserSession {
  user: {
    id: string;
    role: string;
    email: string | null;
    name: string | null;
    provider?: string;
    providerId?: string;
  };
  sessionId?: string;
}

export async function GET(request: NextRequest) {
  try {
    let session: UserSession | null = null;
    const origin = request.headers.get('origin');
    const isFromDifferentDomain = origin && !origin.includes('access-management-xi.vercel.app');

    // First, try to get session from Authorization header (token-based)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        // You would typically fetch user data from your database using the sessionId or userId
        // For now, we'll try to get the session using your existing auth system
        const cookieSession = await auth();
        
        if (cookieSession?.user && cookieSession.user.id === decoded.userId) {
          session = cookieSession as UserSession;
        }
      } catch (jwtError) {
        console.error('Invalid JWT token:', jwtError);
        // Token is invalid, fall back to cookie-based auth
      }
    }

    // Try cookie-based session (this will only work for same-domain requests)
    if (!session) {
      const cookieSession = await auth();
      if (cookieSession?.user) {
        session = cookieSession as UserSession;
      }
    }

    if (!session?.user) {
      // If request is from a different domain and no valid token, suggest login redirect
      const message = isFromDifferentDomain 
        ? 'Cross-domain authentication required. Please redirect to login.'
        : 'No active session found';
        
      return NextResponse.json(
        {
          authenticated: false,
          message,
          loginUrl: `${request.nextUrl.origin}/auth/user/login`,
          requiresRedirect: isFromDifferentDomain
        },
        {
          status: 401,
          headers: getCorsHeaders(origin)
        }
      );
    }

    // Ensure we have a valid user ID before creating token
    if (!session.user.id) {
      return NextResponse.json(
        {
          authenticated: false,
          message: 'Invalid user session'
        },
        {
          status: 401,
          headers: getCorsHeaders()
        }
      );
    }

    // Generate a new token for cross-domain authentication
    const tokenPayload: JWTPayload = {
      sessionId: session.sessionId || session.user.id,
      userId: session.user.id,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET);

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
      sessionId: session.sessionId,
      token: token // Include token in response
    });

    // Set CORS headers
    const corsHeaders = getCorsHeaders(origin);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

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
        headers: getCorsHeaders()
      }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

function getCorsHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'https://errandmate.vercel.app',
    'http://localhost:3001', // For development
    'http://localhost:3000', // For development
  ];

  // Use the requesting origin if it's in our allowed list, otherwise use the first one
  const allowedOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}