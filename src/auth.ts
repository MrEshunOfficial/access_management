import NextAuth from "next-auth";
import type { NextAuthConfig, Session, DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connect } from "./lib/dbconfigue/dbConfigue";
import { User } from "./app/models/auth/authModel";
import { privatePaths, publicPaths } from "./auth.config";
import { Types } from "mongoose";
import { checkAndGetUserRole } from "./lib/admin/adminService";

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
}

function getRoleBasedRedirectUrl(
  role: string,
  baseUrl: string,
  callbackUrl?: string
): string {
  if (
    callbackUrl &&
    !callbackUrl.includes("/auth/users/login") &&
    !callbackUrl.includes("/auth/users/register") &&
    callbackUrl !== "/"
  ) {
    if (role === "admin" || role === "super_admin") {
      if (callbackUrl.startsWith("/admin/")) {
        return callbackUrl.startsWith("/")
          ? `${baseUrl}${callbackUrl}`
          : callbackUrl;
      }
    } else {
      return callbackUrl.startsWith("/")
        ? `${baseUrl}${callbackUrl}`
        : callbackUrl;
    }
  }

  switch (role) {
    case "admin":
    case "super_admin":
      return `${baseUrl}/admin-console`;
    case "user":
      return process.env.USER_SERVICE_URL
        ? `${process.env.USER_SERVICE_URL}/profile`
        : `${baseUrl}/profile`;
    default:
      return `${baseUrl}/auth/users/login`;
  }
}

export const authOptions: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },

  pages: {
    signIn: "/auth/users/login",
    signOut: "/auth/users/login",
    error: "/auth/users/error",
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

          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          );

          if (!user) {
            throw new Error("User not found");
          }

          if (
            user.provider &&
            user.providerId &&
            user.provider !== "credentials"
          ) {
            throw new Error(
              `This account uses ${user.provider} authentication. Please sign in with ${user.provider}.`
            );
          }

          const isPasswordValid = await user.comparePassword(
            credentials.password
          );

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
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.provider = account?.provider;
      }
      return token;
    },

    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      if (publicPaths.some((p) => path.startsWith(p))) {
        if (
          isLoggedIn &&
          (path.startsWith("/auth/users/login") ||
            path.startsWith("/auth/users/register"))
        ) {
          const redirectUrl = getRoleBasedRedirectUrl(
            auth.user.role,
            nextUrl.origin
          );
          return Response.redirect(new URL(redirectUrl));
        }
        return true;
      }

      if (privatePaths.some((p) => path.startsWith(p))) {
        if (!isLoggedIn) {
          const callbackUrl = encodeURIComponent(path);
          return Response.redirect(
            new URL(`/auth/users/login?callbackUrl=${callbackUrl}`, nextUrl)
          );
        }
        return isLoggedIn;
      }

      if (path === "/") {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/auth/users/login", nextUrl));
        }
        const redirectUrl = getRoleBasedRedirectUrl(
          auth.user.role,
          nextUrl.origin
        );
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
            const userName = user.name || user.email?.split("@")[0] || "User";
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
            if (
              dbUser.provider &&
              dbUser.provider !== account.provider &&
              dbUser.provider !== "credentials"
            ) {
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

    async session({
      session,
      token,
    }: {
      session: Session;
      token: CustomToken;
    }): Promise<Session> {
      if (!token || !session.user) {
        return session;
      }

      try {
        await connect();

        if (token.id) {
          const user = (await User.findById(
            token.id
          ).lean()) as LeanUser | null;
          if (user) {
            session.user.id = user._id.toString();
            session.user.role = user.role;
            session.user.email = user.email;
            session.user.name = user.name;
            session.user.provider = user.provider;
            session.user.providerId = user.providerId;
            return session;
          }
        }

        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "user";
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.provider = token.provider as string;

        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "user";
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.provider = token.provider as string;

        return session;
      }
    },

    async redirect({ url, baseUrl }) {
      if (url.includes("signOut") || url.includes("logout")) {
        return `${baseUrl}/auth/users/login`;
      }

      // For OAuth callbacks, redirect to a custom handler that can access the session
      if (
        url.startsWith("/api/auth/callback/google") ||
        url.startsWith("/api/auth/callback")
      ) {
        return `${baseUrl}/auth/redirect`;
      }

      try {
        let callbackUrl: string | null = null;

        if (url.includes("://") || url.startsWith("http")) {
          const parsedUrl = new URL(url);
          callbackUrl = parsedUrl.searchParams.get("callbackUrl");
        } else if (url.includes("callbackUrl=")) {
          const urlParams = new URLSearchParams(url.split("?")[1]);
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

      // For all other cases, redirect to the role-based redirect handler
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
