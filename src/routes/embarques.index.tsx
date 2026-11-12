import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageTitle } from "@/components/AppShell";
import { shipments, statusStyle } from "@/lib/mock";
import { PreguiaList } from "@/components/calford/PreguiaList";

export const Route = createFileRoute("/embarques/")({
  head: () => ({
    meta: [
      { title: "Mis Embarques · Calford Import" },
      { name: "description", content: "Lista de tus embarques registrados en Calford Import." },
      { property: "og:title", content: "Mis Embarques · Calford Import" },
      { property: "og:description", content: "Lista de tus embarques registrados en Calford Import." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <PageTitle title="Mis Embarques" subtitle="Todas tus pre-guías registradas." />
        <Link to="/embarques/nuevo" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-lift">
          <Plus className="h-4 w-4" /> Nuevo
        </Link>
      </div>
      <PreguiaList />
      <h2 className="mb-3 mt-8 font-bold">Embarques en curso y entregados</h2>
      <div className="grid gap-3">
        {shipments.map((s) => (
          <div key={s.id} className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-card md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono font-bold">{s.id}</p>
              <p className="text-sm text-muted-foreground">{s.store} · {s.items} · {s.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold">${s.value.toFixed(2)}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[s.status]}`}>{s.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
