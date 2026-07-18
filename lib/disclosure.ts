import { disclosureNarrative, type DisclosureNarrative } from "./claude";
import { getBuilding, getDocuments, getEvents, getSystems, getUnits } from "./data";
import { nearTermWindows, reservePace, type WindowFunding } from "./funding";
import { todayFraction, windowLabel } from "./timeline";
import type {
  Building,
  BuildingDocument,
  BuildingEvent,
  BuildingSystem,
  Unit,
  WithId,
} from "./types";

export interface DisclosureData {
  building: Building;
  units: WithId<Unit>[];
  systems: WithId<BuildingSystem>[];
  documents: WithId<BuildingDocument>[];
  decisions: WithId<BuildingEvent>[];
  recentMoney: WithId<BuildingEvent>[]; // costed events, trailing 12 months
  twoYearWindows: WindowFunding[]; // anticipated capital expenditures window
  fiveYearWindows: WindowFunding[];
  pace: number | null;
  narrative: DisclosureNarrative;
  narrativeSource: "model" | "records";
  generatedAt: string;
}

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function fallbackNarrative(
  building: Building,
  twoYear: WindowFunding[],
  fiveYear: WindowFunding[],
  pace: number | null,
): DisclosureNarrative {
  const { reservePct, assessmentPct } = building.fundingPolicy;
  const capital =
    twoYear.length === 0
      ? "No capital expenditures are anticipated within the next two years based on the association's records of documented systems and typical lifespans."
      : twoYear
          .map(
            (w) =>
              `${w.system.name} work is projected for ${w.window.startYear}–${w.window.endYear} at an estimated ` +
              `${dollars.format(w.system.estCostLow ?? 0)}–${dollars.format(w.system.estCostHigh ?? 0)} ` +
              `(planning midpoint ${dollars.format(w.estMid)}). Under the association's funding policy, ` +
              `${reservePct}% (${dollars.format(w.reserveDraw)}) would come from reserves and ` +
              `${assessmentPct}% (${dollars.format(w.assessmentTotal)}) from a special assessment.`,
          )
          .join(" ");
  const reserves =
    `The association holds ${dollars.format(building.reserves.balance)} in reserves as of ${building.reserves.asOf}.` +
    (pace != null
      ? ` This covers ${Math.round(pace * 100)}% of the reserve share of capital windows projected within the next five years (${fiveYear
          .map((w) => `${w.system.name} ${windowLabel(w.window)}`)
          .join(", ")}).`
      : " No capital windows are projected within the next five years.");
  return { capital, reserves };
}

export async function buildDisclosureData(): Promise<DisclosureData | null> {
  const [building, units, systems, events, documents] = await Promise.all([
    getBuilding(),
    getUnits(),
    getSystems(),
    getEvents(),
    getDocuments(),
  ]);
  if (!building) return null;

  const today = todayFraction();
  const todayYear = Math.floor(today);
  const fiveYearWindows = nearTermWindows(building, systems, units, today);
  const twoYearWindows = fiveYearWindows.filter(
    (w) => w.window.startYear <= todayYear + 2,
  );
  const pace = reservePace(building, fiveYearWindows);

  const decisions = events.filter((e) => e.type === "decision");
  const yearAgo = new Date(Date.now() - 365 * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);
  const recentMoney = events.filter((e) => e.cost != null && e.date >= yearAgo);

  const modelNarrative = await disclosureNarrative({
    address: building.address,
    fundingPolicy: building.fundingPolicy,
    reserves: building.reserves,
    anticipatedWindows: twoYearWindows.map((w) => ({
      system: w.system.name,
      window: `${w.window.startYear}–${w.window.endYear}`,
      estCostLow: w.system.estCostLow,
      estCostHigh: w.system.estCostHigh,
      planningMidpoint: w.estMid,
      fromReserves: w.reserveDraw,
      specialAssessment: w.assessmentTotal,
    })),
    fiveYearWindows: fiveYearWindows.map((w) => ({
      system: w.system.name,
      window: `${w.window.startYear}–${w.window.endYear}`,
      reserveShare: w.reserveDraw,
    })),
    reservePacePct: pace != null ? Math.round(pace * 100) : null,
    approvedDecisions: decisions.map((d) => ({
      date: d.date,
      summary: d.decision?.summary ?? d.title,
      vote: d.decision?.vote,
    })),
  });

  return {
    building,
    units,
    systems,
    documents,
    decisions,
    recentMoney,
    twoYearWindows,
    fiveYearWindows,
    pace,
    narrative:
      modelNarrative ??
      fallbackNarrative(building, twoYearWindows, fiveYearWindows, pace),
    narrativeSource: modelNarrative ? "model" : "records",
    generatedAt: new Date().toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    }),
  };
}

/** Everything the association hasn't confirmed — one graceful page, never silence. */
export function pendingItems(data: DisclosureData): string[] {
  const items: string[] = [];
  if (!data.building.pin) items.push("Parcel PIN — not on file");
  for (const s of data.systems) {
    if (s.status === "unknown") {
      items.push(`${s.name} — no installation or work record`);
    }
  }
  for (const category of ["declaration", "bylaws", "rules"] as const) {
    if (!data.documents.some((d) => d.category === category)) {
      items.push(`${category[0].toUpperCase()}${category.slice(1)} document — not on file`);
    }
  }
  if (!data.documents.some((d) => d.category === "insurance")) {
    items.push("Certificate of insurance — not on file");
  }
  items.push("Complete receipts and disbursements ledger — not on file");
  items.push("Pending suits and judgments — none known to the association");
  return items;
}
