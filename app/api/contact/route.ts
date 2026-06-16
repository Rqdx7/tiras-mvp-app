import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/validations/schemas";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success || parsed.data.honeypot) {
    return NextResponse.json({ error: "Verifică datele mesajului." }, { status: 400 });
  }

  const message = await prisma.contactMessage.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      message: parsed.data.message,
    },
  });

  await prisma.notification.create({
    data: {
      audience: "ADMIN",
      title: "Mesaj nou",
      message: `${message.firstName} a trimis un mesaj de contact.`,
      entityType: "ContactMessage",
      entityId: message.id,
    },
  });

  return NextResponse.json({ ok: true });
}
