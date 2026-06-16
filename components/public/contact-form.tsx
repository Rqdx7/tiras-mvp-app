"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        phone: form.get("phone"),
        email: form.get("email"),
        message: form.get("message"),
        honeypot: form.get("website"),
      }),
    });
    setLoading(false);
    if (!response.ok) {
      toast.error("Mesajul nu a putut fi trimis.");
      return;
    }
    formEl.reset();
    toast.success("Mesaj trimis. Te vom contacta telefonic dacă este necesar.");
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="firstName" placeholder="Prenume" required />
        <Input name="lastName" placeholder="Nume" />
      </div>
      <Input name="phone" placeholder="Telefon" />
      <Input name="email" type="email" placeholder="Email" />
      <Textarea name="message" placeholder="Mesaj" required />
      <Button variant="accent" disabled={loading}>{loading ? "Se trimite..." : "Trimite mesajul"}</Button>
    </form>
  );
}
