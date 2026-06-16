import Link from "next/link";
import { LoginForm } from "@/components/public/auth-forms";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Autentificare</CardTitle>
          <CardDescription>Intră în cont sau în panoul administrativ Tiras.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-[#74685c]">
            Nu ai cont?{" "}
            <Link className="text-[#8f5221] hover:underline" href="/register">
              Înregistrare
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
