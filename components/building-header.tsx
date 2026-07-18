import { cookies } from "next/headers";
import { signOut } from "@/app/login/actions";
import { getBuilding } from "@/lib/data";
import { DEMO_BUILDING } from "@/lib/demo-building";

export default async function BuildingHeader() {
  const building = await getBuilding();
  const { address, unitCount, yearBuilt } = building ?? DEMO_BUILDING;
  const signedIn = (await cookies()).has("steward");

  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-5xl items-baseline justify-between px-6 py-3">
        <span className="font-display text-xl font-semibold">Tuckpoint</span>
        <span className="flex items-baseline gap-4">
          <span className="data-mono uppercase text-muted">
            {address} · {unitCount} units
            {yearBuilt != null && ` · built ${yearBuilt}`}
          </span>
          {signedIn && (
            <form action={signOut}>
              <button type="submit" className="text-[12px] text-muted underline">
                Sign out
              </button>
            </form>
          )}
        </span>
      </div>
    </header>
  );
}
