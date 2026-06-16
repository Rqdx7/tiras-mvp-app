import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { requireManager } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_SIZE = 4 * 1024 * 1024;

export async function POST(request: Request) {
  await requireManager();
  const formData = await request.formData();
  const files = formData.getAll("images").filter((file): file is File => file instanceof File);

  const uploaded = [];
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Sunt permise doar fișiere imagine." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Imaginea este prea mare. Limita este 4MB." }, { status: 400 });
    }
    const ext = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, "") || ".jpg";
    const safeName = `${crypto.randomUUID()}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, safeName), bytes);
    uploaded.push({
      url: `/uploads/${safeName}`,
      fileName: safeName,
      mimeType: file.type,
      sizeBytes: file.size,
    });
  }

  return NextResponse.json({ uploaded });
}
