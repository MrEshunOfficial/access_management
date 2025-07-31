import type { NextAuthConfig } from "next-auth";

export const publicPaths = ["/", "/user/register", "/user/login"];
export const privatePaths: string[] = [
  "/user/dashboard",
  "/user/profile",
  "/user/profile/profile_form",
];

declare module "next-auth" {
  interface Session {
    sessionId?: string;
  }
  interface JWT {
    sessionId?: string;
  }
}

async function generateSessionId(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

export const authConfig = {
  pages: {
    signIn: "/user/login",
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      if (privatePaths.some((p) => path.startsWith(p))) {
        if (!isLoggedIn) {
          const callbackUrl = encodeURIComponent(path);
          return Response.redirect(
            new URL(`/user/login?callbackUrl=${callbackUrl}`, nextUrl)
          );
        }
        return true;
      }

      if (publicPaths.some((p) => path.startsWith(p))) {
        if (
          isLoggedIn &&
          (path.startsWith("/user/login") || path.startsWith("/user/register"))
        ) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }
      if (path === "/") {
        return true;
      }

      return !privatePaths.some((p) => path.startsWith(p));
    },
    async jwt({ token, user }) {
      if (user) {
        token.sessionId = await generateSessionId();
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sessionId && typeof token.sessionId === "string") {
        session.sessionId = token.sessionId;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/api/auth/callback")) {
        return `${baseUrl}/`;
      }
      try {
        const parsedUrl = new URL(url);
        const callbackUrl = parsedUrl.searchParams.get("callbackUrl");
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
        return `${baseUrl}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return `${baseUrl}/`;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
