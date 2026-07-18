import type { BuildingSystem } from "./types";

// Derived timeline math (CLAUDE.md: compute in code, don't store).

export interface ProjectedWindow {
  startYear: number;
  endYear: number;
}

export function projectedWindow(s: BuildingSystem): ProjectedWindow | null {
  if (s.installYear == null || s.typicalLifeMin == null || s.typicalLifeMax == null) {
    return null;
  }
  return {
    startYear: s.installYear + s.typicalLifeMin,
    endYear: s.installYear + s.typicalLifeMax,
  };
}

/** Within ~5 years: the window rates stamp treatment (money/attention). */
export function isNearTerm(w: ProjectedWindow, todayYear: number, horizonYears = 5): boolean {
  return w.startYear <= todayYear + horizonYears;
}

/** Always a range — "’28–31" — never a single year. */
export function windowLabel(w: ProjectedWindow): string {
  return `’${String(w.startYear).slice(-2)}–${String(w.endYear).slice(-2)}`;
}

/** Label inside a documented bar: "Roof ’14". */
export function barLabel(name: string, installYear: number): string {
  return `${name} ’${String(installYear).slice(-2)}`;
}

/** "Permitted 2014 · modified bitumen · typical life 18–22 yrs" */
export function basisLine(s: BuildingSystem): string | null {
  if (s.installYear == null) return null;
  const parts = [
    s.installSource === "permit" ? `Permitted ${s.installYear}` : `Recorded ${s.installYear}`,
  ];
  if (s.material) parts.push(s.material);
  if (s.typicalLifeMin != null && s.typicalLifeMax != null) {
    parts.push(`typical life ${s.typicalLifeMin}–${s.typicalLifeMax} yrs`);
  }
  return parts.join(" · ");
}

/** Axis bounds: 5-year-aligned floor below the earliest install, a little
 *  headroom past the latest projected window. */
export function timelineRange(
  systems: BuildingSystem[],
  todayYear: number,
): { min: number; max: number } {
  const installs = systems
    .map((s) => s.installYear)
    .filter((y): y is number => y != null);
  const windowEnds = systems
    .map((s) => projectedWindow(s)?.endYear)
    .filter((y): y is number => y != null);

  const rawMin = installs.length ? Math.min(...installs) : todayYear - 20;
  const rawMax = Math.max(windowEnds.length ? Math.max(...windowEnds) : todayYear + 20, todayYear + 2);
  return { min: Math.floor((rawMin - 1) / 5) * 5, max: rawMax + 2 };
}
