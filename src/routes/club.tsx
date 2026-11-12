import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Check, Lock, RotateCcw, Save, Star } from "lucide-react";
import { toast } from "sonner";
import { PageTitle } from "@/components/AppShell";
import { ClubProgress } from "@/components/calford/ClubProgress";
import { GIFT_ICONS } from "@/components/calford/gift-icons";
import { cycleInfo } from "@/lib/calford";
import { actions, useApp, type Gift, type GiftIcon } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/club")({
  head: () => ({
    meta: [
      { title: "Club Calford · Beneficios" },
      { name: "description", content: "Acumula puntos con cada embarque y desbloquea los regalos del mes cada 250 pts." },
      { property: "og:title", content: "Club Calford · Beneficios" },
      { property: "og:description", content: "Acumula puntos con cada embarque y desbloquea los regalos del mes cada 250 pts." },
    ],
  }),
  component: Page,
});

const field = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";

function Page() {
  const { points, gifts, giftsMonth, redeemed } = useApp();
  const { progress, cycle, toNext } = cycleInfo(points);
  const [admin, setAdmin] = useState(false);

  const addPts = (n: number) => {
    const before = cycleInfo(points).cycle;
    actions.addPoints(n);
    if (cycleInfo(points + n).cycle > before) toast.success("¡Completaste 1000 pts!", { description: "La barra se reinicia y comienza un nuevo ciclo de regalos." });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle title="Club Calford" subtitle="Gana 10 pts por cada $100 importados. Cada 250 pts desbloqueas un regalo." />

      <div className="mb-6 rounded-3xl bg-club p-6 text-primary-foreground shadow-lift md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm opacity-80"><Star className="h-4 w-4" /> Puntos del ciclo {cycle}</p>
            <p className="mt-1 text-5xl font-extrabold">{progress}<span className="ml-2 text-xl font-semibold opacity-80">/ 1000</span></p>
          </div>
          <div className="text-right text-sm">
            <p className="opacity-80">Regalos de {giftsMonth}</p>
            <p className="font-semibold">Faltan {toNext} pts para el siguiente</p>
          </div>
        </div>
        <ClubProgress />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {gifts.map((g) => {
          // The 1000-pt gift is earned when a cycle completes (the bar has already restarted).
          const full = g.milestone >= 1000;
          const key = full ? `${cycle - 1}-${g.milestone}` : `${cycle}-${g.milestone}`;
          const done = !full && redeemed.includes(key);
          const reached = full ? cycle > 1 && !redeemed.includes(key) : progress >= g.milestone;
          const Icon = GIFT_ICONS[g.icon].icon;
          return (
            <div key={g.milestone} className={cn("overflow-hidden rounded-2xl bg-card shadow-card transition", !reached && "opacity-80")}>
              <div className={cn("relative grid h-28 place-items-center", reached ? "bg-club text-primary-foreground" : "bg-muted text-muted-foreground")}>
                <Icon className="h-12 w-12" strokeWidth={1.5} />
                <span className="absolute left-3 top-3 rounded-full bg-card px-2.5 py-0.5 text-xs font-bold text-foreground">{g.milestone} pts</span>
                {!reached && <Lock className="absolute right-3 top-3 h-4 w-4" />}
              </div>
              <div className="p-4">
                <p className="font-bold leading-tight">{g.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{g.detail}</p>
                <button disabled={!reached || done}
                  onClick={() => { actions.redeem(key); toast.success(`Canjeaste: ${g.title}`, { description: "Te enviamos los detalles a tu correo." }); }}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-success py-2.5 text-sm font-bold text-success-foreground disabled:bg-muted disabled:text-muted-foreground">
                  {done ? <><Check className="h-4 w-4" /> Canjeado</> : reached ? "Canjear" : `Faltan ${g.milestone - progress} pts`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border-2 border-dashed bg-card/60 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Building2 className="h-5 w-5" /></span>
            <div>
              <p className="font-bold">Panel de empresa <span className="ml-1 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent">Simulado</span></p>
              <p className="text-xs text-muted-foreground">Calford puede cambiar los regalos del mes desde aquí.</p>
            </div>
          </div>
          <button onClick={() => setAdmin(!admin)} className="rounded-xl border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted">{admin ? "Cerrar" : "Gestionar regalos"}</button>
        </div>
        {admin && <GiftEditor key={giftsMonth + gifts.map((g) => g.title).join()} gifts={gifts} month={giftsMonth} onAddPts={addPts} />}
      </div>
    </div>
  );
}

function GiftEditor({ gifts, month, onAddPts }: { gifts: Gift[]; month: string; onAddPts: (n: number) => void }) {
  const [draft, setDraft] = useState<Gift[]>(gifts);
  const [m, setM] = useState(month);
  const upd = (i: number, patch: Partial<Gift>) => setDraft(draft.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  const valid = m.trim() && draft.every((g) => g.title.trim());

  return (
    <div className="mt-5 space-y-4">
      <label className="block max-w-xs">
        <span className="mb-1 block text-xs font-semibold text-muted-foreground">Mes de la campaña</span>
        <input className={field} value={m} onChange={(e) => setM(e.target.value)} />
      </label>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-3 py-2.5 font-semibold">Hito</th><th className="px-3 py-2.5 font-semibold">Ícono</th><th className="px-3 py-2.5 font-semibold">Regalo</th><th className="px-3 py-2.5 font-semibold">Detalle</th></tr>
          </thead>
          <tbody className="divide-y">
            {draft.map((g, i) => (
              <tr key={g.milestone}>
                <td className="px-3 py-2 font-bold">{g.milestone} pts</td>
                <td className="px-3 py-2">
                  <select className={field} value={g.icon} onChange={(e) => upd(i, { icon: e.target.value as GiftIcon })}>
                    {Object.entries(GIFT_ICONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2"><input className={field} value={g.title} onChange={(e) => upd(i, { title: e.target.value })} /></td>
                <td className="px-3 py-2"><input className={field} value={g.detail} onChange={(e) => upd(i, { detail: e.target.value })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Simular puntos del cliente:</span>
          {[100, 250].map((n) => <button key={n} onClick={() => onAddPts(n)} className="rounded-lg border bg-card px-3 py-1.5 font-semibold text-foreground hover:bg-muted">+{n} pts</button>)}
          <button onClick={() => { actions.reset(); toast("Demo reiniciada"); }} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-semibold hover:bg-muted"><RotateCcw className="h-3.5 w-3.5" /> Reiniciar demo</button>
        </div>
        <button disabled={!valid} onClick={() => { actions.updateGifts(draft, m.trim()); toast.success("Regalos del mes actualizados"); }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40">
          <Save className="h-4 w-4" /> Guardar regalos
        </button>
      </div>
    </div>
  );
}
