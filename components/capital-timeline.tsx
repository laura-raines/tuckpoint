import Link from "next/link";
import {
  barLabel,
  basisLine,
  isNearTerm,
  projectedWindow,
  timelineRange,
  windowLabel,
} from "@/lib/timeline";
import type { BuildingSystem, WithId } from "@/lib/types";

const ROW_ORDER = ["roof", "masonry", "porch", "boiler", "water heater"];

function rowOrder(s: BuildingSystem): number {
  const i = ROW_ORDER.indexOf(s.name.toLowerCase());
  return i === -1 ? ROW_ORDER.length : i;
}

export default function CapitalTimeline({
  systems,
  today,
}: {
  systems: WithId<BuildingSystem>[];
  today: number; // fractional year, e.g. 2026.54
}) {
  const todayYear = Math.floor(today);
  const range = timelineRange(systems, todayYear);
  const pct = (year: number) => ((year - range.min) / (range.max - range.min)) * 100;

  const ordered = [...systems].sort(
    (a, b) => rowOrder(a) - rowOrder(b) || a.name.localeCompare(b.name),
  );

  const ticks: number[] = [];
  for (let y = Math.ceil(range.min / 5) * 5; y <= range.max; y += 5) ticks.push(y);

  return (
    <div className="rounded-md border border-line bg-card p-4">
      <div className="flex">
        {/* row labels — structure mirrors the axis + tracks stack exactly */}
        <div className="w-[90px] shrink-0 pr-3">
          <div className="h-5" aria-hidden />
          <div className="flex flex-col gap-3">
            {ordered.map((s) => (
              <div key={s.id} className="flex h-9 items-center text-[13px] font-medium">
                {s.name}
              </div>
            ))}
          </div>
        </div>

        {/* axis + tracks share one coordinate space */}
        <div className="min-w-0 flex-1">
          <div className="relative h-5">
            {ticks.map((y) => (
              <span
                key={y}
                className="data-mono absolute top-0 -translate-x-1/2 text-[11px] text-muted"
                style={{ left: `${pct(y)}%` }}
              >
                {y}
              </span>
            ))}
          </div>

          <div className="relative">
            {/* today */}
            <div
              className="absolute inset-y-0 z-10 w-[1.5px] bg-stamp"
              style={{ left: `${pct(today)}%` }}
              aria-hidden
            />

            <div className="flex flex-col gap-3">
              {ordered.map((s) => {
                const window = s.status === "unknown" ? null : projectedWindow(s);
                const nearTerm = window != null && isNearTerm(window, todayYear);
                const basis = basisLine(s);
                // Documented life: ink for recent work, ink-soft for older.
                const recent = s.installYear != null && s.installYear >= todayYear - 15;

                return (
                  <div key={s.id} className="relative h-9 rounded-[3px] bg-track">
                    {s.status === "unknown" ? (
                      <div className="hatch absolute inset-0 flex items-center rounded-[3px] px-2.5">
                        <Link
                          href="/setup/inventory"
                          className="text-[12px] text-muted underline"
                        >
                          no permit record — add date
                        </Link>
                      </div>
                    ) : (
                      s.installYear != null && (
                        <div
                          className={`absolute inset-y-0 flex items-center overflow-hidden rounded-[3px] px-2 ${recent ? "bg-ink" : "bg-ink-soft"}`}
                          style={{
                            left: `${pct(s.installYear)}%`,
                            width: `${pct(today) - pct(s.installYear)}%`,
                          }}
                        >
                          <span className="data-mono whitespace-nowrap text-[12px] text-ink-faint">
                            {barLabel(s.name, s.installYear)}
                          </span>
                        </div>
                      )
                    )}

                    {window && (
                      <div
                        className={`group absolute inset-y-0 flex items-center justify-center rounded-[3px] border-[1.5px] border-dashed ${
                          nearTerm ? "border-stamp bg-stamp-bg" : "border-ink"
                        }`}
                        style={{
                          left: `${pct(window.startYear)}%`,
                          width: `${pct(window.endYear) - pct(window.startYear)}%`,
                        }}
                      >
                        <span
                          className={`data-mono whitespace-nowrap text-[12px] ${nearTerm ? "text-stamp" : "text-muted"}`}
                        >
                          {windowLabel(window)}
                        </span>
                        {basis && (
                          <span
                            className={`pointer-events-none absolute bottom-full z-20 mb-1.5 hidden whitespace-nowrap rounded border border-line bg-card px-2.5 py-1.5 text-[12px] group-hover:block ${
                              pct(window.startYear) > 55 ? "right-0" : "left-0"
                            }`}
                          >
                            {basis}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[12px] text-muted">
        A projection from public records and typical lifespans — not an inspection.
      </p>
    </div>
  );
}
