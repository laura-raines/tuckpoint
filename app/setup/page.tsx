import Link from "next/link";
import { getBuilding } from "@/lib/data";
import { createBuilding } from "./actions";

export const dynamic = "force-dynamic";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, building] = await Promise.all([searchParams, getBuilding()]);

  return (
    <div className="max-w-md">
      <h1 className="font-display text-[28px] font-semibold">
        Set up the building
      </h1>
      <p className="mt-2 text-muted">
        The address as the city records it — number, direction, street. Permits
        on file are found from this.
      </p>

      {error && (
        <div className="mt-4 rounded border border-stamp bg-stamp-bg p-3 text-[13px] text-stamp">
          Enter a street address like 1516 N Hudson Ave, and 2–12 units.
        </div>
      )}

      <form action={createBuilding} className="mt-6 flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="label-caps text-muted">Street address</span>
          <input
            name="address"
            required
            defaultValue={building?.address}
            placeholder="1516 N Hudson Ave"
            className="data-mono rounded border border-line bg-card px-3 py-2 outline-none focus:border-ink"
          />
        </label>

        <div className="flex gap-4">
          <label className="flex w-28 flex-col gap-1.5">
            <span className="label-caps text-muted">Units</span>
            <input
              name="unitCount"
              type="number"
              min={2}
              max={12}
              required
              defaultValue={building?.unitCount ?? 3}
              className="data-mono rounded border border-line bg-card px-3 py-2 outline-none focus:border-ink"
            />
          </label>
          <label className="flex w-36 flex-col gap-1.5">
            <span className="label-caps text-muted">Year built · optional</span>
            <input
              name="yearBuilt"
              inputMode="numeric"
              pattern="\d{4}"
              defaultValue={building?.yearBuilt ?? ""}
              placeholder="1908"
              className="data-mono rounded border border-line bg-card px-3 py-2 outline-none focus:border-ink"
            />
          </label>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            className="rounded bg-ink px-4 py-2 text-[14px] font-medium text-paper"
          >
            Save building
          </button>
          <Link href="/" className="text-[14px] text-muted underline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
