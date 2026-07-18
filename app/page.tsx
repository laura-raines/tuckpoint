import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import CapitalTimeline from "@/components/capital-timeline";
import FundingPanel from "@/components/funding-panel";
import SiteHome from "@/components/site-home";
import {
  getBuilding,
  getDocuments,
  getEvents,
  getSystems,
  getUnits,
} from "@/lib/data";
import { nearTermWindows } from "@/lib/funding";
import { isNearTerm, projectedWindow, todayFraction, windowLabel } from "@/lib/timeline";
import type { Building, BuildingSystem, Unit, WithId } from "@/lib/types";

export const dynamic = "force-dynamic";

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** The Big Reveal line after onboarding: reserves + the 3-year forecast. */
function revealSummary(
  building: Building,
  systems: WithId<BuildingSystem>[],
  units: WithId<Unit>[],
): string {
  const today = todayFraction();
  const opening = nearTermWindows(building, systems, units, today).filter(
    (w) => w.window.startYear <= Math.floor(today) + 3,
  );
  const reserves =
    building.reserves.balance > 0
      ? `Money set aside today: ${dollars.format(building.reserves.balance)}.`
      : "Nothing set aside for big repairs yet.";
  if (opening.length === 0) {
    return `${reserves} Nothing is projected to come due in the next three years.`;
  }
  const total = opening.reduce((sum, w) => sum + w.estMid, 0);
  const names = opening.map((w) => w.system.name.toLowerCase()).join(" and ");
  const by = Math.max(...opening.map((w) => w.window.endYear));
  return `${reserves} Based on typical lifespans, anticipate about ${dollars.format(total)} of ${names} work by ${by}.`;
}

/** One sentence on the 3-year horizon, shown above the timeline. */
function whatsNext(systems: WithId<BuildingSystem>[], today: number): string {
  const todayYear = Math.floor(today);
  const opening = systems
    .filter((s) => s.status === "documented")
    .map((s) => ({ system: s, window: projectedWindow(s) }))
    .filter(
      (x): x is { system: WithId<BuildingSystem>; window: NonNullable<ReturnType<typeof projectedWindow>> } =>
        x.window != null && isNearTerm(x.window, todayYear, 3),
    )
    .sort((a, b) => a.window.startYear - b.window.startYear);
  const gaps = systems.filter((s) => s.status === "unknown");

  const parts: string[] = [];
  if (opening.length === 0) {
    parts.push("No projected windows open within three years.");
  } else {
    for (const { system, window } of opening) {
      const cost =
        system.estCostLow != null && system.estCostHigh != null
          ? `, est ${dollars.format(system.estCostLow)}–${dollars.format(system.estCostHigh)}`
          : "";
      parts.push(`${system.name}'s window opens ${windowLabel(window)}${cost}.`);
    }
  }
  if (gaps.length > 0) {
    parts.push(
      `${gaps.map((g) => g.name).join(", ")} ${gaps.length === 1 ? "has" : "have"} no record yet.`,
    );
  }
  return parts.join(" ");
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  if (!(await cookies()).has("steward")) return <SiteHome />;

  const [{ welcome }, building, systems, events, units, documents] =
    await Promise.all([
      searchParams,
      getBuilding(),
      getSystems(),
      getEvents(),
      getUnits(),
      getDocuments(),
    ]);
  // Never a blank dashboard: an empty record goes to onboarding.
  if (!building) redirect("/setup");

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-[28px] font-semibold">
          The building&rsquo;s record
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/setup"
            className="rounded border border-ink px-3 py-1.5 text-[13px] font-medium"
          >
            Set up building
          </Link>
          <a
            href="/api/disclosure"
            target="_blank"
            className="flex flex-col items-center rounded bg-ink px-3 py-1.5 text-paper"
          >
            <span className="text-[13px] font-medium leading-tight">
              Generate Seller&rsquo;s Packet
            </span>
            <span className="text-[10px] leading-tight text-ink-faint">
              §22.1 disclosure statement
            </span>
          </a>
        </div>
      </div>
      <p className="mt-2 text-muted">
        Permit history, capital timeline, and the seller&rsquo;s packet — all
        generated from the building&rsquo;s live record.
      </p>

      {welcome === "1" && systems.length > 0 && (
        <div className="mt-6 rounded-md border border-line bg-card p-4">
          <p className="label-caps text-muted">The record is live</p>
          <p className="mt-1">{revealSummary(building, systems, units)}</p>
        </div>
      )}

      <section className="mt-10">
        <div className="mortar flex items-baseline justify-between pb-2">
          <h2 className="font-display text-xl font-medium">Documents</h2>
          <Link href="/documents" className="text-[13px] text-muted underline">
            Manage vault
          </Link>
        </div>
        <div className="mt-4 rounded-md border border-line bg-card p-4">
          {documents.length === 0 ? (
            <p className="text-muted">
              No documents on file yet.{" "}
              <Link href="/documents" className="underline">
                Add the declaration, insurance, and minutes
              </Link>{" "}
              — they feed the Seller&rsquo;s Packet.
            </p>
          ) : (
            <p>
              <span className="data-mono">{documents.length}</span> on file:{" "}
              {[...new Set(documents.map((d) => d.category))].join(", ")}.{" "}
              <Link href="/documents" className="underline">
                Manage vault
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mortar pb-2 font-display text-xl font-medium">
          Capital timeline
        </h2>
        {systems.length > 0 && (
          <p className="mt-3">
            <span className="label-caps mr-2 text-muted">What&rsquo;s next</span>
            {whatsNext(systems, todayFraction())}
          </p>
        )}
        {systems.some((s) => s.status === "unknown") && (
          <div className="mt-4 flex items-center justify-between gap-4 rounded-md border border-line bg-card p-4">
            <div>
              <p className="label-caps text-muted">Finish the record</p>
              <p className="mt-1">
                {systems
                  .filter((s) => s.status === "unknown")
                  .map((s) => s.name)
                  .join(", ")}{" "}
                {systems.filter((s) => s.status === "unknown").length === 1
                  ? "has"
                  : "have"}{" "}
                no record yet. Add what you remember — a year is enough.
              </p>
            </div>
            <Link
              href="/setup/inventory"
              className="shrink-0 rounded border border-ink px-3 py-1.5 text-[13px] font-medium"
            >
              Add last work
            </Link>
          </div>
        )}
        {systems.length === 0 ? (
          <div className="mt-4 rounded-md border border-line bg-card p-4">
            <p className="label-caps text-muted">No records yet</p>
            <p className="mt-2">
              Connect Firestore credentials and run <span className="data-mono">npm run seed</span> to
              load the demo building.
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <CapitalTimeline systems={systems} today={todayFraction()} />
          </div>
        )}
      </section>

      {building && units.length > 0 && systems.length > 0 && (
        <section className="mt-10">
          <h2 className="mortar pb-2 font-display text-xl font-medium">Funding</h2>
          <div className="mt-4">
            <FundingPanel
              building={building}
              systems={systems}
              units={units}
              today={todayFraction()}
            />
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mortar pb-2 font-display text-xl font-medium">Record</h2>
        {events.length === 0 ? (
          <div className="mt-4 rounded-md border border-line bg-card p-4">
            <p className="text-muted">Nothing on file.</p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-md border border-line bg-card">
            {events.map((event) => (
              <li key={event.id} className="flex items-baseline gap-4 p-4">
                <span className="data-mono shrink-0 text-muted">{event.date}</span>
                <span className="flex-1">
                  {event.title}
                  {event.decision && (
                    <span className="ml-2 rounded bg-filed-bg px-1.5 py-0.5 text-[12px] text-filed">
                      filed · voted {event.decision.vote}
                    </span>
                  )}
                </span>
                {event.cost != null && (
                  <span className="data-mono shrink-0">{dollars.format(event.cost)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
