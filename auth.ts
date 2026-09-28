// Auth.js v5 (NextAuth) configuratie
// Zie: https://authjs.dev/getting-started/installation?framework=next

import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/prisma";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import type { User } from "@prisma/client";

// Breidt de Standaard Session types uit met userId
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

export const USER_ROLES = ["ADMIN", "TEACHER", "STUDENT"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export function isTeacherRole(role?: string | null): boolean {
  return role === "ADMIN" || role === "TEACHER";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) return null;

        const { email, password } = validated.data;
        const user = await db.user.findUnique({
          where: { email },
          include: { profile: true },
        });
        if (!user || !user.passwordHash) return null;

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return null;

        return user as unknown as User;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        (token as { role?: UserRole }).role = (
          "role" in user && typeof user.role === "string"
            ? user.role
            : "STUDENT"
        ) as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id;
        session.user.role = (
          (token as { role?: UserRole }).role ?? "STUDENT"
        ) as UserRole;
      }
      return session;
    },
  },
});

// ---------- Auth helpers ----------

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });
}

export async function requireTeacher() {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error("Je moet ingelogd zijn om deze pagina te gebruiken.");
  }
  if (!isTeacherRole(user.role)) {
    throw new Error("Deze functie is alleen beschikbaar voor docenten.");
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error("Je moet ingelogd zijn om deze pagina te gebruiken.");
  }
  if (user.role !== "ADMIN") {
    throw new Error("Deze functie is alleen beschikbaar voor beheerders.");
  }
  return user;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const validated = registerSchema.safeParse({
    ...input,
    confirmPassword: input.password,
  });
  if (!validated.success) {
    return { success: false, error: validated.error.flatten() };
  }
  const { name, email, password } = validated.data;

  const exists = await db.user.findUnique({ where: { email } });
  if (exists) {
    return {
      success: false,
      error: { formErrors: ["E-mail is al in gebruik."], fieldErrors: {} },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "STUDENT",
      profile: {
        create: {
          languageLevel: "A1",
        },
      },
      streaks: {
        create: {},
      },
    },
    include: { profile: true },
  });

  return { success: true as const, user };
}
