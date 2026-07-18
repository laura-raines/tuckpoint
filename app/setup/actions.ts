"use server";

import { redirect } from "next/navigation";
import { BUILDING_ID } from "@/lib/constants";
import { requireFirestore } from "@/lib/firestore";
import {
  BASELINE_SYSTEMS,
  SYSTEM_DEFAULTS,
  fetchPermits,
  formatPin,
  permitTitle,
  permitYear,
  systemForPermit,
} from "@/lib/socrata";
import type { Building, BuildingEvent, BuildingSystem, Unit } from "@/lib/types";

function buildingRef() {
  return requireFirestore().collection("buildings").doc(BUILDING_ID);
}

async function wipe(sub: FirebaseFirestore.CollectionReference) {
  const docs = await sub.listDocuments();
  await Promise.all(docs.map((d) => d.delete()));
}

const ADDRESS_RE =
  /^(\d+)\s+(?:([NSEW])\.?\s+)?(.+?)(?:\s+(ST|STREET|AVE|AVENUE|BLVD|BOULEVARD|RD|ROAD|PL|PLACE|CT|COURT|DR|DRIVE|LN|LANE|TER|TERRACE|WAY|PKWY|PARKWAY))?\.?$/i;

export async function createBuilding(formData: FormData) {
  const addressLine = String(formData.get("address") ?? "").replace(/\s+/g, " ").trim();
  const unitCount = Number(formData.get("unitCount"));
  const yearBuiltRaw = String(formData.get("yearBuilt") ?? "").trim();

  const match = ADDRESS_RE.exec(addressLine);
  if (!match || !Number.isInteger(unitCount) || unitCount < 2 || unitCount > 12) {
    redirect("/setup?error=invalid");
  }
  const streetNumber = match[1];
  const streetName = match[3].toUpperCase();
  const yearBuilt = /^\d{4}$/.test(yearBuiltRaw) ? Number(yearBuiltRaw) : null;

  const ref = buildingRef();
  const snap = await ref.get();
  const existing = snap.exists ? (snap.data() as Building) : null;
  const sameAddress =
    existing != null &&
    existing.streetNumber === streetNumber &&
    existing.streetName === streetName;

  const building: Building = {
    address: addressLine,
    streetNumber,
    streetName,
    unitCount,
    yearBuilt,
    pin: sameAddress ? existing.pin : null,
    fundingPolicy:
      existing?.fundingPolicy ??
      { reservePct: 50, assessmentPct: 50, allocationMethod: "ownership" },
    reserves:
      existing?.reserves ??
      { balance: 0, asOf: new Date().toISOString().slice(0, 10) },
  };
  await ref.set(building);

  // A different address means a different building: its record starts clean.
  if (!sameAddress && existing != null) {
    await Promise.all([
      wipe(ref.collection("systems")),
      wipe(ref.collection("events")),
      wipe(ref.collection("units")),
    ]);
  }

  const unitsSnap = await ref.collection("units").get();
  if (unitsSnap.size !== unitCount) {
    await Promise.all(unitsSnap.docs.map((d) => d.ref.delete()));
    const base = Math.floor(100 / unitCount);
    const writes: Promise<unknown>[] = [];
    for (let i = 1; i <= unitCount; i++) {
      const unit: Unit = {
        label: `Unit ${i}`,
        // First unit absorbs the remainder so defaults always total 100.
        ownershipPct: i === 1 ? 100 - base * (unitCount - 1) : base,
        ownerName: "",
        arrears: 0,
      };
      writes.push(ref.collection("units").doc(`unit-${i}`).set(unit));
    }
    await Promise.all(writes);
  }

  redirect("/setup/units");
}

export async function saveUnits(formData: FormData) {
  const ref = buildingRef();
  const snap = await ref.get();
  if (!snap.exists) redirect("/setup");
  const { unitCount } = snap.data() as Building;

  const units: Array<{ id: string; unit: Unit }> = [];
  let sum = 0;
  for (let i = 1; i <= unitCount; i++) {
    const pct = Number(formData.get(`pct-${i}`));
    const ownerName = String(formData.get(`owner-${i}`) ?? "").trim();
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      redirect("/setup/units?error=pct");
    }
    sum += pct;
    units.push({
      id: `unit-${i}`,
      unit: { label: `Unit ${i}`, ownershipPct: pct, ownerName, arrears: 0 },
    });
  }
  if (Math.abs(sum - 100) > 0.01) redirect("/setup/units?error=sum");

  await Promise.all(
    units.map((u) => ref.collection("units").doc(u.id).set(u.unit)),
  );
  redirect("/setup/permits");
}

export async function confirmPermits(formData: FormData) {
  const selected = new Set(formData.getAll("permit").map(String));
  const ref = buildingRef();
  const snap = await ref.get();
  if (!snap.exists) redirect("/setup");
  const building = snap.data() as Building;

  const db = requireFirestore();
  const batch = db.batch();
  const existingSystems = new Map(
    (await ref.collection("systems").get()).docs.map((d) => [
      d.id,
      d.data() as BuildingSystem,
    ]),
  );

  const systemYears = new Map<string, number>();

  if (selected.size > 0) {
    // Re-derive from the (cached) city response — selection only carries ids,
    // so submitted form data can't alter permit facts.
    const permits = (
      await fetchPermits(building.streetNumber, building.streetName)
    ).filter((p) => p.permit_ != null && selected.has(p.permit_));

    for (const p of permits) {
      const systemName = systemForPermit(p);
      const cost = Number(p.reported_cost);
      const event: BuildingEvent = {
        type: "permit",
        date: p.issue_date?.slice(0, 10) ?? "",
        title: permitTitle(p),
        source: "city",
        permitNumber: p.permit_,
        ...(systemName ? { systemId: systemName.toLowerCase() } : {}),
        ...(Number.isFinite(cost) && cost > 0 ? { cost } : {}),
      };
      batch.set(ref.collection("events").doc(`permit-${p.permit_}`), event);

      const year = permitYear(p);
      if (systemName && year != null) {
        systemYears.set(
          systemName,
          Math.max(systemYears.get(systemName) ?? 0, year),
        );
      }
    }

    for (const [name, year] of systemYears) {
      const id = name.toLowerCase();
      const prev = existingSystems.get(id);
      const defaults = SYSTEM_DEFAULTS[name];
      const system: BuildingSystem = {
        name,
        category: defaults.category,
        installYear: Math.max(prev?.installYear ?? 0, year),
        installSource: "permit",
        material: prev?.material ?? null,
        typicalLifeMin: prev?.typicalLifeMin ?? defaults.typicalLifeMin,
        typicalLifeMax: prev?.typicalLifeMax ?? defaults.typicalLifeMax,
        estCostLow: prev?.estCostLow ?? defaults.estCostLow,
        estCostHigh: prev?.estCostHigh ?? defaults.estCostHigh,
        status: "documented",
      };
      batch.set(ref.collection("systems").doc(id), system);
    }

    if (!building.pin) {
      const pin = permits.map((p) => formatPin(p.pin1)).find(Boolean);
      if (pin) batch.update(ref, { pin });
    }
  }

  // Baseline rows always exist — a system without a record is a visible gap,
  // never a missing row.
  for (const name of BASELINE_SYSTEMS) {
    const id = name.toLowerCase();
    if (existingSystems.has(id) || systemYears.has(name)) continue;
    const defaults = SYSTEM_DEFAULTS[name];
    const gap: BuildingSystem = {
      name,
      category: defaults.category,
      installYear: null,
      installSource: null,
      material: null,
      typicalLifeMin: defaults.typicalLifeMin,
      typicalLifeMax: defaults.typicalLifeMax,
      estCostLow: defaults.estCostLow,
      estCostHigh: defaults.estCostHigh,
      status: "unknown",
    };
    batch.set(ref.collection("systems").doc(id), gap);
  }

  await batch.commit();
  redirect("/");
}
