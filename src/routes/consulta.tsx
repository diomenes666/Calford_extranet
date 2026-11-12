import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Upload, Building2 } from "lucide-react";
import { toast } from "sonner";
import { PageTitle } from "@/components/AppShell";
import { TrackingSearch } from "@/components/calford/TrackingSearch";
import { actions, useApp } from "@/lib/store";
import { normTracking } from "@/lib/calford";

export const Route = createFileRoute("/consulta")({
  head: () => ({
    meta: [
      { title: "Consulta de Trackings · Calford Import" },
      { name: "description", content: "Revisa si tus paquetes ya llegaron al almacén de Calford en Miami." },
      { property: "og:title", content: "Consulta de Trackings · Calford Import" },
      { property: "og:description", content: "Revisa si tus paquetes ya llegaron al almacén de Calford en Miami." },
    ],
  }),
  component: Page,
});

function Page() {
  const { incoming } = useApp();
  const [adminOpen, setAdminOpen] = useState(false);
  const [rawTrackings, setRawTrackings] = useState("");

  const handleSimulateUpload = () => {
    const lines = rawTrackings.split(/[\s,;\n]+/).map(normTracking).filter(Boolean);
    if (!lines.length && incoming.length === 0) {
      toast.info("Ingresa uno o más trackings para simular la carga del Excel de Miami.");
      return;
    }
    const { promoted, earned } = actions.verifyTrackings();
    setRawTrackings("");
    toast.success("Base de trackings de Miami actualizada", {
      description: promoted.length
        ? `${promoted.length} pre-guía(s) pasaron de Borrador a Procesado (+${earned} pts).`
        : "Trackings registrados en almacén Miami.",
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageTitle title="Consulta de Trackings" subtitle="Stock disponible en nuestro almacén de Miami." />
        <Link to="/embarques/nuevo" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-lift">
          <Plus className="h-4 w-4" /> Nuevo embarque
        </Link>
      </div>

      <TrackingSearch showStock />

      <div className="rounded-2xl border-2 border-dashed bg-card/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold">
                Módulo Interno Calford <span className="ml-1 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent">Simulado</span>
              </p>
              <p className="text-xs text-muted-foreground">Actualización diaria de trackings recibidos en almacén Miami (no visible para el cliente).</p>
            </div>
          </div>
          <button onClick={() => setAdminOpen(!adminOpen)} className="rounded-xl border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted">
            {adminOpen ? "Cerrar panel" : "Subir Excel de Trackings"}
          </button>
        </div>

        {adminOpen && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Trackings pendientes de arribo en sistema: <b className="font-mono text-foreground">{incoming.map((i) => i.tracking).join(", ") || "Ninguno"}</b>
            </p>
            <textarea
              rows={2}
              value={rawTrackings}
              onChange={(e) => setRawTrackings(e.target.value)}
              placeholder="Pega aquí nuevos números de tracking del Excel semanal o presiona procesar para ingresar los pendientes..."
              className="w-full rounded-xl border bg-background p-3 font-mono text-xs outline-none focus:border-primary"
            />
            <button
              onClick={handleSimulateUpload}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              <Upload className="h-4 w-4" /> Procesar Excel y actualizar BD Miami
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
