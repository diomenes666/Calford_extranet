import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Package, MapPin, Truck, Gift, ChevronsLeft, Bell, Plane, ScanSearch } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { hydrateStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/embarques", label: "Mis Embarques", short: "Embarques", icon: Package },
  { to: "/consulta", label: "Consulta de Trackings", short: "Consulta", icon: ScanSearch },
  { to: "/seguimiento", label: "Seguimiento", short: "Rastreo", icon: MapPin },
  { to: "/delivery", label: "Programar Delivery", short: "Delivery", icon: Truck },
  { to: "/club", label: "Club Calford", short: "Club", icon: Gift },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { hydrateStore(); }, []);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col bg-brand text-primary-foreground transition-all duration-300 md:flex",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div className="flex h-20 items-center gap-3 px-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent shadow-lift">
            <Plane className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-lg font-extrabold tracking-tight">Calford</p>
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-70">Import · MIA → LIM</p>
            </div>
          )}
        </div>
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              title={n.label}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                active(n.to) ? "bg-primary-foreground text-primary shadow-card" : "opacity-80 hover:bg-primary-foreground/10 hover:opacity-100",
                collapsed && "justify-center",
              )}
            >
              <n.icon className="h-5 w-5 shrink-0" />
              {!collapsed && n.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="m-3 flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm opacity-70 hover:bg-primary-foreground/10 hover:opacity-100"
        >
          <ChevronsLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && "Contraer menú"}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-primary-foreground">
              <Plane className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-primary">Calford</span>
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">Extranet de clientes</p>
          <div className="flex items-center gap-3">
            <button className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-muted" aria-label="Notificaciones">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
            </button>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">MR</div>
          </div>
        </header>
        <main className="flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t bg-card pb-[env(safe-area-inset-bottom)] shadow-card md:hidden">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
              active(n.to) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span className={cn("grid h-8 w-11 place-items-center rounded-full", active(n.to) && "bg-secondary")}>
              <n.icon className="h-5 w-5" />
            </span>
            {"short" in n ? n.short : n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
