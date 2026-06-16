import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";

export async function audit(
  user: CurrentUser | null,
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata?: unknown,
) {
  await prisma.auditLog.create({
    data: {
      userId: user?.id ?? null,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}
