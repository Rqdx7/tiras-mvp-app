"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function UserForm() {
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    setLoading(false);
    if (!response.ok) toast.error("Utilizatorul nu a putut fi creat.");
    else location.reload();
  }
  return (
    <form onSubmit={submit} className="grid gap-3 rounded-lg border border-[#e2d7c8] bg-white p-4 md:grid-cols-3">
      <Input name="firstName" placeholder="Prenume" />
      <Input name="lastName" placeholder="Nume" />
      <Input name="phone" placeholder="Telefon" />
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="password" type="password" placeholder="Parolă temporară" required />
      <Select name="role" defaultValue="CUSTOMER">
        <option value="CUSTOMER">Client</option>
        <option value="SELLER">Vânzător</option>
        <option value="ADMIN">Admin</option>
      </Select>
      <Button variant="accent" disabled={loading}>Creează utilizator</Button>
    </form>
  );
}
