// File: app/api/auth/verify-session/route.ts
// Updated to support both cookie-based and token-based authentication with proper TypeScript types

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  provider?: string;
  providerId?: string;
}
interface JWTPayload extends UserPayload {
  sessionId: string;
  iat: number;
  exp: number;
}

interface CustomSession {
  user: UserPayload & {
    image?: string;
  };
  sessionId: string;
  expires: string;
}

// Helper function to generate JWT token
function generateAuthToken(user: UserPayload, sessionId: string): string {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    provider: user.provider,
    providerId: user.providerId,
    sessionId: sessionId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  return jwt.sign(payload, process.env.AUTH_SECRET as string);
}

// Helper function to verify JWT token
function verifyAuthToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET as string);
    return decoded as JWTPayload;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const allowedOrigin = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'https://errandmate.vercel.app';
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // First, try to get session from NextAuth (cookie-based)
    let session = await auth();
    let authMethod: 'cookie' | 'token' | 'none' = 'cookie';
    
    // If no session from cookies, try JWT token from Authorization header
    if (!session?.user) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = verifyAuthToken(token);
        
        if (decoded) {
          // Create a properly typed session object with expires property
          const expirationTime = new Date(decoded.exp * 1000).toISOString();
          
          session = {
            user: {
              id: decoded.id,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role,
              provider: decoded.provider,
              providerId: decoded.providerId
            },
            sessionId: decoded.sessionId,
            expires: expirationTime
          } as CustomSession;
          authMethod = 'token';
        }
      }
    }
    
    if (!session?.user) {
      return NextResponse.json(
        { 
          authenticated: false,
          message: 'No active session found',
          authMethod: 'none'
        }, 
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    // Ensure we have a sessionId, generate one if missing
    const sessionId = (session as CustomSession).sessionId || 'fallback-session-id';
    
    // Ensure we have expires, generate one if missing
    const expires = session.expires || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const userPayload: UserPayload = {
      id: session.user.id || '',
      email: session.user.email || '',
      name: session.user.name || '',
      role: session.user.role || 'user',
      provider: session.user.provider || undefined,
      providerId: session.user.providerId || undefined
    };

    const responseData = {
      authenticated: true,
      user: {
        ...userPayload,
        image: session.user.image
      },
      sessionId: sessionId,
      authMethod: authMethod,
      expires: expires,
      // Include token for cross-origin clients
      token: generateAuthToken(userPayload, sessionId)
    };

    const response = NextResponse.json(responseData);
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
        headers: corsHeaders
      }
    );
  }
}

export async function OPTIONS() {
  const allowedOrigin = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'https://errandmate.vercel.app';
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}