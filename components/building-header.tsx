import { getBuilding } from "@/lib/data";
import { DEMO_BUILDING } from "@/lib/demo-building";

export default async function BuildingHeader() {
  const building = await getBuilding();
  const { address, unitCount, yearBuilt } = building ?? DEMO_BUILDING;
  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-5xl items-baseline justify-between px-6 py-3">
        <span className="font-display text-xl font-semibold">Tuckpoint</span>
        <span className="data-mono uppercase text-muted">
          {address} · {unitCount} units
          {yearBuilt != null && ` · built ${yearBuilt}`}
        </span>
      </div>
    </header>
  );
}
