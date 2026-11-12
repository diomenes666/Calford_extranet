import { useState } from "react";
import { RefreshCw, FileText, CheckCircle2, PencilLine, Search } from "lucide-react";
import { toast } from "sonner";
import { actions, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

type Filter = "Todas" | "Borrador" | "Procesado";

export function PreguiaList({ limit }: { limit?: number }) {
  const { preguias } = useApp();
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>("Todas");
  const [query, setQuery] = useState("");

  const drafts = preguias.filter((p) => p.status === "Borrador").length;
  const processed = preguias.filter((p) => p.status === "Procesado").length;

  const filtered = preguias.filter((p) => {
    if (filter !== "Todas" && p.status !== filter) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    const trks = p.orders.flatMap((o) => o.trackings).join(" ").toLowerCase();
    return p.id.toLowerCase().includes(q) || p.buyer.toLowerCase().includes(q) || trks.includes(q);
  });

  const list = limit ? filtered.slice(0, limit) : filtered;

  const verify = () => {
    setBusy(true);
    setTimeout(() => {
      const { promoted, earned } = actions.verifyTrackings();
      setBusy(false);
      if (promoted.length) {
        setFlash(promoted.map((p) => p.id));
        setTimeout(() => setFlash([]), 4000);
        toast.success(`${promoted.length} pre-guía(s) pasaron a Procesado`, {
          description: `${promoted.map((p) => p.id).join(", ")}: sus trackings ya llegaron al almacén Miami.${earned ? ` +${earned} pts Club Calford.` : ""}`,
        });
      } else {
        toast.info("Todo al día", { description: "No hay borradores con trackings nuevos en el almacén Miami." });
      }
    }, 1000);
  };

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">Mis pre-guías</h2>
          <p className="text-xs text-muted-foreground">
            {drafts ? `${drafts} en borrador esperando trackings en Miami · ${processed} procesada(s)` : "Todas las pre-guías están procesadas"}
          </p>
        </div>
        <button
          onClick={verify}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-secondary px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
        >
          <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} /> {busy ? "Verificando…" : "Verificar Trackings"}
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(["Todas", "Borrador", "Procesado"] as Filter[]).map((f) => {
            const count = f === "Todas" ? preguias.length : f === "Borrador" ? drafts : processed;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {f} ({count})
              </button>
            );
          })}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar pre-guía o tracking…"
            className="w-full rounded-lg border bg-background py-1.5 pl-8 pr-3 text-xs outline-none focus:border-primary"
          />
        </div>
      </div>

      {list.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No se encontraron pre-guías con ese filtro.</p>
      ) : (
        <ul className="divide-y">
          {list.map((p) => {
            const draft = p.status === "Borrador";
            const trk = p.orders.flatMap((o) => o.trackings);
            return (
              <li key={p.id} className={cn("flex items-center gap-3 rounded-xl px-2 py-3 transition-colors duration-700", flash.includes(p.id) && "bg-success/10")}>
                <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", draft ? "bg-accent/15 text-accent" : "bg-success/15 text-success")}>
                  {draft ? <PencilLine className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-bold">{p.id}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.date} · {p.buyer} · {p.orders.length} orden(es) · {trk.length} tracking(s) · ${p.totalUsd.toFixed(2)}
                  </p>
                </div>
                <span
                  title={draft ? "Pendiente de tracking en almacén Miami" : "Lista para embarque"}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
                    draft ? "bg-accent/15 text-accent" : "bg-success/15 text-success",
                  )}
                >
                  {!draft && <CheckCircle2 className="h-3.5 w-3.5" />} {p.status}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
