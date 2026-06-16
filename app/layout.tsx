import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Tiras - încălțăminte și accesorii din piele în Leova",
    template: "%s | Tiras",
  },
  description:
    "Catalog local Tiras pentru încălțăminte și accesorii din piele. Comandă cu confirmare telefonică, fără plată online.",
  openGraph: {
    title: "Tiras",
    description: "Încălțăminte și accesorii din piele în Leova.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
