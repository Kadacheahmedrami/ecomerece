import { PrismaAdapter } from "@next-auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

// Extend next-auth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    }
  }
  
  interface JWT {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
    isAdmin?: boolean;
  }
}

// Check if required environment variables are set
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

if (!googleClientId || !googleClientSecret) {
  console.error("Missing Google OAuth credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.")
}

// Try to initialize the Prisma adapter, with fallback if it fails
let adapter;
try {
  adapter = PrismaAdapter(prisma);
} catch (error) {
  console.error("Failed to initialize Prisma adapter:", error);
  // Will proceed without adapter, using JWT only
}

export const authOptions: NextAuthOptions = {
  adapter,
  providers: [
    GoogleProvider({
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
      // Add longer timeout
      httpOptions: {
        timeout: 10000, // 10 seconds
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.isAdmin = user.email === process.env.ADMIN_EMAIL;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) || token.sub || "unknown";
        session.user.isAdmin = !!token.isAdmin;
        
        // Ensure these values are set from token
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture) session.user.image = token.picture;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

