import { cookies } from "next/headers";
import { signOut } from "@/app/login/actions";
import { getBuilding } from "@/lib/data";

export default async function BuildingHeader() {
  const signedIn = (await cookies()).has("steward");
  const building = signedIn ? await getBuilding() : null;

  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-5xl items-baseline justify-between px-6 py-3">
        <span className="font-display text-xl font-semibold">Tuckpoint</span>
        {signedIn && (
          <span className="flex items-baseline gap-4">
            {building && (
              <span className="data-mono uppercase text-muted">
                {building.address} · {building.unitCount} units
                {building.yearBuilt != null && ` · built ${building.yearBuilt}`}
              </span>
            )}
            <form action={signOut}>
              <button type="submit" className="text-[12px] text-muted underline">
                Sign out
              </button>
            </form>
          </span>
        )}
      </div>
    </header>
  );
}
