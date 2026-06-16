import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/data";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Setări magazin</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
