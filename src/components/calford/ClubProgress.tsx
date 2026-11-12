import { cycleInfo, CYCLE } from "@/lib/calford";
import { useApp } from "@/lib/store";
import { GIFT_ICONS } from "./gift-icons";
import { cn } from "@/lib/utils";

/** Continuous 1000-pt bar with a gift milestone every 250 pts. */
export function ClubProgress({ compact = false }: { compact?: boolean }) {
  const { points, gifts } = useApp();
  const { progress } = cycleInfo(points);
  const pct = (progress / CYCLE) * 100;

  return (
    <div className={cn(compact ? "pt-2" : "pt-4")}>
      <div className="relative mx-3">
        <div className="h-3 overflow-hidden rounded-full bg-primary-foreground/20">
          <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </div>
        {gifts.map((g) => {
          const reached = progress >= g.milestone;
          const Icon = GIFT_ICONS[g.icon].icon;
          return (
            <div key={g.milestone} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${(g.milestone / CYCLE) * 100}%` }}>
              <span className={cn("grid place-items-center rounded-full border-2 transition-colors",
                compact ? "h-7 w-7" : "h-9 w-9",
                reached ? "border-primary-foreground bg-accent text-accent-foreground" : "border-primary-foreground/40 bg-primary-deep text-primary-foreground/70")}>
                <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
              </span>
            </div>
          );
        })}
      </div>
      <div className="relative mx-3 mt-6 h-4 text-[11px] font-semibold">
        <span className="absolute left-0 -translate-x-1/2 opacity-70">0</span>
        {gifts.map((g) => (
          <span key={g.milestone} className={cn("absolute -translate-x-1/2", g.milestone === CYCLE && "-translate-x-full")} style={{ left: `${(g.milestone / CYCLE) * 100}%` }}>
            {g.milestone}
          </span>
        ))}
      </div>
    </div>
  );
}
