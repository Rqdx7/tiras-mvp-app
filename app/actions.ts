"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSession, destroySession, getCurrentUser, verifyCredentials, requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { loginSchema, registerSchema, settingsSchema } from "@/validations/schemas";

export async function loginAction(_prev: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Verifică emailul și parola." };

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) return { error: "Date de autentificare incorecte." };

  await createSession(user);
  await audit(user, "login", "User", user.id ?? user.email);
  redirect(user.role === "CUSTOMER" ? "/account/orders" : "/admin");
}

export async function registerAction(_prev: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Verifică datele introduse." };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) return { error: "Există deja un cont cu acest email." };

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email.toLowerCase(),
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      role: "CUSTOMER",
    },
  });
  const current = {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role,
  };
  await createSession(current);
  await audit(current, "user_create", "User", user.id);
  redirect("/account/orders");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function updateSettingsAction(_prev: unknown, formData: FormData) {
  const user = await requireManager();
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Datele setărilor nu sunt valide." };

  await Promise.all(
    Object.entries(parsed.data).map(([key, value]) =>
      prisma.storeSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      }),
    ),
  );
  await audit(user, "settings_update", "StoreSetting", "global", parsed.data);
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: "Setările au fost salvate." };
}

export async function currentUserForClient() {
  return getCurrentUser();
}
