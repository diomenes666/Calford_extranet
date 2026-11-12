import { describe, expect, it } from "vitest";
import { cycleInfo, orderIsComplete, orderUsd, pointsFor, statusFor, verifyDrafts, type Order, type Preguia, type StockItem } from "./calford";

const db: StockItem[] = [{ tracking: "1Z999AA10123456784", carrier: "UPS", store: "Amazon", description: "Caja", weightKg: 1, received: "" }];
const order = (p: Partial<Order> = {}): Order => ({ id: 1, store: "Amazon", content: "Polo", currency: "USD", amount: "100", usd: "", trackings: ["1Z999AA10123456784"], invoice: "f.pdf", ...p });

describe("Club Calford points", () => {
  it("gives 10 pts per USD 100", () => expect(pointsFor(250)).toBe(25));
  it("resets the bar after 1000 pts", () => {
    expect(cycleInfo(1150)).toMatchObject({ cycle: 2, progress: 150, next: 250 });
  });
  it("marks a milestone every 250 pts", () => expect(cycleInfo(520).reached).toEqual([250, 500]));
});

describe("Orders", () => {
  it("requires real USD amount when currency is not USD", () => {
    expect(orderIsComplete(order({ currency: "JPY", amount: "15000", usd: "" }))).toBe(false);
    expect(orderIsComplete(order({ currency: "JPY", amount: "15000", usd: "99" }))).toBe(true);
    expect(orderUsd(order({ currency: "JPY", amount: "15000", usd: "99" }))).toBe(99);
  });
  it("requires an invoice per order", () => expect(orderIsComplete(order({ invoice: null }))).toBe(false));
});

describe("Pre-guía status", () => {
  it("is Borrador when a tracking is not in the list", () => {
    expect(statusFor([order({ trackings: ["NOEXISTE123"] })], db)).toBe("Borrador");
    expect(statusFor([order()], db)).toBe("Procesado");
  });
  it("verification promotes drafts once trackings appear", () => {
    const pg: Preguia = { id: "PG-1", date: "", buyer: "", importer: "", orders: [order({ trackings: ["TBA1"] })], totalUsd: 100, status: "Borrador" };
    expect(verifyDrafts([pg], db).promoted).toHaveLength(0);
    const db2 = [...db, { ...db[0]!, tracking: "TBA1" }];
    expect(verifyDrafts([pg], db2).preguias[0]!.status).toBe("Procesado");
  });
});
