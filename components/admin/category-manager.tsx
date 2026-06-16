"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CategoryManager() {
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    setLoading(false);
    if (!response.ok) toast.error("Categoria nu a putut fi creată.");
    else location.reload();
  }
  return (
    <form onSubmit={submit} className="grid gap-3 rounded-lg border border-[#e2d7c8] bg-white p-4 md:grid-cols-4">
      <Input name="name" placeholder="Nume categorie" required />
      <Input name="slug" placeholder="Slug opțional" />
      <Input name="description" placeholder="Descriere" />
      <Button variant="accent" disabled={loading}>Adaugă categorie</Button>
    </form>
  );
}
