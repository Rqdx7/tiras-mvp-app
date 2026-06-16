"use client";

import { useActionState } from "react";
import { loginAction, registerAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-3">
      {state?.error ? <Alert>{state.error}</Alert> : null}
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="password" type="password" placeholder="Parolă" required />
      <Button className="w-full" variant="accent" disabled={pending}>
        Autentificare
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, null);
  return (
    <form action={action} className="space-y-3">
      {state?.error ? <Alert>{state.error}</Alert> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="firstName" placeholder="Prenume" required />
        <Input name="lastName" placeholder="Nume" required />
      </div>
      <Input name="phone" placeholder="Telefon" required />
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="password" type="password" placeholder="Parolă" required />
      <Button className="w-full" variant="accent" disabled={pending}>
        Creează cont
      </Button>
    </form>
  );
}
