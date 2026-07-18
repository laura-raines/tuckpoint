import Link from "next/link";
import { redirect } from "next/navigation";
import { getBuilding, getUnits } from "@/lib/data";
import { saveUnits } from "../actions";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  sum: "Ownership must total 100%.",
  pct: "Each percentage must be between 0 and 100.",
};

export default async function SetupUnitsPage({
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

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-[28px] font-semibold">Ownership</h1>
      <p className="mt-2 text-muted">
        Percentage of ownership per unit, from your declaration. Cost shares
        are split by these numbers.
      </p>

      {error && ERRORS[error] && (
        <div className="mt-4 rounded border border-stamp bg-stamp-bg p-3 text-[13px] text-stamp">
          {ERRORS[error]}
        </div>
      )}

      <form action={saveUnits} className="mt-6">
        <div className="flex flex-col divide-y divide-line rounded-md border border-line bg-card">
          {ordered.map((unit, i) => (
            <div key={unit.id} className="flex items-center gap-3 p-3">
              <span className="w-14 text-[13px] font-medium">{unit.label}</span>
              <input
                name={`owner-${i + 1}`}
                defaultValue={unit.ownerName}
                placeholder="Owner name · optional"
                className="min-w-0 flex-1 rounded border border-line bg-card px-3 py-1.5 text-[14px] outline-none focus:border-ink"
              />
              <div className="flex items-center gap-1">
                <input
                  name={`pct-${i + 1}`}
                  type="number"
                  step="0.5"
                  min={0}
                  max={100}
                  required
                  defaultValue={unit.ownershipPct}
                  className="data-mono w-20 rounded border border-line bg-card px-3 py-1.5 text-right outline-none focus:border-ink"
                />
                <span className="data-mono text-muted">%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            className="rounded bg-ink px-4 py-2 text-[14px] font-medium text-paper"
          >
            Save ownership
          </button>
          <Link href="/setup" className="text-[14px] text-muted underline">
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}
