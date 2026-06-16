"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function OrderStatusForm({ orderId, status }: { orderId: string; status: string }) {
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: form.get("status"), internalNotes: form.get("internalNotes") }),
    });
    setLoading(false);
    if (!response.ok) {
      toast.error("Statusul nu a putut fi actualizat.");
      return;
    }
    toast.success("Status actualizat.");
    location.reload();
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <Select name="status" defaultValue={status}>
        <option value="NEW">Comandă nouă</option>
        <option value="CONTACTED">Contactat</option>
        <option value="CONFIRMED">Confirmată</option>
        <option value="COMPLETED">Finalizată</option>
        <option value="CANCELLED">Anulată</option>
        <option value="ARCHIVED">Arhivată</option>
      </Select>
      <Textarea name="internalNotes" placeholder="Note interne" />
      <Button variant="accent" disabled={loading}>{loading ? "Se salvează..." : "Actualizează status"}</Button>
    </form>
  );
}
