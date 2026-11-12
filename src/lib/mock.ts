export const shipments = [
  { id: "PG-2026-0081", store: "Amazon", items: "Laptop Lenovo + mouse", value: 899, status: "En tránsito", date: "02 Nov 2026" },
  { id: "PG-2026-0084", store: "eBay", items: "Repuestos cámara", value: 245, status: "En tránsito", date: "04 Nov 2026" },
  { id: "PG-2026-0087", store: "Walmart", items: "Ropa y calzado", value: 312, status: "En almacén Miami", date: "06 Nov 2026" },
  { id: "PG-2026-0072", store: "Amazon", items: "Audífonos Sony", value: 189, status: "Entregado", date: "20 Oct 2026" },
  { id: "PG-2026-0065", store: "Best Buy", items: "Tablet Samsung", value: 420, status: "Entregado", date: "08 Oct 2026" },
];

export const statusStyle: Record<string, string> = {
  "En tránsito": "bg-secondary text-primary",
  "En almacén Miami": "bg-accent/15 text-accent",
  Entregado: "bg-success/15 text-success",
};
