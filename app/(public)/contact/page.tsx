import type { Metadata } from "next";
import { ContactForm } from "@/components/public/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[.85fr_1.15fr]">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold">Contact Tiras</h1>
        <Card>
          <CardHeader>
            <CardTitle>Magazin fizic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#5f554b]">
            <p className="font-medium text-[#2d2925]">Tiras</p>
            <p>{settings.address}</p>
            <p>
              <a className="text-[#8f5221]" href={`tel:${settings.phone.replaceAll(" ", "")}`}>
                {settings.phone}
              </a>
            </p>
            <p>{settings.workingHours}</p>
            {settings.socialLinks ? <p>{settings.socialLinks}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Întrebări frecvente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#5f554b]">
            <p><strong>Se plătește online?</strong> Nu. Fără plată online.</p>
            <p><strong>Cum confirm comanda?</strong> Operatorul contactează clientul telefonic.</p>
            <p><strong>Ridicare?</strong> Poți ridica din magazin sau stabili livrarea telefonic.</p>
          </CardContent>
        </Card>
      </section>
      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Trimite un mesaj</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
        <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-[#d8c2aa] bg-white text-center text-sm text-[#74685c]">
          {settings.mapEmbed ? settings.mapEmbed : "Hartă / link hartă configurabil din Setări magazin"}
        </div>
      </section>
    </div>
  );
}
