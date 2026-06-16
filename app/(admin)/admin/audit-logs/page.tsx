import { Table, Td, Th } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";

export default async function AuditLogsPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { user: true } });
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Audit logs</h1>
      <div className="overflow-x-auto rounded-lg border border-[#e2d7c8] bg-white">
        <Table>
          <thead><tr><Th>Acțiune</Th><Th>Entitate</Th><Th>Detalii</Th><Th>Utilizator</Th><Th>Data</Th></tr></thead>
          <tbody>
            {logs.map((log) => {
              const meta = log.metadata ? (() => { try { return JSON.parse(log.metadata); } catch { return null; } })() : null;
              const isFailed = log.action.endsWith("_failed");
              return (
                <tr key={log.id} className={isFailed ? "bg-red-50" : ""}>
                  <Td><span className={isFailed ? "font-medium text-red-700" : ""}>{log.action}</span></Td>
                  <Td>{log.entityType}{log.entityId ? ` · ${log.entityId.slice(0, 12)}…` : ""}</Td>
                  <Td className="max-w-xs truncate text-xs text-[#74685c]">{meta?.error ?? (meta ? JSON.stringify(meta).slice(0, 60) : "—")}</Td>
                  <Td>{log.user?.email ?? "root / sistem"}</Td>
                  <Td>{log.createdAt.toLocaleString("ro-MD")}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
