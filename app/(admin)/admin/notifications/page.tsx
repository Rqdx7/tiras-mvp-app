import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

function entityLink(entityType: string | null, entityId: string | null) {
  if (!entityType || !entityId) return null;
  if (entityType === "Order") return `/admin/orders/${entityId}`;
  if (entityType === "ContactMessage") return `/admin/contact-messages`;
  return null;
}

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({
    where: { audience: "ADMIN" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Mark all unread as read
  await prisma.notification.updateMany({
    where: { audience: "ADMIN", readAt: null },
    data: { readAt: new Date() },
  });

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Notificări</h1>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-lg border border-[#e2d7c8] bg-white p-8 text-center text-[#74685c]">
            Nu există notificări.
          </div>
        ) : (
          notifications.map((notification) => {
            const link = entityLink(notification.entityType, notification.entityId);
            return (
              <div
                key={notification.id}
                className={`rounded-lg border bg-white p-4 ${!notification.readAt ? "border-[#a7642c] bg-[#fdf8f3]" : "border-[#e2d7c8]"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-medium">{notification.title}</h2>
                  <Badge>{notification.readAt ? "Citită" : "Necitită"}</Badge>
                </div>
                <p className="mt-1 text-sm text-[#74685c]">{notification.message}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-[#8d8174]">{notification.createdAt.toLocaleString("ro-MD")}</p>
                  {link ? (
                    <Link
                      href={link}
                      className="text-sm font-medium text-[#8f5221] hover:underline"
                    >
                      {notification.entityType === "ContactMessage" ? "Vezi mesajele →" : "Deschide comanda →"}
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
