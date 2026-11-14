import { useState } from "react";
import {
  RefreshCw, FileText, CheckCircle2, PencilLine, Search, X, PackageCheck, Clock, ArrowRight, Eye, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { isKnownTracking, orderUsd, pointsFor, type Preguia } from "@/lib/calford";
import { actions, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

type Filter = "Todas" | "Borrador" | "Procesado";

export function PreguiaList({ limit }: { limit?: number }) {
  const { preguias, stock } = useApp();
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>("Todas");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedPreguia = selectedId ? preguias.find((p) => p.id === selectedId) ?? null : null;

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

  const handlePromoteDraft = (pg: Preguia) => {
    const res = actions.processPreguia(pg.id);
    if (!res) return;
    setFlash([pg.id]);
    setTimeout(() => setFlash([]), 4000);
    toast.success(`Pre-guía ${pg.id} procesada`, {
      description: `Se actualizó el estado a Procesado manteniendo sus productos y trackings intactos.${res.earned ? ` +${res.earned} pts Club Calford.` : ""}`,
    });
  };

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">Mis pre-guías</h2>
          <p className="text-xs text-muted-foreground">
            {drafts ? `${drafts} en borrador esperando trackings en Miami · ${processed} procesada(s)` : "Todas las pre-guías están procesadas"} · Haz clic en una pre-guía para ver su detalle
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
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    "group flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-3 text-left transition-colors duration-300 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    flash.includes(p.id) && "bg-success/10",
                  )}
                >
                  <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", draft ? "bg-accent/15 text-accent" : "bg-success/15 text-success")}>
                    {draft ? <PencilLine className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-bold group-hover:text-primary">{p.id}</p>
                      <span className="hidden items-center gap-1 text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 md:inline-flex">
                        <Eye className="h-3 w-3" /> Ver detalle
                      </span>
                    </div>
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
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selectedPreguia && (
        <PreguiaDetailModal
          pg={selectedPreguia}
          stock={stock}
          onClose={() => setSelectedId(null)}
          onPromote={() => handlePromoteDraft(selectedPreguia)}
        />
      )}
    </div>
  );
}

function PreguiaDetailModal({
  pg,
  stock,
  onClose,
  onPromote,
}: {
  pg: Preguia;
  stock: ReturnType<typeof useApp>["stock"];
  onClose: () => void;
  onPromote: () => void;
}) {
  const isDraft = pg.status === "Borrador";
  const exceeds200 = pg.totalUsd > 200;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-3 backdrop-blur-sm md:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pg-detail-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-lift md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b bg-brand px-5 py-4 text-primary-foreground md:px-6 md:py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 id="pg-detail-title" className="font-mono text-xl font-extrabold md:text-2xl">{pg.id}</h3>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold",
                  isDraft ? "bg-accent text-accent-foreground" : "bg-success text-success-foreground",
                )}
              >
                {!isDraft && <CheckCircle2 className="h-3.5 w-3.5" />} {pg.status}
              </span>
            </div>
            <p className="mt-1 text-xs opacity-80">Registrada el {pg.date} · Ruta Miami → Lima</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="rounded-lg p-1.5 text-primary-foreground/80 transition hover:bg-primary-foreground/15 hover:text-primary-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-6">
          {/* Metadata grid */}
          <div className="grid gap-3 rounded-xl border bg-muted/40 p-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Comprador</p>
              <p className="mt-0.5 font-bold">{pg.buyer}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Importador / Documento</p>
              <p className="mt-0.5 font-semibold">{pg.importer}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Declarado (USD)</p>
              <p className={cn("mt-0.5 text-base font-extrabold", exceeds200 ? "text-destructive" : "text-primary")}>
                ${pg.totalUsd.toFixed(2)}
              </p>
            </div>
          </div>

          {exceeds200 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="font-semibold">
                Esta pre-guía supera los $200 USD declarados y está sujeta al pago de impuestos adicionales en aduanas.
              </p>
            </div>
          )}

          {/* Orders list / table */}
          <div>
            <h4 className="mb-2.5 text-sm font-bold">Órdenes y productos declarados ({pg.orders.length})</h4>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3.5 py-2.5">Tienda</th>
                    <th className="px-3.5 py-2.5">Contenido</th>
                    <th className="px-3.5 py-2.5">Trackings</th>
                    <th className="px-3.5 py-2.5">Factura</th>
                    <th className="px-3.5 py-2.5 text-right">Monto USD</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pg.orders.map((o) => (
                    <tr key={o.id} className="align-top hover:bg-muted/30">
                      <td className="px-3.5 py-3 font-semibold">{o.store}</td>
                      <td className="px-3.5 py-3 text-foreground">{o.content || "—"}</td>
                      <td className="px-3.5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {o.trackings.map((t) => {
                            const known = isKnownTracking(t, stock);
                            return (
                              <span
                                key={t}
                                title={known ? "Recibido en almacén Miami" : "Aún no en almacén Miami"}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold",
                                  known ? "bg-success/15 text-success" : "bg-accent/15 text-accent",
                                )}
                              >
                                {known ? <PackageCheck className="h-3 w-3 shrink-0" /> : <Clock className="h-3 w-3 shrink-0" />}
                                {t}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-xs text-muted-foreground">
                        {o.invoice ? (
                          <span className="inline-flex items-center gap-1 font-medium text-foreground">
                            <FileText className="h-3.5 w-3.5 text-primary" /> {o.invoice}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-right font-bold tabular-nums">${orderUsd(o).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {pg.orders.map((o, idx) => (
                <div key={o.id} className="rounded-xl border p-3.5 text-sm">
                  <div className="flex items-center justify-between font-bold">
                    <span>{idx + 1}. {o.store}</span>
                    <span>${orderUsd(o).toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{o.content}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {o.trackings.map((t) => {
                      const known = isKnownTracking(t, stock);
                      return (
                        <span
                          key={t}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold",
                            known ? "bg-success/15 text-success" : "bg-accent/15 text-accent",
                          )}
                        >
                          {known ? <PackageCheck className="h-3 w-3 shrink-0" /> : <Clock className="h-3 w-3 shrink-0" />}
                          {t}
                        </span>
                      );
                    })}
                  </div>
                  {o.invoice && (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" /> {o.invoice}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isDraft && (
            <div className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
              <p className="font-bold text-foreground">Pre-guía en estado Borrador</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Puedes proceder al siguiente proceso para pasar esta pre-guía a <b>Procesado</b> sin modificar los productos ni los trackings ya registrados (+{pointsFor(pg.totalUsd)} pts Club Calford).
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col-reverse gap-2.5 border-t bg-muted/30 px-5 py-4 sm:flex-row sm:justify-end md:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            Cerrar
          </button>
          {isDraft && (
            <button
              type="button"
              onClick={onPromote}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground shadow-lift transition hover:opacity-95"
            >
              Proceder al siguiente proceso <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
