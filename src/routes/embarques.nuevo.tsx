import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Check, Plus, Trash2, X, ChevronLeft, ChevronRight, Send, PartyPopper,
  UserPlus, Paperclip, FileText, PackageCheck, Clock, AlertTriangle, PencilLine, Upload, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CURRENCIES, USD_RATE, isKnownTracking, orderIsComplete, orderUsd, pointsFor, splitTrackings, unknownTrackings,
  type Currency, type Order, type Preguia,
} from "@/lib/calford";
import { actions, nextPreguiaId, useApp, type Buyer } from "@/lib/store";

export const Route = createFileRoute("/embarques/nuevo")({
  head: () => ({
    meta: [
      { title: "Nuevo Embarque · Calford Import" },
      { name: "description", content: "Registra tu pre-guía, órdenes y trackings para enviar a Miami." },
      { property: "og:title", content: "Nuevo Embarque · Calford Import" },
      { property: "og:description", content: "Registra tu pre-guía, órdenes y trackings para enviar a Miami." },
    ],
  }),
  component: Wizard,
});

const STORES = ["Amazon", "eBay", "Walmart", "Best Buy", "Target", "Shein", "AliExpress", "Otra"];
const STEPS = ["Pre-Guía", "Órdenes", "Resumen"];
const DRAFT_MSG = "Tracking aún no en lista, la pre-guía se guardará como borrador";
const docOk = (d: string) => /^\d{8}$|^\d{11}$/.test(d);

const field = "w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30";
const cell = "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30 xl:border-transparent xl:bg-transparent xl:px-2.5 xl:py-2 xl:hover:border-border xl:focus:bg-background";
const COLS = "xl:grid-cols-[118px_minmax(150px,1fr)_84px_108px_118px_minmax(210px,1.3fr)_124px_40px]";
const newOrder = (): Order => ({ id: Date.now() + Math.random(), store: "Amazon", content: "", currency: "USD", amount: "", usd: "", trackings: [], invoice: null });

function Wizard() {
  const app = useApp();
  const [step, setStep] = useState(0);
  const [buyerDoc, setBuyerDoc] = useState(app.buyers.find((b) => b.titular)?.doc ?? app.buyers[0]!.doc);
  const [buyerModal, setBuyerModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>([newOrder()]);
  const [showErrors, setShowErrors] = useState(false);
  const [sent, setSent] = useState<Preguia | null>(null);

  const upd = (id: number, patch: Partial<Order>) => setOrders((o) => o.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const total = orders.reduce((s, o) => s + orderUsd(o), 0);
  const ordersValid = orders.every(orderIsComplete);
  const canNext = [true, ordersValid, true][step] ?? true;
  const missing = unknownTrackings(orders, app.stock);
  const selectedBuyer = app.buyers.find((b) => b.doc === buyerDoc) ?? app.buyers[0]!;

  const next = () => {
    if (!canNext) {
      setShowErrors(true);
      toast.error("Completa los campos marcados en cada orden (contenido, monto, tracking y factura)");
      return;
    }
    setShowErrors(false);
    setStep(step + 1);
  };

  const submit = () => {
    const pg = actions.savePreguia({
      buyer: selectedBuyer.name,
      importer: `${selectedBuyer.name} · ${selectedBuyer.doc}`,
      orders,
    });
    setSent(pg);
  };

  if (sent) return <Done pg={sent} />;

  return (
    <div className={cn("mx-auto transition-[max-width]", step === 1 ? "max-w-6xl" : "max-w-3xl")}>
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Volver
      </Link>
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Nuevo Embarque</h1>

      <ol className="mx-auto my-6 flex max-w-2xl items-center">
        {STEPS.map((s, i) => (
          <li key={s} className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <span className={cn("grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition-colors",
                i < step ? "bg-success text-success-foreground" : i === step ? "bg-primary text-primary-foreground shadow-lift" : "bg-muted text-muted-foreground")}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn("text-xs font-semibold", i === step ? "text-primary" : "text-muted-foreground")}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <span className={cn("mx-2 mb-5 h-0.5 flex-1 rounded", i < step ? "bg-success" : "bg-border")} />}
          </li>
        ))}
      </ol>

      <div className={cn("rounded-2xl bg-card shadow-card", step === 1 ? "p-4 md:p-5 xl:p-0" : "p-5 md:p-7")}>
        {step === 0 && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-brand p-5 text-primary-foreground">
              <p className="text-xs uppercase tracking-widest opacity-75">N° de Pre-Guía (autogenerado)</p>
              <p className="mt-1 font-mono text-3xl font-bold">{nextPreguiaId(app)}</p>
            </div>
            <div>
              <span className="mb-2 block text-sm font-semibold">Usuario comprador / Importador</span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select className={field} value={buyerDoc} onChange={(e) => setBuyerDoc(e.target.value)} aria-label="Usuario comprador">
                  {app.buyers.map((b) => (
                    <option key={b.doc} value={b.doc}>
                      {b.name}{b.titular ? " (titular)" : ""} · {b.doc.length === 8 ? "DNI" : "RUC"} {b.doc}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setBuyerModal(true)}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-primary/20 bg-secondary px-5 py-3 font-bold text-primary transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <UserPlus className="h-4 w-4" /> Nuevo Comprador
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-success/10 px-4 py-3 text-xs text-success">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>
                  Documento verificado: <b>{selectedBuyer.doc.length === 8 ? "DNI" : "RUC"} {selectedBuyer.doc}</b>
                  {selectedBuyer.file ? ` · Archivo adjunto (${selectedBuyer.file})` : ""}
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <OrdersTable orders={orders} setOrders={setOrders} upd={upd} showErrors={showErrors} total={total} missing={missing} />
        )}

        {step === 2 && (
          <div className="space-y-4">
            {missing.length > 0 && <DraftAlert count={missing.length} />}
            <div className="mx-auto max-w-md overflow-hidden rounded-2xl border bg-card">
              <div className="bg-brand p-5 text-primary-foreground">
                <div className="flex items-center justify-between text-xs uppercase tracking-widest opacity-80"><span>Miami</span><span>✈</span><span>Lima</span></div>
                <p className="mt-2 font-mono text-2xl font-bold">{nextPreguiaId(app)}</p>
                <span className={cn("mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold", missing.length ? "bg-accent text-accent-foreground" : "bg-success text-success-foreground")}>
                  {missing.length ? "Se guardará como Borrador" : "Lista para procesar"}
                </span>
              </div>
              <div className="ticket-edge h-5 bg-muted" />
              <dl className="space-y-3 p-5 text-sm">
                <Row k="Comprador / Importador" v={selectedBuyer.name} />
                <Row k={selectedBuyer.doc.length === 8 ? "DNI" : "RUC"} v={selectedBuyer.doc} />
                <div className="border-t border-dashed pt-3">
                  {orders.map((o, i) => (
                    <div key={o.id} className="mb-4">
                      <div className="flex justify-between font-semibold"><span>{i + 1}. {o.store}</span><span>${orderUsd(o).toFixed(2)}</span></div>
                      <p className="text-muted-foreground">{o.content}</p>
                      {o.currency !== "USD" && (
                        <p className="text-xs text-muted-foreground">
                          {o.currency} {parseFloat(o.amount).toLocaleString("es-PE")} → cobrado USD {orderUsd(o).toFixed(2)}
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap gap-1">{o.trackings.map((t) => <Chip key={t} t={t} known={isKnownTracking(t, app.stock)} />)}</div>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><FileText className="h-3.5 w-3.5" /> {o.invoice}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-dashed pt-3 text-base font-extrabold"><span>Valor declarado (USD)</span><span>${total.toFixed(2)}</span></div>
              </dl>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-between gap-3">
        <button onClick={() => { setShowErrors(false); setStep(step - 1); }} disabled={step === 0} className="inline-flex items-center gap-1 rounded-xl border bg-card px-5 py-3 font-semibold disabled:invisible">
          <ChevronLeft className="h-4 w-4" /> Atrás
        </button>
        {step < 2 ? (
          <button onClick={next} className={cn("inline-flex items-center gap-1 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lift", !canNext && "opacity-60 shadow-none")}>
            Continuar <ChevronRight className="h-4 w-4" />
          </button>
        ) : missing.length ? (
          <button onClick={submit} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lift">
            <PencilLine className="h-4 w-4" /> Guardar como Borrador
          </button>
        ) : (
          <button onClick={submit} className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-accent-foreground shadow-lift">
            <Send className="h-4 w-4" /> Enviar Embarque a Miami
          </button>
        )}
      </div>

      {buyerModal && (
        <BuyerModal
          existing={app.buyers}
          onClose={() => setBuyerModal(false)}
          onSave={(b) => {
            actions.addBuyer(b);
            setBuyerDoc(b.doc);
            setBuyerModal(false);
            toast.success("Comprador registrado", { description: `${b.name} quedó seleccionado.` });
          }}
        />
      )}
    </div>
  );
}

/* ---------- Step 2: spreadsheet-style orders ---------- */

function OrdersTable({ orders, setOrders, upd, showErrors, total, missing }: {
  orders: Order[]; setOrders: (o: Order[]) => void; upd: (id: number, p: Partial<Order>) => void;
  showErrors: boolean; total: number; missing: string[];
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2 xl:px-5 xl:pt-5">
        <div>
          <h2 className="font-bold">Órdenes de compra</h2>
          <p className="text-xs text-muted-foreground">
            Pega cada tracking y presiona Enter o “+” (un mismo tracking puede repetirse en varias órdenes). Prueba con <span className="font-mono">1Z999AA10123456784</span> (ya en Miami).
          </p>
        </div>
      </div>

      <div className="mt-4 xl:overflow-x-auto">
        <div className="xl:min-w-[1000px]">
          <div className={cn("hidden border-y bg-muted px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground xl:grid xl:gap-1", COLS)}>
            <span className="px-2.5">Tienda</span>
            <span className="px-2.5">Resumen del contenido</span>
            <span className="px-2.5">Moneda</span>
            <span className="px-2.5">Monto original</span>
            <span className="px-2.5">Monto real USD</span>
            <span className="px-2.5">Trackings</span>
            <span className="px-2.5">Factura</span>
            <span />
          </div>
          <div className="space-y-4 xl:space-y-0 xl:divide-y">
            {orders.map((o, idx) => (
              <OrderRow
                key={o.id}
                o={o}
                idx={idx}
                upd={upd}
                showErrors={showErrors}
                onRemove={orders.length > 1 ? () => setOrders(orders.filter((x) => x.id !== o.id)) : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="xl:px-5 xl:pb-5">
        <button
          type="button"
          onClick={() => setOrders([...orders, newOrder()])}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-semibold text-primary hover:bg-secondary"
        >
          <Plus className="h-4 w-4" /> Agregar otra orden
        </button>
        {missing.length > 0 && <div className="mt-4"><DraftAlert count={missing.length} /></div>}
        <div className="mt-4 flex justify-between rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground">
          <span>{orders.length} orden(es) · {orders.reduce((s, o) => s + o.trackings.length, 0)} tracking(s)</span>
          <span>Total USD: ${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ o, idx, upd, showErrors, onRemove }: {
  o: Order; idx: number; upd: (id: number, p: Partial<Order>) => void; showErrors: boolean; onRemove?: () => void;
}) {
  const { stock } = useApp();
  const [trk, setTrk] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const foreign = o.currency !== "USD";
  const err = (bad: boolean) => showErrors && bad && "border-destructive bg-destructive/5 xl:border-destructive";
  const approx = foreign && parseFloat(o.amount) > 0 ? (parseFloat(o.amount) * USD_RATE[o.currency]).toFixed(2) : null;

  const addTracking = () => {
    // Allow same tracking across different orders, only avoid duplicates inside the same order
    const list = splitTrackings(trk).filter((t, i, a) => a.indexOf(t) === i && !o.trackings.includes(t));
    if (!list.length) { setTrk(""); return; }
    upd(o.id, { trackings: [...o.trackings, ...list] });
    setTrk("");
    if (list.some((t) => !isKnownTracking(t, stock))) toast.warning(DRAFT_MSG);
  };

  return (
    <div className={cn("grid grid-cols-2 gap-3 rounded-2xl border p-4 xl:items-start xl:gap-1 xl:rounded-none xl:border-0 xl:px-3 xl:py-2.5 xl:hover:bg-muted/40", COLS)}>
      <div className="col-span-2 flex items-center justify-between xl:hidden">
        <p className="font-bold">Orden {idx + 1}</p>
        {onRemove && (
          <button type="button" onClick={onRemove} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Eliminar orden">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <Cell label="Tienda">
        <select className={cell} value={o.store} onChange={(e) => upd(o.id, { store: e.target.value })}>
          {STORES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Cell>
      <Cell label="Resumen del contenido" className="col-span-2 xl:col-span-1 max-xl:order-first max-xl:col-span-2 max-xl:mt-0">
        <input placeholder="Ej: 2 polos, 1 zapatilla" className={cn(cell, err(!o.content.trim()))} value={o.content} onChange={(e) => upd(o.id, { content: e.target.value })} />
      </Cell>
      <Cell label="Moneda">
        <select className={cn(cell, "font-semibold")} value={o.currency} onChange={(e) => upd(o.id, { currency: e.target.value as Currency, usd: "" })}>
          {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Cell>
      <Cell label="Monto original">
        <input type="number" min="0" placeholder="0.00" className={cn(cell, "tabular-nums", err(!(parseFloat(o.amount) > 0)))} value={o.amount} onChange={(e) => upd(o.id, { amount: e.target.value })} />
      </Cell>
      <Cell label="Monto real USD" hint={foreign ? "Lo cobrado en tu tarjeta" : undefined}>
        {foreign ? (
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground xl:left-2.5">$</span>
            <input
              type="number"
              min="0"
              placeholder={approx ? `≈ ${approx}` : "0.00"}
              title="Lo cobrado en tu tarjeta (obligatorio)"
              className={cn(cell, "pl-6 tabular-nums xl:pl-5 xl:border-accent/40 xl:bg-accent/5", err(!(parseFloat(o.usd) > 0)))}
              value={o.usd}
              onChange={(e) => upd(o.id, { usd: e.target.value })}
            />
          </div>
        ) : (
          <input disabled value={o.amount ? `$ ${o.amount}` : "—"} className={cn(cell, "cursor-not-allowed text-muted-foreground opacity-60")} aria-label="Igual al monto original" />
        )}
      </Cell>
      <Cell label="Trackings" className="col-span-2 xl:col-span-1">
        <div className={cn("rounded-lg border bg-background p-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30 xl:border-dashed", err(o.trackings.length === 0))}>
          {o.trackings.length > 0 && (
            <div className="mb-1.5 flex flex-wrap gap-1">
              {o.trackings.map((t) => (
                <Chip key={t} t={t} known={isKnownTracking(t, stock)} onRemove={() => upd(o.id, { trackings: o.trackings.filter((x) => x !== t) })} />
              ))}
            </div>
          )}
          <div className="flex items-center gap-1">
            <input
              value={trk}
              onChange={(e) => setTrk(e.target.value)}
              placeholder="Pega tracking…"
              aria-label={`Tracking orden ${idx + 1}`}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTracking(); } }}
              className="min-w-0 flex-1 bg-transparent px-1.5 py-1 font-mono text-xs outline-none"
            />
            <button
              type="button"
              onClick={addTracking}
              disabled={!trk.trim()}
              aria-label="Agregar tracking"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Cell>
      <Cell label="Factura" className="col-span-2 xl:col-span-1">
        <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upd(o.id, { invoice: f.name }); e.target.value = ""; }} />
        {o.invoice ? (
          <div className="flex items-center gap-1.5 rounded-lg bg-success/15 px-2.5 py-2 text-xs font-semibold text-success">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate" title={o.invoice}>{o.invoice}</span>
            <button type="button" onClick={() => upd(o.id, { invoice: null })} aria-label="Quitar factura" className="shrink-0 hover:text-destructive">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn("flex w-full items-center justify-center gap-1.5 rounded-lg border border-accent/50 bg-accent/10 px-2.5 py-2 text-xs font-bold text-accent hover:bg-accent hover:text-accent-foreground",
              showErrors && "border-destructive bg-destructive/10 text-destructive")}
          >
            <Paperclip className="h-3.5 w-3.5" /> Adjuntar Factura
          </button>
        )}
      </Cell>
      <div className="hidden xl:flex xl:justify-center xl:pt-1">
        {onRemove && (
          <button type="button" onClick={onRemove} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Eliminar orden">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function Cell({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("min-w-0", className)}>
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground xl:hidden">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-accent xl:px-2.5">{hint}</span>}
    </div>
  );
}

function Chip({ t, known, onRemove }: { t: string; known: boolean; onRemove?: () => void }) {
  return (
    <span
      title={known ? "Ya en almacén Miami" : "Aún no en lista"}
      className={cn("inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold", known ? "bg-success/15 text-success" : "bg-accent/15 text-accent")}
    >
      {known ? <PackageCheck className="h-3 w-3 shrink-0" /> : <Clock className="h-3 w-3 shrink-0" />}
      <span className="truncate">{t}</span>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Quitar ${t}`} className="shrink-0 opacity-70 hover:opacity-100">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

function DraftAlert({ count }: { count: number }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
      <div>
        <p className="font-bold text-foreground">{DRAFT_MSG}</p>
        <p className="text-muted-foreground">{count} tracking(s) aún no llegan al almacén Miami. La pre-guía no avanzará hasta que se verifiquen.</p>
      </div>
    </div>
  );
}

/* ---------- New buyer modal ---------- */

function BuyerModal({ existing, onClose, onSave }: { existing: Buyer[]; onClose: () => void; onSave: (b: Buyer) => void }) {
  const [doc, setDoc] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState<string | null>(null);
  const ruc = doc.length === 11;
  const dup = existing.some((b) => b.doc === doc);
  const ok = docOk(doc) && !dup && name.trim().length > 2 && !!file;

  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-primary"><UserPlus className="h-5 w-5" /></span>
          <div><h2 className="text-lg font-bold">Nuevo Comprador</h2><p className="text-sm text-muted-foreground">Registra a la persona o empresa que hizo la compra.</p></div>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
      </div>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Número de DNI o RUC</span>
          <input inputMode="numeric" maxLength={11} placeholder="8 dígitos (DNI) u 11 (RUC)" className={cn(field, "font-mono")} value={doc} onChange={(e) => setDoc(e.target.value.replace(/\D/g, ""))} />
          {dup && <span className="mt-1 block text-xs text-destructive">Este documento ya está registrado.</span>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{ruc ? "Razón social completa" : "Nombres y apellidos"}</span>
          <input placeholder={ruc ? "Ej: Importaciones del Sur S.A.C." : "Ej: Ana Torres Quispe"} className={field} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{ruc ? "Ficha RUC" : "Copia del DNI"} (PDF o imagen)</span>
          {file ? (
            <div className="flex items-center gap-2 rounded-xl bg-success/15 px-4 py-3 text-sm font-semibold text-success">
              <FileText className="h-4 w-4 shrink-0" /><span className="min-w-0 flex-1 truncate">{file}</span>
              <button type="button" onClick={() => setFile(null)} aria-label="Quitar archivo"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center text-sm hover:border-primary hover:bg-secondary">
              <Upload className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">Adjuntar {ruc ? "Ficha RUC" : "DNI"}</span>
              <span className="text-xs text-muted-foreground">Toca para elegir un archivo</span>
              <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} />
            </label>
          )}
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 rounded-xl border py-3 font-semibold">Cancelar</button>
        <button type="button" disabled={!ok} onClick={() => onSave({ doc, name: name.trim(), file })} className="flex-1 rounded-xl bg-success py-3 font-bold text-success-foreground disabled:opacity-40">Guardar comprador</button>
      </div>
    </Modal>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-foreground/40 p-0 backdrop-blur-sm md:place-items-center md:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-6 shadow-lift md:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ---------- Final screen ---------- */

function Done({ pg }: { pg: Preguia }) {
  const draft = pg.status === "Borrador";
  return (
    <div className="mx-auto max-w-md pt-10 text-center">
      <div className={cn("mx-auto grid h-20 w-20 place-items-center rounded-full", draft ? "bg-accent/15 text-accent" : "bg-success/15 text-success")}>
        {draft ? <PencilLine className="h-10 w-10" /> : <PartyPopper className="h-10 w-10" />}
      </div>
      <h1 className="mt-6 text-2xl font-extrabold">{draft ? "Pre-guía guardada como Borrador" : "¡Embarque enviado a Miami!"}</h1>
      <p className="mt-2 text-muted-foreground">
        Tu pre-guía <b className="font-mono text-foreground">{pg.id}</b>{" "}
        {draft
          ? "tiene trackings que aún no llegan al almacén Miami, por eso no avanza todavía. Se procesará cuando lleguen."
          : "fue registrada y procesada. Te avisaremos cuando salga hacia Lima."}
      </p>
      <span className={cn("mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold", draft ? "bg-muted text-muted-foreground" : "bg-accent/15 text-accent")}>
        {draft ? `Ganarás +${pointsFor(pg.totalUsd)} pts al procesarse` : `+${pointsFor(pg.totalUsd)} pts Club Calford`}
      </span>
      {draft && <p className="mt-4 text-sm text-muted-foreground">Usa <b className="text-foreground">🔄 Verificar Trackings</b> en Inicio para revisar si ya llegaron.</p>}
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Ir al inicio</Link>
        <Link to="/embarques" className="rounded-xl border px-5 py-3 font-semibold hover:bg-muted">Mis embarques</Link>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>;
}
