import { isNearTerm, projectedWindow, type ProjectedWindow } from "./timeline";
import type {
  AllocationMethod,
  Building,
  BuildingSystem,
  Unit,
  WithId,
} from "./types";

// Funding math per CLAUDE.md (derived — computed, never stored):
//   reserve draw   = est cost × reservePct
//   unit share     = (est cost × assessmentPct) × unit allocation
//   monthly        = unit share ÷ months until window start
//   reserve pace   = balance ÷ Σ(near-term reserve draws)  ← policy's reserve
//                    portion, never the full cost.

export interface UnitShare {
  unit: WithId<Unit>;
  allocationPct: number;
  share: number;
  perMonth: number;
}

export interface WindowFunding {
  system: WithId<BuildingSystem>;
  window: ProjectedWindow;
  estMid: number;
  reserveDraw: number;
  assessmentTotal: number;
  monthsUntilStart: number;
  unitShares: UnitShare[];
}

export function estCostMid(s: BuildingSystem): number | null {
  if (s.estCostLow == null || s.estCostHigh == null) return null;
  return (s.estCostLow + s.estCostHigh) / 2;
}

export function allocationPct(
  unit: Unit,
  method: AllocationMethod,
  unitCount: number,
): number {
  if (method === "equal") return 100 / unitCount;
  if (method === "custom") return unit.customAllocationPct ?? unit.ownershipPct;
  return unit.ownershipPct;
}

/** Funding breakdowns for documented systems whose window is within ~5 years. */
export function nearTermWindows(
  building: Building,
  systems: WithId<BuildingSystem>[],
  units: WithId<Unit>[],
  today: number,
): WindowFunding[] {
  const todayYear = Math.floor(today);
  const { reservePct, assessmentPct, allocationMethod } = building.fundingPolicy;
  const out: WindowFunding[] = [];

  for (const system of systems) {
    if (system.status !== "documented") continue;
    const window = projectedWindow(system);
    if (!window || !isNearTerm(window, todayYear)) continue;
    const estMid = estCostMid(system);
    if (estMid == null) continue;

    const assessmentTotal = (estMid * assessmentPct) / 100;
    // A window already open assesses as "starting now".
    const monthsUntilStart = Math.max(1, Math.round((window.startYear - today) * 12));

    out.push({
      system,
      window,
      estMid,
      reserveDraw: (estMid * reservePct) / 100,
      assessmentTotal,
      monthsUntilStart,
      unitShares: units.map((unit) => {
        const pct = allocationPct(unit, allocationMethod, units.length);
        const share = (assessmentTotal * pct) / 100;
        return { unit, allocationPct: pct, share, perMonth: share / monthsUntilStart };
      }),
    });
  }

  return out.sort((a, b) => a.window.startYear - b.window.startYear);
}

/** balance ÷ Σ(near-term reserve draws); null when nothing is coming due. */
export function reservePace(
  building: Building,
  windows: WindowFunding[],
): number | null {
  const totalDraw = windows.reduce((sum, w) => sum + w.reserveDraw, 0);
  if (totalDraw <= 0) return null;
  return building.reserves.balance / totalDraw;
}
