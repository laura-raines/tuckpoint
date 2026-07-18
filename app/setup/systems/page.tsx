import Link from "next/link";
import { redirect } from "next/navigation";
import { getBuilding, getSystems } from "@/lib/data";
import { saveSystemYears } from "../actions";

export const dynamic = "force-dynamic";

const ROW_ORDER = ["roof", "masonry", "porch", "boiler", "water heater", "electrical"];

const ERRORS: Record<string, string> = {
  year: "Years need four digits, 1870 or later, not in the future.",
  name: "Item names need to stay under 40 characters.",
  exists: "That item is already documented by a city permit — its year comes from the city record.",
};

export default async function SetupSystemsPage({
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

  const ordered = [...systems].sort((a, b) => {
    const ai = ROW_ORDER.indexOf(a.name.toLowerCase());
    const bi = ROW_ORDER.indexOf(b.name.toLowerCase());
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.name.localeCompare(b.name);
  });

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-[28px] font-semibold">
        When was work last done?
      </h1>
      <p className="mt-2 text-muted">
        From memory or an old invoice — a year is enough. Anything left blank
        stays marked as a gap, and the city&rsquo;s permit records stay the
        city&rsquo;s.
      </p>

      {error && ERRORS[error] && (
        <div className="mt-4 rounded border border-stamp bg-stamp-bg p-3 text-[13px] text-stamp">
          {ERRORS[error]}
        </div>
      )}

      <form action={saveSystemYears} className="mt-6">
        <div className="flex flex-col divide-y divide-line rounded-md border border-line bg-card">
          {ordered.map((system) => (
            <div key={system.id} className="flex items-center gap-3 p-3">
              <span className="w-24 text-[13px] font-medium">{system.name}</span>
              {system.installSource === "permit" ? (
                <span className="data-mono flex-1 text-muted">
                  permitted {system.installYear} · city record
                </span>
              ) : (
                <div className="flex flex-1 items-center gap-3">
                  <input
                    name={`year-${system.id}`}
                    inputMode="numeric"
                    pattern="\d{4}"
                    placeholder="year"
                    defaultValue={system.installYear ?? ""}
                    className="data-mono w-24 rounded border border-line bg-card px-3 py-1.5 outline-none focus:border-ink"
                  />
                  {system.status === "unknown" && (
                    <span className="hatch rounded px-2 py-0.5 text-[12px] text-muted">
                      no record
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-3 bg-paper p-3">
            <span className="label-caps w-24 text-muted">Add an item</span>
            <input
              name="new-name"
              placeholder="Water heater"
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

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            className="rounded bg-ink px-4 py-2 text-[14px] font-medium text-paper"
          >
            Save dates
          </button>
          <Link href="/" className="text-[14px] text-muted underline">
            Skip
          </Link>
        </div>
      </form>
    </div>
  );
}
