import Link from "next/link";
import { getSettings } from "@/lib/data";

export async function SiteFooter() {
  const settings = await getSettings();
  return (
    <footer className="border-t border-[#e1d5c5] bg-[#2d2925] text-[#f7f1e8]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-3">
        <div>
          <div className="font-serif text-2xl font-semibold">Tiras</div>
          <p className="mt-2 max-w-sm text-sm text-[#d8c8b5]">
            Magazin fizic de încălțăminte și accesorii din piele. Comanda se confirmă telefonic. Fără plată online.
          </p>
        </div>
        <div className="text-sm text-[#d8c8b5]">
          <div className="font-medium text-white">Contact</div>
          <p className="mt-2">{settings.address}</p>
          <a href={`tel:${settings.phone.replaceAll(" ", "")}`}>{settings.phone}</a>
          <p>{settings.workingHours}</p>
        </div>
        <div className="flex flex-wrap content-start gap-3 text-sm">
          <Link href="/terms">Termeni și condiții</Link>
          <Link href="/privacy">Confidențialitate</Link>
          <Link href="/returns">Retur</Link>
          <Link href="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
