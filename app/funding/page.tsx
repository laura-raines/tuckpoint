import Link from "next/link";
import { redirect } from "next/navigation";
import { getBuilding, getUnits } from "@/lib/data";
import { saveFundingPolicy } from "./actions";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  pct: "Reserve share must be a whole number between 0 and 100.",
  method: "Pick how the assessment is split.",
  balance: "Reserve balance must be a number, 0 or more.",
  date: "The as-of date needs to be a full date.",
  custom: "Custom split must total 100%.",
};

export default async function FundingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, building, units] = await Promise.all([
    searchParams,
    getBuilding(),
    getUnits(),
  ]);
  if (!building) redirect("/setup");

  const ordered = [...units].sort(
    (a, b) => Number(a.id.split("-")[1]) - Number(b.id.split("-")[1]),
  );
  const { fundingPolicy, reserves } = building;

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-[28px] font-semibold">Funding policy</h1>
      <p className="mt-2 text-muted">
        How big repairs get paid for: a share from money set aside (the reserve
        fund), the rest split across units as a special assessment.
      </p>

      {error && ERRORS[error] && (
        <div className="mt-4 rounded border border-stamp bg-stamp-bg p-3 text-[13px] text-stamp">
          {ERRORS[error]}
        </div>
      )}

      <form action={saveFundingPolicy} className="mt-6 flex flex-col gap-6">
        <label className="flex flex-col gap-1.5">
          <span className="label-caps text-muted">From reserves</span>
          <div className="flex items-center gap-2">
            <input
              name="reservePct"
              type="number"
              min={0}
              max={100}
              required
              defaultValue={fundingPolicy.reservePct}
              className="data-mono w-24 rounded border border-line bg-card px-3 py-2 text-right outline-none focus:border-ink"
            />
            <span className="data-mono text-muted">%</span>
          </div>
          <span className="text-[13px] text-muted">
            Whatever reserves don&rsquo;t cover is assessed to units.
          </span>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="label-caps mb-1.5 text-muted">
            Split between units
          </legend>
          {(
            [
              ["ownership", "By ownership share, from the declaration"],
              ["equal", "Equal split"],
              ["custom", "Custom split"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="allocationMethod"
                value={value}
                defaultChecked={fundingPolicy.allocationMethod === value}
                className="size-4 accent-[#3b2e25]"
              />
              <span className="text-[14px]">{label}</span>
            </label>
          ))}
          <div className="mt-2 flex flex-col divide-y divide-line rounded-md border border-line bg-card">
            {ordered.map((unit) => (
              <label key={unit.id} className="flex items-center gap-3 p-2.5">
                <span className="w-14 text-[13px] font-medium">{unit.label}</span>
                <span className="flex-1 text-[13px] text-muted">
                  used only with a custom split
                </span>
                <input
                  name={`custom-${unit.id}`}
                  type="number"
                  step="0.5"
                  min={0}
                  max={100}
                  defaultValue={unit.customAllocationPct ?? unit.ownershipPct}
                  className="data-mono w-20 rounded border border-line bg-card px-3 py-1.5 text-right outline-none focus:border-ink"
                />
                <span className="data-mono text-muted">%</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="label-caps text-muted">Reserve fund</span>
            <div className="flex items-center gap-2">
              <span className="data-mono text-muted">$</span>
              <input
                name="reserveBalance"
                type="number"
                min={0}
                step="1"
                required
                defaultValue={reserves.balance}
                className="data-mono w-32 rounded border border-line bg-card px-3 py-2 text-right outline-none focus:border-ink"
              />
            </div>
            <span className="text-[13px] text-muted">
              Money set aside for big repairs (reserve fund — §22.1 disclosure).
            </span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label-caps text-muted">As of</span>
            <input
              name="reserveAsOf"
              type="date"
              required
              defaultValue={reserves.asOf}
              className="data-mono rounded border border-line bg-card px-3 py-2 outline-none focus:border-ink"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded bg-ink px-4 py-2 text-[14px] font-medium text-paper"
          >
            Set funding policy
          </button>
          <Link href="/" className="text-[14px] text-muted underline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
