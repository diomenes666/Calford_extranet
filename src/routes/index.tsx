import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Plane, Warehouse, CheckCircle2, Gift, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { cycleInfo } from "@/lib/calford";
import { ClubProgress } from "@/components/calford/ClubProgress";
import { PreguiaList } from "@/components/calford/PreguiaList";
import { TrackingSearch } from "@/components/calford/TrackingSearch";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inicio · Calford Import" },
      { name: "description", content: "Resumen de tus pre-guías, embarques Miami–Lima y puntos Club Calford." },
      { property: "og:title", content: "Inicio · Calford Import" },
      { property: "og:description", content: "Resumen de tus pre-guías, embarques Miami–Lima y puntos Club Calford." },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "En tránsito", value: 2, icon: Plane, tone: "bg-secondary text-primary" },
  { label: "En almacén Miami", value: 1, icon: Warehouse, tone: "bg-accent/15 text-accent" },
  { label: "Entregados", value: 5, icon: CheckCircle2, tone: "bg-success/15 text-success" },
];

function Dashboard() {
  const { points, gifts } = useApp();
  const { progress, toNext, next, cycle } = cycleInfo(points);
  const nextGift = gifts.find((g) => g.milestone === next);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Jueves, 12 de noviembre</p>
          <h1 className="text-3xl font-extrabold tracking-tight">¡Hola, María! 👋</h1>
          <p className="mt-1 text-muted-foreground">Esto es lo que pasa con tus compras hoy.</p>
        </div>
        <Link to="/embarques/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-bold text-accent-foreground shadow-lift transition-transform hover:-translate-y-0.5">
          <Plus className="h-5 w-5" /> Registrar Nuevo Embarque
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <TrackingSearch />
        <Link to="/club" className="block overflow-hidden rounded-2xl bg-club p-5 text-primary-foreground shadow-lift md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-80"><Gift className="h-4 w-4" /> Club Calford</p>
              <p className="mt-2 text-4xl font-extrabold">{progress}<span className="ml-1 text-lg font-semibold opacity-80">/ 1000 pts</span></p>
            </div>
            <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">Ciclo {cycle}</span>
          </div>
          <ClubProgress compact />
          <p className="mt-2 text-sm font-semibold">¡Te faltan {toNext} pts para {nextGift ? nextGift.title.toLowerCase() : "tu próximo regalo"}!</p>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-5">
        {stats.map((s) => (
          <Link to="/embarques" key={s.label} className="rounded-2xl bg-card p-4 shadow-card transition-transform hover:-translate-y-0.5 md:p-6">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}><s.icon className="h-5 w-5" /></span>
            <p className="mt-4 text-3xl font-extrabold">{s.value}</p>
            <p className="text-xs font-medium text-muted-foreground md:text-sm">{s.label}</p>
          </Link>
        ))}
      </div>

      <PreguiaList limit={6} />
      <div className="text-right">
        <Link to="/embarques" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">Ver todos mis embarques <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}
