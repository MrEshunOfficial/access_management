import NextAuth from "next-auth";
import type { NextAuthConfig, Session, DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connect } from "./lib/dbconfigue/dbConfigue";
import { User } from "./app/models/auth/authModel";
import { privatePaths, publicPaths } from "./auth.config";
import crypto from "crypto";
import { Types } from 'mongoose';
import { checkAndGetUserRole } from "./lib/admin/adminService";

// CREATE A SESSION MODEL FOR PERSISTENT SESSION STORAGE
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastAccessed: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24 hours
});

// Add index for automatic cleanup
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ userId: 1 });
sessionSchema.index({ sessionId: 1 });

const SessionModel = mongoose.models.Session || mongoose.model('Session', sessionSchema);

interface LeanUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  role: string;
  provider?: string;
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
  promotedBy?: string;
  promotedAt?: Date;
  demotedBy?: string;
  demotedAt?: Date;
}

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role: string;
      email?: string | null;
      name?: string | null;
      provider?: string | null;
      providerId?: string | null;
    } & DefaultSession["user"];
    sessionId?: string;
  }

  interface User {
    id?: string;
    role: string;
    email?: string | null;
    name?: string | null;
    provider?: string | null;
    providerId?: string | null;
  }
}

interface CustomToken extends JWT {
  id?: string;
  role?: string;
  provider?: string;
  sessionId?: string;
}

function getRoleBasedRedirectUrl(role: string, baseUrl: string, callbackUrl?: string): string {
  if (callbackUrl && 
      !callbackUrl.includes('/user/login') && 
      !callbackUrl.includes('/user/register') &&
      callbackUrl !== '/') {
    
    if ((role === 'admin' || role === 'super_admin')) {
      if (callbackUrl.startsWith('/admin/')) {
        return callbackUrl.startsWith('/') ? `${baseUrl}${callbackUrl}` : callbackUrl;
      }
    } else {
      return callbackUrl.startsWith('/') ? `${baseUrl}${callbackUrl}` : callbackUrl;
    }
  }

  switch (role) {
    case 'admin':
    case 'super_admin':
      return `${baseUrl}/admin-console`;
    case 'user':
      return process.env.USER_SERVICE_URL
        ? `${process.env.USER_SERVICE_URL}/profile`
        : `${baseUrl}/profile`;
    default:
      return `${baseUrl}/user/login`;
  }
}

async function generateSessionId(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// REPLACE IN-MEMORY SESSION MANAGEMENT WITH DATABASE STORAGE
export async function invalidateUserSessions(userId: string) {
  try {
    await connect();
    await SessionModel.deleteMany({ userId });
    console.log(`Invalidated all sessions for user: ${userId}`);
  } catch (error) {
    console.error('Error invalidating user sessions:', error);
  }
}

async function createSession(userId: string, sessionId: string) {
  try {
    await connect();
    
    // Create new session
    await SessionModel.create({
      sessionId,
      userId,
      createdAt: new Date(),
      lastAccessed: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    
    console.log(`Created session ${sessionId} for user ${userId}`);
  } catch (error) {
    console.error('Error creating session:', error);
  }
}

async function updateSessionAccess(sessionId: string) {
  try {
    await connect();
    
    await SessionModel.findOneAndUpdate(
      { sessionId },
      { 
        lastAccessed: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Extend expiry
      }
    );
  } catch (error) {
    console.error('Error updating session access:', error);
  }
}

async function isValidSession(sessionId: string): Promise<boolean> {
  try {
    await connect();
    
    const session = await SessionModel.findOne({
      sessionId,
      expiresAt: { $gt: new Date() }
    });
    
    if (session) {
      // Update last accessed time
      await updateSessionAccess(sessionId);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

export const authOptions: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  
  // PRODUCTION COOKIE CONFIGURATION
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' 
          ? process.env.COOKIE_DOMAIN // Set this in your env vars
          : undefined
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' 
          ? process.env.COOKIE_DOMAIN
          : undefined
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },

  pages: {
    signIn: "/user/login",
    signOut: "/user/login",
    error: "/user/error",
  },
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials");
          }

          await connect();

          const user = await User.findOne({ email: credentials.email }).select("+password");

          if (!user) {
            throw new Error("User not found");
          }

          if (user.provider && user.providerId && user.provider !== "credentials") {
            throw new Error(
              `This account uses ${user.provider} authentication. Please sign in with ${user.provider}.`
            );
          }

          const isPasswordValid = await user.comparePassword(credentials.password);

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            provider: user.provider,
            providerId: user.providerId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Create session on first login
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.provider = account?.provider;

        const sessionId = await generateSessionId();
        token.sessionId = sessionId;

        // Store session in database instead of memory
        await createSession(user.id as string, sessionId);
      }

      // Validate existing session
      if (token.sessionId) {
        const isValid = await isValidSession(token.sessionId as string);
        if (!isValid) {
          // Session expired or invalid, clear token
          console.log('Session expired, clearing token');
          return {}; // This will force re-authentication
        }
      }

      return token;
    },

    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      
      // Validate session in database
      if (isLoggedIn && auth.sessionId) {
        const isValid = await isValidSession(auth.sessionId);
        if (!isValid) {
          // Session expired, redirect to login
          const callbackUrl = encodeURIComponent(path);
          return Response.redirect(new URL(`/user/login?callbackUrl=${callbackUrl}`, nextUrl));
        }
      }

      if (publicPaths.some((p) => path.startsWith(p))) {
        if (isLoggedIn && (path.startsWith("/user/login") || path.startsWith("/user/register"))) {
          const redirectUrl = getRoleBasedRedirectUrl(auth.user.role, nextUrl.origin);
          return Response.redirect(new URL(redirectUrl));
        }
        return true;
      }
      
      if (privatePaths.some((p) => path.startsWith(p))) {
        if (!isLoggedIn) {
          const callbackUrl = encodeURIComponent(path);
          return Response.redirect(new URL(`/user/login?callbackUrl=${callbackUrl}`, nextUrl));
        }
        return isLoggedIn;
      }
      
      if (path === "/") {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/user/login", nextUrl));
        }
        const redirectUrl = getRoleBasedRedirectUrl(auth.user.role, nextUrl.origin);
        return Response.redirect(new URL(redirectUrl));
      }
      
      return true;
    },

    async signIn({ user, account }) {
      if (!user?.email) return false;

      try {
        await connect();
        
        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          if (account) {
            const userName = user.name || user.email?.split('@')[0] || 'User';
            const userRole = await checkAndGetUserRole(user.email);
            
            dbUser = await User.create({
              email: user.email,
              name: userName,
              provider: account.provider,
              providerId: account.providerAccountId,
              role: userRole,
            });
          } else {
            return false;
          }
        } else {
          if (account) {
            if (dbUser.provider && dbUser.provider !== account.provider && dbUser.provider !== "credentials") {
              throw new Error(
                `This email is already registered with ${dbUser.provider}. Please sign in with ${dbUser.provider}.`
              );
            }
            
            if (!dbUser.provider || !dbUser.providerId) {
              dbUser.providerId = account.providerAccountId;
              dbUser.provider = account.provider;
              await dbUser.save();
            }
          }
        }

        user.id = dbUser._id.toString();
        user.role = dbUser.role;
        user.provider = dbUser.provider;
        user.providerId = dbUser.providerId;
        user.name = dbUser.name;
        
        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    async session({ session, token }: { session: Session; token: CustomToken }): Promise<Session> {
      if (!token || !session.user) {
        return session;
      }

      // Validate session exists in database
      if (token.sessionId) {
        const isValid = await isValidSession(token.sessionId as string);
        if (!isValid) {
          console.log('Invalid session detected in session callback');
          // Return empty session to force re-authentication
          return {
  user: {
    id: token.id as string,
    role: token.role as string || 'user',
    email: token.email as string,
    name: token.name as string,
    provider: token.provider as string,
    providerId: token.providerId as string,
  },
  expires: new Date(0).toISOString(),
};
        }
      }

      try {
        await connect();
        
        if (token.id) {
          const user = await User.findById(token.id).lean() as LeanUser | null;
          if (user) {
            session.user.id = user._id.toString();
            session.user.role = user.role;
            session.user.email = user.email;
            session.user.name = user.name;
            session.user.provider = user.provider;
            session.user.providerId = user.providerId;
            session.sessionId = token.sessionId;
            return session;
          }
        }
        
        session.user.id = token.id as string;
        session.user.role = token.role as string || 'user';
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.provider = token.provider as string;
        session.sessionId = token.sessionId;

        return session;

      } catch (error) {
        console.error('Session callback error:', error);
        session.user.id = token.id as string;
        session.user.role = token.role as string || 'user';
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.provider = token.provider as string;
        session.sessionId = token.sessionId;
        
        return session;
      }
    },

    async redirect({ url, baseUrl }) {
      if (url.includes("signOut") || url.includes("logout")) {
        return `${baseUrl}/user/login`;
      }
      
      if (url.startsWith("/api/auth/callback/google") || url.startsWith("/api/auth/callback")) {
        return `${baseUrl}/auth/redirect`;
      }
      
      try {
        let callbackUrl: string | null = null;
        
        if (url.includes('://') || url.startsWith('http')) {
          const parsedUrl = new URL(url);
          callbackUrl = parsedUrl.searchParams.get("callbackUrl");
        } else if (url.includes('callbackUrl=')) {
          const urlParams = new URLSearchParams(url.split('?')[1]);
          callbackUrl = urlParams.get("callbackUrl");
        }

        if (callbackUrl) {
          if (callbackUrl.startsWith("/")) {
            return `${baseUrl}${callbackUrl}`;
          } else if (callbackUrl.startsWith(baseUrl)) {
            return callbackUrl;
          }
        }
      } catch (error) {
        console.error("Error parsing URL:", error);
      }
      
      if (url.startsWith("/")) {
        if (url === "/") {
          return `${baseUrl}/auth/redirect`;
        }
        return `${baseUrl}${url}`;
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }

      return `${baseUrl}/auth/redirect`;
    },
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);

export { getRoleBasedRedirectUrl };