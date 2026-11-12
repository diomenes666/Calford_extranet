import { useState } from "react";
import { Search, PackageCheck, PackageX, Warehouse } from "lucide-react";
import { normTracking } from "@/lib/calford";
import { useApp } from "@/lib/store";

/** Lets clients check whether a tracking is already in stock at the Miami warehouse. */
export function TrackingSearch({ showStock = false }: { showStock?: boolean }) {
  const { stock, preguias } = useApp();
  const [q, setQ] = useState("");
  const [result, setResult] = useState<null | { t: string; found: (typeof stock)[number] | undefined }>(null);
  const linked = new Set(preguias.flatMap((p) => p.orders.flatMap((o) => o.trackings)));
  const free = stock.filter((s) => !linked.has(s.tracking));

  const search = () => {
    const t = normTracking(q);
    if (!t) return;
    setResult({ t, found: stock.find((s) => s.tracking === t) });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card p-5 shadow-card md:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary"><Warehouse className="h-5 w-5" /></span>
          <div>
            <h2 className="font-bold leading-tight">Consulta de Trackings</h2>
            <p className="text-xs text-muted-foreground">¿Ya llegó tu paquete a Miami? Búscalo antes de registrar tu pre-guía.</p>
          </div>
        </div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); search(); }}>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setResult(null); }} placeholder="Pega tu número de tracking"
              className="w-full rounded-xl border bg-background py-3 pl-10 pr-3 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" />
          </div>
          <button className="rounded-xl bg-primary px-5 font-bold text-primary-foreground">Buscar</button>
        </form>
        {result && (result.found ? (
          <div className="mt-3 flex items-start gap-3 rounded-xl bg-success/15 p-4 text-success">
            <PackageCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="text-sm">
              <p className="font-bold">Disponible en almacén Miami</p>
              <p className="text-foreground/80">{result.found.carrier} · {result.found.store} · {result.found.description} · {result.found.weightKg} kg · recibido {result.found.received}</p>
              <p className="mt-0.5 font-mono text-xs">{result.t}</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-start gap-3 rounded-xl bg-accent/15 p-4 text-accent">
            <PackageX className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="text-sm">
              <p className="font-bold">Aún no llega a Miami</p>
              <p className="text-foreground/80">Puedes registrarlo igual: tu pre-guía quedará como Borrador hasta que llegue.</p>
            </div>
          </div>
        ))}
        {!showStock && <p className="mt-3 text-xs text-muted-foreground">Prueba: <button type="button" className="font-mono underline" onClick={() => setQ("1Z999AA10123456784")}>1Z999AA10123456784</button></p>}
      </div>

      {showStock && (
        <div className="rounded-2xl bg-card p-5 shadow-card md:p-6">
          <h3 className="mb-1 font-bold">Stock disponible en Miami</h3>
          <p className="mb-4 text-xs text-muted-foreground">Paquetes recibidos que aún no están en ninguna de tus pre-guías.</p>
          {free.length === 0 ? <p className="text-sm text-muted-foreground">No tienes paquetes sueltos en el almacén.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="pb-2 font-semibold">Tracking</th><th className="pb-2 font-semibold">Courier</th><th className="pb-2 font-semibold">Tienda</th><th className="pb-2 font-semibold">Peso</th><th className="pb-2 font-semibold">Recibido</th></tr>
                </thead>
                <tbody className="divide-y">
                  {free.map((s) => (
                    <tr key={s.tracking}>
                      <td className="py-2.5 font-mono text-xs font-bold">{s.tracking}</td>
                      <td>{s.carrier}</td><td>{s.store}</td><td>{s.weightKg} kg</td><td className="text-muted-foreground">{s.received}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
