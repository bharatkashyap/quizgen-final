// src/lib/auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      isPro?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    name?: string | null;
    image?: string | null;
    /** A unique identifier for the user. */
    id?: string;
    /** The user's email address. */
    email?: string | null;
    /**
     * Whether the user has verified their email address via an [Email provider](https://authjs.dev/getting-started/authentication/email).
     * It is `null` if the user has not signed in with the Email provider yet, or the date of the first successful signin.
     */
    emailVerified: Date | null;
    isPro?: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  pages: {
    signIn: "/", // Using home page as the sign-in page
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.isPro = user.isPro;
      }
      return session;
    },
  },
});
