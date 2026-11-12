import { createFileRoute } from "@tanstack/react-router";
import { Check, Search } from "lucide-react";
import { PageTitle } from "@/components/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/seguimiento")({
  head: () => ({
    meta: [
      { title: "Seguimiento · Calford Import" },
      { name: "description", content: "Sigue el estado de tu embarque desde Miami hasta Lima." },
      { property: "og:title", content: "Seguimiento · Calford Import" },
      { property: "og:description", content: "Sigue el estado de tu embarque desde Miami hasta Lima." },
    ],
  }),
  component: Page,
});

const steps = [
  { t: "Pre-guía registrada", d: "02 Nov · 10:24" },
  { t: "Recibido en almacén Miami", d: "04 Nov · 15:02" },
  { t: "En vuelo a Lima", d: "06 Nov · 22:40" },
  { t: "En aduanas Lima", d: "Estimado 09 Nov" },
  { t: "Entregado", d: "Estimado 11 Nov" },
];

function Page() {
  const current = 2;
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title="Seguimiento" subtitle="Ingresa tu pre-guía o tracking." />
      <div className="mb-6 flex items-center gap-2 rounded-2xl bg-card p-2 shadow-card">
        <Search className="ml-3 h-5 w-5 text-muted-foreground" />
        <input defaultValue="PG-2026-0081" className="flex-1 bg-transparent px-2 py-2 font-mono outline-none" />
        <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">Buscar</button>
      </div>
      <div className="rounded-2xl bg-card p-6 shadow-card">
        <ol className="space-y-0">
          {steps.map((s, i) => (
            <li key={s.t} className="relative flex gap-4 pb-8 last:pb-0">
              {i < steps.length - 1 && <span className={cn("absolute left-[15px] top-8 h-full w-0.5", i < current ? "bg-success" : "bg-border")} />}
              <span className={cn("z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2",
                i < current ? "border-success bg-success text-success-foreground" : i === current ? "border-accent bg-accent text-accent-foreground animate-pulse" : "border-border bg-card")}>
                {i < current && <Check className="h-4 w-4" />}
              </span>
              <div>
                <p className={cn("font-semibold", i > current && "text-muted-foreground")}>{s.t}</p>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
