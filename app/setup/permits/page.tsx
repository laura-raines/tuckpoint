import Link from "next/link";
import { redirect } from "next/navigation";
import { getBuilding } from "@/lib/data";
import {
  areaMasonryStat,
  communityAreaOf,
  fetchPermits,
  permitTitle,
  permitYear,
  systemForPermit,
  type AreaMasonryStat,
  type SocrataPermit,
} from "@/lib/socrata";
import { confirmPermits } from "../actions";

export const dynamic = "force-dynamic";

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function SetupPermitsPage() {
  const building = await getBuilding();
  if (!building) redirect("/setup");

  let permits: SocrataPermit[] | null = null;
  let stat: AreaMasonryStat | null = null;
  try {
    permits = (
      await fetchPermits(building.streetNumber, building.streetName)
    ).filter((p) => p.permit_ != null);
    const area = communityAreaOf(permits);
    if (area) stat = await areaMasonryStat(area);
  } catch {
    permits = null;
  }

  // "The city already knew this building" — latest year per matched system.
  const found = new Map<string, number>();
  for (const p of permits ?? []) {
    const system = systemForPermit(p);
    const year = permitYear(p);
    if (system && year != null) {
      found.set(system, Math.max(found.get(system) ?? 0, year));
    }
  }
  const foundNames = [...found.entries()].map(
    ([system, year]) => `${system} ’${String(year).slice(-2)}`,
  );
  const unmatchedCount = (permits?.length ?? 0) - found.size;

  return (
    <div className="max-w-3xl">
      <p className="label-caps text-muted">Step 3 of 4 · city records</p>
      <h1 className="mt-1 font-display text-[28px] font-semibold">
        Permits on file with the city
      </h1>
      <p className="mt-2 text-muted">
        <span className="data-mono">{building.address}</span> — records from
        Chicago&rsquo;s building permit data. Nothing lands in the
        building&rsquo;s record until you confirm it.
      </p>

      {permits != null && permits.length > 0 && (
        <p className="mt-4">
          The city already knew this building
          {foundNames.length > 0 && (
            <>
              {" — "}
              <span className="data-mono">{foundNames.join(" · ")}</span>
            </>
          )}
          {unmatchedCount > 0 &&
            `${foundNames.length > 0 ? ", plus" : " —"} ${unmatchedCount} more permit${unmatchedCount === 1 ? "" : "s"}`}
          . Confirm below and the timeline builds itself.
        </p>
      )}

      {permits === null && (
        <div className="mt-6 rounded-md border border-line bg-card p-4">
          <p className="label-caps text-muted">City service unavailable</p>
          <p className="mt-2">
            The city&rsquo;s permit service didn&rsquo;t respond. The address is
            saved — importing can run again once the service is back.
          </p>
          <p className="mt-1">
            <Link href="/setup/permits" className="underline">
              Try again
            </Link>
          </p>
        </div>
      )}

      {permits?.length === 0 && (
        <div className="mt-6 rounded-md border border-line bg-card p-4">
          <p>
            No permits on file for{" "}
            <span className="data-mono">{building.address}</span>. Work can be
            added to the record by hand.
          </p>
        </div>
      )}

      <form action={confirmPermits} className="mt-6">
        {permits != null && permits.length > 0 && (
          <ul className="divide-y divide-line rounded-md border border-line bg-card">
            {permits.map((permit) => {
              const system = systemForPermit(permit);
              const cost = Number(permit.reported_cost);
              return (
                <li key={permit.permit_} className="flex items-baseline gap-3 p-3">
                  <input
                    type="checkbox"
                    name="permit"
                    value={permit.permit_}
                    defaultChecked
                    className="relative top-0.5 size-4 shrink-0 accent-[#3b2e25]"
                  />
                  <span className="data-mono shrink-0 text-muted">
                    {permit.issue_date?.slice(0, 10) ?? "date unknown"}
                  </span>
                  <span className="min-w-0 flex-1">
                    {permitTitle(permit)}
                    {system && (
                      <span className="label-caps ml-2 rounded border border-line px-1.5 py-0.5 text-muted">
                        {system}
                      </span>
                    )}
                  </span>
                  {Number.isFinite(cost) && cost > 0 && (
                    <span className="data-mono shrink-0">
                      {dollars.format(cost)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {stat && (
          <p className="mt-3 text-[13px] text-muted">
            For context: recent masonry permits on 2–4 unit buildings in this
            part of the city averaged{" "}
            <span className="data-mono">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(stat.avgCost)}
            </span>{" "}
            across <span className="data-mono">{stat.count}</span> permits since
            2015, per city records.
          </p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            className="rounded bg-ink px-4 py-2 text-[14px] font-medium text-paper"
          >
            {permits != null && permits.length > 0
              ? "Confirm records"
              : "Continue to timeline"}
          </button>
          <Link href="/setup/units" className="text-[14px] text-muted underline">
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}
