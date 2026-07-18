import { signIn } from "@/app/login/actions";
import CapitalTimeline from "./capital-timeline";
import HeroCanvas from "./hero-canvas";
import { todayFraction } from "@/lib/timeline";
import type { BuildingSystem, WithId } from "@/lib/types";

// A sample record for the hero — the product is the pitch. Masonry last
// touched 2006 so the near-term stamp window shows what urgency looks like.
const SAMPLE_SYSTEMS: WithId<BuildingSystem>[] = [
  {
    id: "roof",
    name: "Roof",
    category: "roof",
    installYear: 2014,
    installSource: "permit",
    material: "modified bitumen",
    typicalLifeMin: 18,
    typicalLifeMax: 22,
    estCostLow: 8000,
    estCostHigh: 15000,
    status: "documented",
  },
  {
    id: "masonry",
    name: "Masonry",
    category: "masonry",
    installYear: 2006,
    installSource: "permit",
    material: "brick, full tuckpointing",
    typicalLifeMin: 20,
    typicalLifeMax: 25,
    estCostLow: 10000,
    estCostHigh: 30000,
    status: "documented",
  },
  {
    id: "porch",
    name: "Porch",
    category: "porch",
    installYear: null,
    installSource: null,
    material: null,
    typicalLifeMin: 15,
    typicalLifeMax: 20,
    estCostLow: 15000,
    estCostHigh: 40000,
    status: "unknown",
  },
  {
    id: "boiler",
    name: "Boiler",
    category: "heating",
    installYear: 2015,
    installSource: "manual",
    material: "gas steam boiler",
    typicalLifeMin: 25,
    typicalLifeMax: 30,
    estCostLow: 4000,
    estCostHigh: 8000,
    status: "documented",
  },
];

export default function Landing() {
  return (
    <div className="py-8">
      <section className="relative -mx-6 overflow-hidden rounded-md">
        <HeroCanvas />
        <div className="relative px-6 py-16">
          <p className="label-caps text-muted">
            For Chicago&rsquo;s 2–12 unit condo buildings
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-[42px] font-semibold leading-tight">
            The building&rsquo;s record, kept.
          </h1>
          <p className="mt-4 max-w-xl text-[17px]">
            Self-managed buildings run on memory. Tuckpoint keeps it — the
            permit history, the capital clock, the decisions on file — and
            turns it into a seller&rsquo;s packet on demand.
          </p>
          <p className="mt-3 max-w-xl text-[15px] text-muted">
            Our mission: no surprise assessments. Every two-flat and three-flat
            deserves a record as good as a managed tower&rsquo;s — kept by
            neighbors, not a property manager.
          </p>
          <form action={signIn} className="mt-7 flex items-baseline gap-3">
            <button
              type="submit"
              className="rounded bg-ink px-5 py-2.5 text-[15px] font-medium text-paper"
            >
              Manage your house
            </button>
            <span className="text-[13px] text-muted">
              Demo session — no password.
            </span>
          </form>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mortar pb-2 font-display text-xl font-medium">
          Come for the roof clock
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          One row per system. Solid bars are documented history — most of it
          imported straight from the city&rsquo;s permit records. Dashed
          windows are what&rsquo;s coming, always as a range. Gaps stay
          visible until someone closes them.
        </p>
        <div className="mt-4">
          <CapitalTimeline systems={SAMPLE_SYSTEMS} today={todayFraction()} />
        </div>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-line bg-card p-4">
          <h3 className="font-display text-base font-medium">The memory</h3>
          <p className="mt-2 text-muted">
            Permits import themselves from the city&rsquo;s open records;
            maintenance and decisions file alongside them. Nothing lives in a
            shoebox.
          </p>
        </div>
        <div className="rounded-md border border-line bg-card p-4">
          <h3 className="font-display text-base font-medium">The clock</h3>
          <p className="mt-2 text-muted">
            Every shared system gets an honest window and a dollar range —
            with each unit&rsquo;s share and the monthly set-aside that avoids
            a surprise assessment.
          </p>
        </div>
        <div className="rounded-md border border-line bg-card p-4">
          <h3 className="font-display text-base font-medium">
            The meeting room
          </h3>
          <p className="mt-2 text-muted">
            Votes and decisions land in the record as they happen. When a unit
            sells, the Seller&rsquo;s Packet (§22.1 disclosure statement)
            generates from the live record in one click.
          </p>
        </div>
      </section>
    </div>
  );
}
