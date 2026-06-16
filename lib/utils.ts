import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("ro-MD", {
    style: "currency",
    currency: "MDL",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function parseMoneyToCents(value: FormDataEntryValue | null) {
  const text = String(value ?? "").replace(",", ".").trim();
  const amount = Number(text);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

export function orderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    NEW: "Comandă nouă",
    CONTACTED: "Contactat",
    CONFIRMED: "Confirmată",
    COMPLETED: "Finalizată",
    CANCELLED: "Anulată",
    ARCHIVED: "Arhivată",
  };
  return labels[status] ?? status;
}

export function roleLabel(role: string) {
  const labels: Record<string, string> = {
    CUSTOMER: "Client",
    SELLER: "Vânzător",
    ADMIN: "Admin",
    ROOT_ADMIN: "Root admin",
  };
  return labels[role] ?? role;
}
