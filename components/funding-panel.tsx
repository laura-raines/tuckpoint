import Link from "next/link";
import { nearTermWindows, reservePace } from "@/lib/funding";
import { windowLabel } from "@/lib/timeline";
import type { Building, BuildingSystem, Unit, WithId } from "@/lib/types";

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const METHOD_LABEL: Record<string, string> = {
  ownership: "split by ownership share",
  equal: "split equally",
  custom: "custom split",
};

export default function FundingPanel({
  building,
  systems,
  units,
  today,
}: {
  building: Building;
  systems: WithId<BuildingSystem>[];
  units: WithId<Unit>[];
  today: number;
}) {
  const windows = nearTermWindows(building, systems, units, today);
  const pace = reservePace(building, windows);
  const { reservePct, assessmentPct, allocationMethod } = building.fundingPolicy;

  return (
    <div className="rounded-md border border-line bg-card p-4">
      {windows.length === 0 ? (
        <p>No projected windows in the next five years.</p>
      ) : (
        windows.map((w) => (
          <div key={w.system.id} className="mb-5 last:mb-0">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-base font-medium">
                {w.system.name} — projected{" "}
                <span className="data-mono">{windowLabel(w.window)}</span>
              </h3>
              <span className="data-mono text-muted">
                est {dollars.format(w.system.estCostLow ?? 0)}–
                {dollars.format(w.system.estCostHigh ?? 0)} · planning at{" "}
                {dollars.format(w.estMid)}
              </span>
            </div>

            <p className="mt-1.5 text-muted">
              {reservePct}% from money set aside ({dollars.format(w.reserveDraw)}
              ) · {assessmentPct}% assessed to units (
              {dollars.format(w.assessmentTotal)}), {METHOD_LABEL[allocationMethod]}.
            </p>

            <table className="mt-3 w-full">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="label-caps pb-1.5 font-medium text-muted">Unit</th>
                  <th className="label-caps pb-1.5 text-right font-medium text-muted">
                    Share of assessment
                  </th>
                  <th className="label-caps pb-1.5 text-right font-medium text-muted">
                    Set-aside per month
                  </th>
                </tr>
              </thead>
              <tbody>
                {w.unitShares.map(({ unit, allocationPct, share, perMonth }) => (
                  <tr key={unit.id} className="border-b border-line last:border-b-0">
                    <td className="py-1.5">
                      {unit.label}
                      {unit.ownerName && (
                        <span className="ml-2 text-muted">{unit.ownerName}</span>
                      )}
                      <span className="data-mono ml-2 text-muted">
                        {Math.round(allocationPct * 10) / 10}%
                      </span>
                    </td>
                    <td className="data-mono py-1.5 text-right text-stamp">
                      {dollars.format(Math.round(share))}
                    </td>
                    <td className="data-mono py-1.5 text-right text-stamp">
                      ≈ {dollars.format(Math.round(perMonth))}/mo
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
        <p className="text-muted">
          Money set aside for big repairs:{" "}
          <span className="data-mono">{dollars.format(building.reserves.balance)}</span>{" "}
          as of <span className="data-mono">{building.reserves.asOf}</span>
          {pace != null && (
            <span
              className={`ml-2 rounded px-1.5 py-0.5 text-[12px] ${
                pace >= 1 ? "bg-filed-bg text-filed" : "bg-stamp-bg text-stamp"
              }`}
            >
              covers {Math.round(pace * 100)}% of the reserve share due in 5 yrs
            </span>
          )}
        </p>
        <Link
          href="/funding"
          className="shrink-0 rounded border border-ink px-3 py-1.5 text-[13px] font-medium"
        >
          Set funding policy
        </Link>
      </div>

      {windows.length > 0 && (
        <p className="mt-3 text-[12px] text-muted">
          A projection from public records and typical lifespans — not an
          inspection.
        </p>
      )}
    </div>
  );
}
