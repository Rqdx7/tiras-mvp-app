import Link from "next/link";
import { RegisterForm } from "@/components/public/auth-forms";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Cont client</CardTitle>
          <CardDescription>Contul permite istoricul comenzilor și notificări în aplicație.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="mt-4 text-center text-sm text-[#74685c]">
            Ai deja cont?{" "}
            <Link className="text-[#8f5221] hover:underline" href="/login">
              Autentificare
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
