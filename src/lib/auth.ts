import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db, hasDatabase } from "@/lib/db";
import type { Role } from "@/generated/prisma/enums";
import type { Session, User } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";

const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!hasDatabase()) return null;

        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          console.error("[auth] Credentials authorize failed: missing email or password input", {
            hasEmail: Boolean(email),
            hasPassword: Boolean(password),
          });
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.error("[auth] Credentials authorize failed: user not found", {
              email,
            });
            return null;
          }

          if (!user.password) {
            console.error("[auth] Credentials authorize failed: user missing password hash", {
              email,
              userId: user.id,
            });
            return null;
          }

          const passwordMatch = await bcrypt.compare(password, user.password);

          if (!passwordMatch) {
            console.error("[auth] Credentials authorize failed: password comparison failed", {
              email,
              userId: user.id,
            });
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as Role,
          };
        } catch (error) {
          console.error("[auth] Credentials authorize failed with unexpected exception", {
            email,
            error: error instanceof Error ? error.message : error,
          });
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id ?? token.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
};

const authOptions = hasDatabase()
  ? {
      ...authConfig,
      adapter: PrismaAdapter(db) as Adapter,
    }
  : authConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
