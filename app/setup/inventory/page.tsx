import Link from "next/link";
import { redirect } from "next/navigation";
import { getBuilding, getSystems } from "@/lib/data";
import { INVENTORY_CANDIDATES } from "@/lib/socrata";
import { saveInventory } from "../actions";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  year: "Years need four digits, 1870 or later, not in the future.",
  name: "Item names need to stay under 40 characters.",
  exists: "That item is already documented by a city permit.",
  balance: "Reserve balance must be a number, 0 or more.",
};

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default async function SetupInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, building, systems] = await Promise.all([
    searchParams,
    getBuilding(),
    getSystems(),
  ]);
  if (!building) redirect("/setup");

  // Candidates in fixed order, then anything else already on record.
  const byName = new Map(systems.map((s) => [s.name.toLowerCase(), s]));
  const rows = INVENTORY_CANDIDATES.map((name) => ({
    id: byName.get(name.toLowerCase())?.id ?? slug(name),
    name,
    system: byName.get(name.toLowerCase()) ?? null,
  }));
  for (const system of systems) {
    if (!rows.some((r) => r.id === system.id)) {
      rows.push({ id: system.id, name: system.name, system });
    }
  }

  return (
    <div className="max-w-lg">
      <p className="label-caps text-muted">Step 4 of 4 · shared systems</p>
      <h1 className="mt-1 font-display text-[28px] font-semibold">
        What does the building share?
      </h1>
      <p className="mt-2 text-muted">
        The city&rsquo;s records are already in. Toggle what this building
        actually has, and add the year work was last done if you remember it —
        a year is enough. Blanks stay marked as honest gaps.
      </p>

      {error && ERRORS[error] && (
        <div className="mt-4 rounded border border-stamp bg-stamp-bg p-3 text-[13px] text-stamp">
          {ERRORS[error]}
        </div>
      )}

      <form action={saveInventory} className="mt-6">
        <div className="flex flex-col divide-y divide-line rounded-md border border-line bg-card">
          {rows.map(({ id, name, system }) => (
            <div key={id} className="flex items-center gap-3 p-3">
              <input
                type="checkbox"
                name={`have-${id}`}
                defaultChecked={system != null}
                disabled={system?.installSource === "permit"}
                className="size-4 shrink-0 accent-[#3b2e25]"
              />
              <span className="w-28 text-[13px] font-medium">{name}</span>
              {system?.installSource === "permit" ? (
                <span className="data-mono flex-1 text-muted">
                  permitted {system.installYear} · city record
                </span>
              ) : (
                <div className="flex flex-1 items-center gap-3">
                  <input
                    name={`year-${id}`}
                    inputMode="numeric"
                    pattern="\d{4}"
                    placeholder="last work · year"
                    defaultValue={system?.installYear ?? ""}
                    className="data-mono w-36 rounded border border-line bg-card px-3 py-1.5 outline-none focus:border-ink"
                  />
                  {system?.status === "unknown" && (
                    <span className="hatch rounded px-2 py-0.5 text-[12px] text-muted">
                      no record
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-3 bg-paper p-3">
            <span className="label-caps w-[124px] shrink-0 text-muted">
              Add an item
            </span>
            <input
              name="new-name"
              placeholder="Intercom"
              maxLength={40}
              className="min-w-0 flex-1 rounded border border-line bg-card px-3 py-1.5 text-[14px] outline-none focus:border-ink"
            />
            <input
              name="new-year"
              inputMode="numeric"
              pattern="\d{4}"
              placeholder="year"
              className="data-mono w-24 rounded border border-line bg-card px-3 py-1.5 outline-none focus:border-ink"
            />
          </div>
        </div>

        <label className="mt-6 flex flex-col gap-1.5">
          <span className="label-caps text-muted">
            Money set aside · optional
          </span>
          <div className="flex items-center gap-2">
            <span className="data-mono text-muted">$</span>
            <input
              name="reserveBalance"
              type="number"
              min={0}
              step="1"
              defaultValue={building.reserves.balance > 0 ? building.reserves.balance : ""}
              className="data-mono w-32 rounded border border-line bg-card px-3 py-2 text-right outline-none focus:border-ink"
            />
          </div>
          <span className="text-[13px] text-muted">
            Money set aside for big repairs (reserve fund — §22.1 disclosure).
          </span>
        </label>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            className="rounded bg-ink px-4 py-2 text-[14px] font-medium text-paper"
          >
            Finish setup
          </button>
          <Link href="/" className="text-[14px] text-muted underline">
            Skip
          </Link>
        </div>
      </form>
    </div>
  );
}
