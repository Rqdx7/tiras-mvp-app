export function StaticPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <div className="mt-5 space-y-4 rounded-lg border border-[#e2d7c8] bg-white p-6 leading-7 text-[#5f554b]">{children}</div>
    </div>
  );
}
