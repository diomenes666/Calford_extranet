import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageTitle } from "@/components/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Programar Delivery · Calford Import" },
      { name: "description", content: "Elige fecha y dirección para recibir tu embarque en Lima." },
      { property: "og:title", content: "Programar Delivery · Calford Import" },
      { property: "og:description", content: "Elige fecha y dirección para recibir tu embarque en Lima." },
    ],
  }),
  component: Page,
});

const days = ["Lun 10", "Mar 11", "Mié 12", "Jue 13", "Vie 14"];
const slots = ["9:00 – 13:00", "14:00 – 18:00"];

function Page() {
  const [day, setDay] = useState(1);
  const [slot, setSlot] = useState(0);
  const [done, setDone] = useState(false);
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title="Programar Delivery" subtitle="PG-2026-0081 · llega a Lima pronto." />
      <div className="space-y-5 rounded-2xl bg-card p-6 shadow-card">
        <div>
          <p className="mb-2 text-sm font-semibold">Fecha</p>
          <div className="grid grid-cols-5 gap-2">
            {days.map((d, i) => (
              <button key={d} onClick={() => setDay(i)} className={cn("rounded-xl border py-3 text-sm font-semibold", day === i ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}>{d}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Horario</p>
          <div className="grid grid-cols-2 gap-2">
            {slots.map((s, i) => (
              <button key={s} onClick={() => setSlot(i)} className={cn("rounded-xl border py-3 text-sm font-semibold", slot === i ? "border-primary bg-secondary text-primary" : "hover:bg-muted")}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Dirección</p>
          <input defaultValue="Av. Larco 1150, Miraflores, Lima" className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
        </div>
        {done ? (
          <p className="flex items-center gap-2 rounded-xl bg-success/15 p-4 font-semibold text-success"><CheckCircle2 className="h-5 w-5" /> Delivery programado para el {days[day]}, {slots[slot]}.</p>
        ) : (
          <button onClick={() => setDone(true)} className="w-full rounded-xl bg-accent py-3.5 font-bold text-accent-foreground shadow-lift">Confirmar delivery</button>
        )}
      </div>
    </div>
  );
}
