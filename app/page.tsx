import Link from "next/link";
import CapitalTimeline from "@/components/capital-timeline";
import FundingPanel from "@/components/funding-panel";
import { getBuilding, getEvents, getSystems, getUnits } from "@/lib/data";
import { todayFraction } from "@/lib/timeline";

export const dynamic = "force-dynamic";

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function Home() {
  const [building, systems, events, units] = await Promise.all([
    getBuilding(),
    getSystems(),
    getEvents(),
    getUnits(),
  ]);

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
            className="rounded bg-ink px-3 py-1.5 text-[13px] font-medium text-paper"
          >
            Generate §22.1
          </a>
        </div>
      </div>
      <p className="mt-2 text-muted">
        Permit history, capital timeline, and §22.1 disclosures.
      </p>

      <section className="mt-10">
        <h2 className="mortar pb-2 font-display text-xl font-medium">
          Capital timeline
        </h2>
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
