import { CreditCard, Gift, Percent, Plane, ShoppingBag, Star, Truck, type LucideIcon } from "lucide-react";
import type { GiftIcon } from "@/lib/store";

export const GIFT_ICONS: Record<GiftIcon, { icon: LucideIcon; label: string }> = {
  gift: { icon: Gift, label: "Regalo" },
  truck: { icon: Truck, label: "Delivery" },
  card: { icon: CreditCard, label: "Gift Card" },
  percent: { icon: Percent, label: "Descuento" },
  plane: { icon: Plane, label: "Envío" },
  bag: { icon: ShoppingBag, label: "Compras" },
  star: { icon: Star, label: "Especial" },
};
