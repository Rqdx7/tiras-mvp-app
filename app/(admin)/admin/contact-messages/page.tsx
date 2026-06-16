import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export default async function ContactMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Mesaje de contact</h1>
      {messages.length === 0 ? (
        <div className="rounded-lg border border-[#e2d7c8] bg-white p-8 text-center text-[#74685c]">
          Nu există mesaje.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="rounded-lg border border-[#e2d7c8] bg-white p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#2d2925]">
                    {msg.firstName} {msg.lastName ?? ""}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-[#74685c]">
                    {msg.phone ? <span>📞 {msg.phone}</span> : null}
                    {msg.email ? <span>✉️ {msg.email}</span> : null}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge>{msg.status === "NEW" ? "Nou" : msg.status === "READ" ? "Citit" : msg.status}</Badge>
                  <span className="text-xs text-[#8d8174]">{msg.createdAt.toLocaleString("ro-MD")}</span>
                </div>
              </div>
              <p className="rounded-md bg-[#f7f1e8] px-4 py-3 text-sm text-[#2d2925] whitespace-pre-wrap">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
