import type { Metadata } from "next";
import { CartPage } from "@/components/public/cart-page";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Coș și cerere" };

export default async function CartRoute() {
  const session = await getCurrentUser();
  const user = session?.id ? await prisma.user.findUnique({ where: { id: session.id } }) : null;
  return (
    <CartPage
      user={
        user
          ? {
              firstName: user.firstName ?? "",
              lastName: user.lastName ?? "",
              phone: user.phone ?? "",
              email: user.email,
            }
          : null
      }
    />
  );
}
