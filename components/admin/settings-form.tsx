"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/app/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [state, action, pending] = useActionState(updateSettingsAction, null);
  return (
    <form action={action} className="space-y-3 rounded-lg border border-[#e2d7c8] bg-white p-5">
      {state?.error ? <Alert>{state.error}</Alert> : null}
      {state?.ok ? <Alert>{state.ok}</Alert> : null}
      <Input name="storeName" placeholder="Nume magazin" defaultValue={settings.storeName} />
      <Input name="address" placeholder="Adresă" defaultValue={settings.address} />
      <Input name="phone" placeholder="Telefon" defaultValue={settings.phone} />
      <Input name="email" placeholder="Email" defaultValue={settings.email} />
      <Input name="workingHours" placeholder="Program" defaultValue={settings.workingHours} />
      <Textarea name="socialLinks" placeholder="Linkuri social media" defaultValue={settings.socialLinks} />
      <Textarea name="mapEmbed" placeholder="Hartă / link embed" defaultValue={settings.mapEmbed} />
      <Textarea name="homepageIntro" placeholder="Text homepage" defaultValue={settings.homepageIntro} />
      <Input name="seoTitle" placeholder="SEO titlu" defaultValue={settings.seoTitle} />
      <Textarea name="seoDescription" placeholder="SEO descriere" defaultValue={settings.seoDescription} />
      <Button variant="accent" disabled={pending}>Salvează setările</Button>
    </form>
  );
}
