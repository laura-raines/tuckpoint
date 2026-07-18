import { DEMO_BUILDING } from "@/lib/demo-building";

export default function BuildingHeader() {
  const { address, unitCount, yearBuilt } = DEMO_BUILDING;
  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-5xl items-baseline justify-between px-6 py-3">
        <span className="font-display text-xl font-semibold">Tuckpoint</span>
        <span className="data-mono uppercase text-muted">
          {address} · {unitCount} units · built {yearBuilt}
        </span>
      </div>
    </header>
  );
}
