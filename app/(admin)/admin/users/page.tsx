import { UserForm } from "@/components/admin/user-form";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { roleLabel } from "@/lib/utils";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 80 });
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Utilizatori</h1>
      <UserForm />
      <div className="overflow-x-auto rounded-lg border border-[#e2d7c8] bg-white">
        <Table>
          <thead><tr><Th>Email</Th><Th>Nume</Th><Th>Rol</Th><Th>Status</Th></tr></thead>
          <tbody>
            <tr>
              <Td>{process.env.ROOT_ADMIN_EMAIL ?? "admin@tiras.local"}</Td>
              <Td>Root admin</Td>
              <Td><Badge>Root admin</Badge></Td>
              <Td>Protejat</Td>
            </tr>
            {users.map((user) => (
              <tr key={user.id}>
                <Td>{user.email}</Td>
                <Td>{user.firstName} {user.lastName}</Td>
                <Td><Badge>{roleLabel(user.role)}</Badge></Td>
                <Td>{user.active && !user.deletedAt ? "Activ" : "Inactiv"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
