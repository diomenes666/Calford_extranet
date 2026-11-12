// Prototype-wide state shared by every page, saved in the browser so the demo survives reloads.
import { useSyncExternalStore } from "react";
import { orderUsd, pointsFor, statusFor, verifyDrafts, type Order, type Preguia, type StockItem } from "./calford";

export type Buyer = { doc: string; name: string; file: string | null; titular?: boolean };
export type GiftIcon = "gift" | "truck" | "card" | "percent" | "plane" | "bag" | "star";
export type Gift = { milestone: number; title: string; detail: string; icon: GiftIcon };

export type AppState = {
  points: number;
  buyers: Buyer[];
  stock: StockItem[];
  incoming: StockItem[]; // packages on their way to the Miami warehouse (picked up by the daily check)
  preguias: Preguia[];
  nextNumber: number;
  gifts: Gift[];
  giftsMonth: string;
  redeemed: string[]; // `${cycle}-${milestone}`
};

const o = (p: Partial<Order>): Order => ({ id: Math.random(), store: "Amazon", content: "", currency: "USD", amount: "0", usd: "", trackings: [], invoice: "factura.pdf", ...p });

const initial = (): AppState => ({
  points: 350,
  buyers: [
    { doc: "45678912", name: "María Rodríguez Paz", file: "dni-maria.pdf", titular: true },
    { doc: "47788123", name: "Carlos Rodríguez Paz", file: "dni-carlos.pdf" },
    { doc: "20512345678", name: "Comercial Andina S.A.C.", file: "ficha-ruc.pdf" },
  ],
  stock: [
    { tracking: "1Z999AA10123456784", carrier: "UPS", store: "Amazon", description: "Caja mediana", weightKg: 2.3, received: "10 Nov 2026" },
    { tracking: "TBA304958372000", carrier: "Amazon Logistics", store: "Amazon", description: "Sobre acolchado", weightKg: 0.4, received: "11 Nov 2026" },
    { tracking: "9400111899223344556677", carrier: "USPS", store: "eBay", description: "Caja pequeña", weightKg: 1.1, received: "11 Nov 2026" },
    { tracking: "773849201945", carrier: "FedEx", store: "Walmart", description: "Caja grande", weightKg: 6.8, received: "12 Nov 2026" },
    { tracking: "1Z84F7W90398765432", carrier: "UPS", store: "Best Buy", description: "Caja mediana", weightKg: 3.0, received: "12 Nov 2026" },
  ],
  incoming: [
    { tracking: "TBA399887766000", carrier: "Amazon Logistics", store: "Amazon", description: "Caja pequeña", weightKg: 0.9, received: "13 Nov 2026" },
  ],
  preguias: [
    { id: "PG-2026-0088", date: "11 Nov 2026", buyer: "María Rodríguez Paz", importer: "María Rodríguez Paz · 45678912", status: "Borrador", totalUsd: 129,
      orders: [o({ store: "Amazon", content: "Zapatillas Nike Pegasus", amount: "129", trackings: ["TBA399887766000"] })] },
    { id: "PG-2026-0087", date: "06 Nov 2026", buyer: "María Rodríguez Paz", importer: "María Rodríguez Paz · 45678912", status: "Procesado", totalUsd: 312,
      orders: [o({ store: "Walmart", content: "Ropa y calzado", amount: "312", trackings: ["773849201945"] })] },
    { id: "PG-2026-0084", date: "04 Nov 2026", buyer: "Carlos Rodríguez Paz", importer: "Comercial Andina S.A.C. · 20512345678", status: "Procesado", totalUsd: 245,
      orders: [o({ store: "eBay", content: "Repuestos cámara", amount: "245", trackings: ["9400111899223344556677"] })] },
  ],
  nextNumber: 89,
  giftsMonth: "Noviembre 2026",
  gifts: [
    { milestone: 250, title: "Delivery express gratis", detail: "En Lima Metropolitana", icon: "truck" },
    { milestone: 500, title: "Gift Card Amazon $10", detail: "Código enviado a tu correo", icon: "card" },
    { milestone: 750, title: "15% dscto. en flete", detail: "En tu próximo embarque", icon: "percent" },
    { milestone: 1000, title: "Envío gratis hasta 5 kg", detail: "Miami → Lima", icon: "plane" },
  ],
  redeemed: [],
});

const KEY = "calford-demo-v2";
let state: AppState = initial();
const SERVER = state;
const listeners = new Set<() => void>();

function set(next: AppState) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function hydrateStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { state = { ...initial(), ...JSON.parse(raw) }; listeners.forEach((l) => l()); }
  } catch { /* ignore */ }
}

export function useApp() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => state,
    () => SERVER,
  );
}

export const getApp = () => state;

export const actions = {
  addBuyer(b: Buyer) { set({ ...state, buyers: [...state.buyers, b] }); },

  /** Saves a pre-guía. Status depends on whether every tracking is already in Calford's list. */
  savePreguia(data: Omit<Preguia, "id" | "date" | "status" | "totalUsd">) {
    const id = `PG-2026-${String(state.nextNumber).padStart(4, "0")}`;
    const totalUsd = data.orders.reduce((s, x) => s + orderUsd(x), 0);
    const status = statusFor(data.orders, state.stock);
    const date = new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
    const pg: Preguia = { ...data, id, date, totalUsd, status };
    // Simulation: unknown trackings are packages still on their way to the warehouse.
    const known = new Set([...state.stock, ...state.incoming].map((s) => s.tracking));
    const newIncoming = data.orders.flatMap((x) => x.trackings.filter((t) => !known.has(t)).map((t) => ({
      tracking: t, carrier: "—", store: x.store, description: x.content, weightKg: 1.5, received: date,
    })));
    set({
      ...state,
      preguias: [pg, ...state.preguias],
      nextNumber: state.nextNumber + 1,
      incoming: [...state.incoming, ...newIncoming],
      points: state.points + (status === "Procesado" ? pointsFor(totalUsd) : 0),
    });
    return pg;
  },

  /** Simulated daily service: packages arrive in Miami, then drafts are re-checked. */
  verifyTrackings() {
    const stock = [...state.stock, ...state.incoming];
    const { preguias, promoted } = verifyDrafts(state.preguias, stock);
    const earned = promoted.reduce((s, p) => s + pointsFor(p.totalUsd), 0);
    set({ ...state, stock, incoming: [], preguias, points: state.points + earned });
    return { promoted, earned };
  },

  updateGifts(gifts: Gift[], giftsMonth: string) { set({ ...state, gifts, giftsMonth }); },
  addPoints(n: number) { set({ ...state, points: Math.max(0, state.points + n) }); },
  redeem(key: string) { set({ ...state, redeemed: [...state.redeemed, key] }); },
  reset() { set(initial()); },
};

export const nextPreguiaId = (s: AppState) => `PG-2026-${String(s.nextNumber).padStart(4, "0")}`;
