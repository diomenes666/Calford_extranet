// Pure business rules for the Calford Import prototype (no React, easy to test).

export const CURRENCIES = ["USD", "EUR", "JPY", "GBP", "CNY", "CAD", "MXN"] as const;
export type Currency = (typeof CURRENCIES)[number];
/** Approximate USD per unit, only used to suggest a value to the user. */
export const USD_RATE: Record<Currency, number> = { USD: 1, EUR: 1.08, JPY: 0.0066, GBP: 1.27, CNY: 0.14, CAD: 0.73, MXN: 0.055 };

export type StockItem = { tracking: string; carrier: string; store: string; description: string; weightKg: number; received: string };
export type Order = { id: number; store: string; content: string; currency: Currency; amount: string; usd: string; trackings: string[]; invoice: string | null };
export type PreguiaStatus = "Procesado" | "Borrador";
export type Preguia = { id: string; date: string; buyer: string; importer: string; orders: Order[]; totalUsd: number; status: PreguiaStatus };

export const normTracking = (t: string) => t.trim().toUpperCase().replace(/\s+/g, "");

/** Splits pasted text (spaces, commas, new lines) into individual trackings. */
export const splitTrackings = (raw: string) => raw.split(/[\s,;]+/).map(normTracking).filter(Boolean);

export const isKnownTracking = (t: string, db: StockItem[]) => db.some((s) => s.tracking === normTracking(t));

/** USD value of an order: original amount if USD, otherwise the real amount charged in USD. */
export function orderUsd(o: Pick<Order, "currency" | "amount" | "usd">) {
  return (o.currency === "USD" ? parseFloat(o.amount) : parseFloat(o.usd)) || 0;
}

export function orderIsComplete(o: Order) {
  return (
    o.content.trim().length > 0 &&
    parseFloat(o.amount) > 0 &&
    (o.currency === "USD" || parseFloat(o.usd) > 0) &&
    o.trackings.length > 0 &&
    !!o.invoice
  );
}

export function unknownTrackings(orders: Order[], db: StockItem[]) {
  return orders.flatMap((o) => o.trackings).filter((t) => !isKnownTracking(t, db));
}

export function statusFor(orders: Order[], db: StockItem[]): PreguiaStatus {
  return unknownTrackings(orders, db).length > 0 ? "Borrador" : "Procesado";
}

/** Club Calford: 10 pts per USD 100 imported. */
export const pointsFor = (usd: number) => Math.floor(usd / 10);

export const CYCLE = 1000;
export const MILESTONES = [250, 500, 750, 1000] as const;

/** Points live in a continuous 1000-pt cycle; passing 1000 restarts the bar. */
export function cycleInfo(totalPoints: number) {
  const cycle = Math.floor(totalPoints / CYCLE) + 1;
  const progress = totalPoints % CYCLE;
  const next = MILESTONES.find((m) => m > progress) ?? CYCLE;
  return { cycle, progress, next, toNext: next - progress, reached: MILESTONES.filter((m) => m <= progress && m < CYCLE) };
}

/** Daily service: drafts whose trackings now all exist in the DB become "Procesado". */
export function verifyDrafts(preguias: Preguia[], db: StockItem[]) {
  const promoted: Preguia[] = [];
  const next = preguias.map((p) => {
    if (p.status === "Borrador" && statusFor(p.orders, db) === "Procesado") {
      const up = { ...p, status: "Procesado" as const };
      promoted.push(up);
      return up;
    }
    return p;
  });
  return { preguias: next, promoted };
}
