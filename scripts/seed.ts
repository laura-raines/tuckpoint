// Seeds the demo building. Repeatable: fixed doc IDs, full overwrite via set().
// Run with: npm run seed
import { BUILDING_ID } from "../lib/constants";
import { requireFirestore } from "../lib/firestore";
import type {
  Building,
  BuildingEvent,
  BuildingSystem,
  Unit,
} from "../lib/types";

const building: Building = {
  address: "2847 W Palmer St",
  streetNumber: "2847",
  streetName: "PALMER",
  unitCount: 3,
  yearBuilt: 1908,
  pin: null, // not on file — surfaces honestly in the §22.1 package
  fundingPolicy: { reservePct: 50, assessmentPct: 50, allocationMethod: "ownership" },
  reserves: { balance: 14200, asOf: "2026-07-01" },
};

// Unit 2 carries the 34% so the demo line "unit 2's share ~$3,740" works out.
const units: Record<string, Unit> = {
  "unit-1": { label: "Unit 1", ownershipPct: 33, ownerName: "Dana Whitfield", arrears: 0 },
  "unit-2": { label: "Unit 2", ownershipPct: 34, ownerName: "Priya Raman", arrears: 0 },
  "unit-3": { label: "Unit 3", ownershipPct: 33, ownerName: "Marcus Bell", arrears: 0 },
};

const systems: Record<string, BuildingSystem> = {
  roof: {
    name: "Roof",
    category: "roof",
    installYear: 2014,
    installSource: "permit",
    material: "modified bitumen",
    typicalLifeMin: 18,
    typicalLifeMax: 22,
    estCostLow: 18000,
    estCostHigh: 26000,
    status: "documented",
  },
  masonry: {
    // 2008 + 20–23 yr life → projected window 2028–2031, ~$22K midpoint,
    // matching the demo's funding-math beat.
    name: "Masonry",
    category: "masonry",
    installYear: 2008,
    installSource: "permit",
    material: "brick, full tuckpointing",
    typicalLifeMin: 20,
    typicalLifeMax: 23,
    estCostLow: 20000,
    estCostHigh: 24000,
    status: "documented",
  },
  boiler: {
    name: "Boiler",
    category: "heating",
    installYear: 2015,
    installSource: "manual",
    material: "gas steam boiler",
    typicalLifeMin: 25,
    typicalLifeMax: 30,
    estCostLow: 9000,
    estCostHigh: 14000,
    status: "documented",
  },
  porch: {
    // The designed gap: no install record anywhere.
    name: "Porch",
    category: "porch",
    installYear: null,
    installSource: null,
    material: null,
    typicalLifeMin: 15,
    typicalLifeMax: 20,
    estCostLow: 15000,
    estCostHigh: 30000,
    status: "unknown",
  },
};

const events: Record<string, BuildingEvent> = {
  "evt-permit-roof-2014": {
    type: "permit",
    date: "2014-06-17",
    systemId: "roof",
    title: "Roof replacement permit",
    cost: 14800,
    source: "city",
    permitNumber: "100545123",
  },
  "evt-permit-masonry-2008": {
    type: "permit",
    date: "2008-09-03",
    systemId: "masonry",
    title: "Masonry repair and tuckpointing permit",
    cost: 18500,
    source: "city",
    permitNumber: "100238457",
  },
  "evt-maint-boiler-2025": {
    type: "maintenance",
    date: "2025-11-04",
    systemId: "boiler",
    title: "Annual boiler service",
    cost: 385,
    contractor: "Lakeview Mechanical",
    source: "manual",
  },
  "evt-decision-porch-2026": {
    type: "decision",
    date: "2026-05-12",
    systemId: "porch",
    title: "Porch inspection deferred",
    source: "manual",
    decision: {
      summary: "Defer porch inspection to spring 2027",
      vote: "3–0",
      status: "filed",
    },
  },
  "evt-assessment-masonry-2019": {
    type: "assessment",
    date: "2019-04-15",
    systemId: "masonry",
    title: "Special assessment — parapet repair",
    cost: 4500,
    source: "manual",
  },
};

async function main() {
  const db = requireFirestore();
  const ref = db.collection("buildings").doc(BUILDING_ID);
  const batch = db.batch();

  batch.set(ref, building);
  for (const [id, unit] of Object.entries(units)) {
    batch.set(ref.collection("units").doc(id), unit);
  }
  for (const [id, system] of Object.entries(systems)) {
    batch.set(ref.collection("systems").doc(id), system);
  }
  for (const [id, event] of Object.entries(events)) {
    batch.set(ref.collection("events").doc(id), event);
  }

  await batch.commit();
  console.log(
    `seeded buildings/${BUILDING_ID}: ${Object.keys(units).length} units, ` +
      `${Object.keys(systems).length} systems, ${Object.keys(events).length} events`,
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
