import Link from "next/link";
import { Bell, Boxes, ClipboardList, LayoutDashboard, Mail, Settings, Users, FileClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import type { CurrentUser } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Comenzi", icon: ClipboardList },
  { href: "/admin/contact-messages", label: "Mesaje contact", icon: Mail },
  { href: "/admin/products", label: "Produse", icon: Boxes },
  { href: "/admin/categories", label: "Categorii", icon: Boxes },
  { href: "/admin/users", label: "Utilizatori", icon: Users },
  { href: "/admin/notifications", label: "Notificări", icon: Bell },
  { href: "/admin/settings", label: "Setări", icon: Settings },
  { href: "/admin/audit-logs", label: "Audit", icon: FileClock },
];

export async function AdminShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const unread = await prisma.notification.count({
    where: { audience: "ADMIN", readAt: null },
  });
  return (
    <div className="border-t border-[#e1d5c5] bg-[#f3eadf]">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-lg border border-[#e2d7c8] bg-white p-3">
          <div className="mb-3 px-2 text-sm text-[#74685c]">
            Admin Tiras
            <div className="font-medium text-[#2d2925]">{user.name}</div>
          </div>
          <nav className="grid gap-1">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[#f4eee6]">
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.href === "/admin/notifications" && unread > 0 ? (
                  <span className="ml-auto rounded-full bg-[#a7642c] px-2 py-0.5 text-xs text-white">{unread}</span>
                ) : null}
              </Link>
            ))}
          </nav>
          <form action="/api/auth/logout" method="post" className="mt-3">
            <Button variant="outline" size="sm" className="w-full">Ieșire</Button>
          </form>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
