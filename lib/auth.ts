import "server-only";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROLES, ROOT_ROLE } from "@/lib/constants";

const COOKIE_NAME = "tiras_session";
const SESSION_DAYS = 14;

export type CurrentUser = {
  id: string | null;
  email: string;
  name: string;
  role: string;
};

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function rootEmail() {
  return process.env.ROOT_ADMIN_EMAIL ?? "admin@tiras.local";
}

export async function createSession(user: CurrentUser) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      expiresAt,
    },
  });

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  if (session.userId && (!session.user || !session.user.active || session.user.deletedAt)) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  const user = session.user;
  return {
    id: session.userId,
    email: session.email,
    name: session.name ?? user?.firstName ?? session.email,
    role: session.role,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: readonly string[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/");
  return user;
}

export async function requireAdmin() {
  return requireRole(ADMIN_ROLES);
}

export async function requireManager() {
  return requireRole(["ADMIN", ROOT_ROLE]);
}

export async function verifyCredentials(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const rootHash = process.env.ROOT_ADMIN_PASSWORD_HASH;

  if (normalizedEmail === rootEmail().toLowerCase() && rootHash) {
    const ok = await bcrypt.compare(password, rootHash);
    if (ok) {
      return {
        id: null,
        email: rootEmail(),
        name: "Root admin",
        role: ROOT_ROLE,
      } satisfies CurrentUser;
    }
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user || !user.active || user.deletedAt) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  return {
    id: user.id,
    email: user.email,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
    role: user.role,
  } satisfies CurrentUser;
}
