import Link from "next/link";
import { CircleUserRound, MapPin, Phone, ShieldCheck } from "lucide-react";
import { CartLink } from "@/components/public/cart-link";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  const isAdmin = user && ["SELLER", "ADMIN", "ROOT_ADMIN"].includes(user.role);
  const mainNav = [
    { href: "/", label: "Pagina principală" },
    { href: "/catalog", label: "Catalog" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#ded1bf] bg-[#f7f1e8]/95 shadow-[0_1px_0_rgba(45,41,37,0.03)] backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Tiras acasă">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#2d2925] font-serif text-xl text-[#f7f1e8]">
            T
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-xl font-semibold tracking-wide text-[#2d2925]">Tiras</span>
            <span className="hidden text-xs text-[#74685c] sm:block">Piele, calitate, încredere</span>
          </span>
        </Link>

        <nav className="hidden justify-self-center rounded-full border border-[#e2d7c8] bg-white/65 p-1 shadow-sm md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-[#4b443d] transition hover:bg-[#efe7dc] hover:text-[#2d2925]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Link
            href="/contact"
            className="hidden h-10 items-center justify-center gap-2 rounded-md border border-[#d7c9b8] bg-white/70 px-3 text-sm text-[#2d2925] transition hover:border-[#a7642c] hover:bg-[#fffaf3] lg:inline-flex"
          >
            <MapPin className="h-4 w-4" />
            Contact
          </Link>
          <Button asChild variant="outline" size="icon" className="hidden sm:inline-flex" title={settings.phone}>
            <a href={`tel:${settings.phone.replaceAll(" ", "")}`}>
              <Phone className="h-4 w-4" />
              <span className="sr-only">{settings.phone}</span>
            </a>
          </Button>
          <CartLink compact />
          <Link
            href={user ? "/account/orders" : "/login"}
            className="inline-flex h-10 items-center justify-center rounded-md border border-[#d7c9b8] bg-white/70 px-3 text-sm text-[#2d2925] transition hover:border-[#a7642c] hover:bg-[#fffaf3]"
            title={user ? "Contul meu" : "Autentificare"}
            aria-label={user ? "Contul meu" : "Autentificare"}
          >
            <CircleUserRound className="h-4 w-4" />
            <span className="hidden lg:ml-2 lg:inline">{user ? "Cont" : "Intră"}</span>
          </Link>
          {isAdmin ? (
            <Link
              href="/admin"
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#2d2925] px-3 text-sm font-medium text-white transition hover:bg-[#1f1b18]"
              title="Admin"
              aria-label="Admin"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden xl:ml-2 xl:inline">Admin</span>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="border-t border-[#eadfce] md:hidden">
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full border border-[#e2d7c8] bg-white/65 px-4 py-1.5 text-sm font-medium text-[#4b443d]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="inline-flex whitespace-nowrap rounded-full border border-[#d7c9b8] bg-white/65 px-4 py-1.5 text-sm font-medium text-[#4b443d]"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
