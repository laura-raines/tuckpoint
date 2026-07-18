import { BUILDING_ID } from "./constants";
import { firestore } from "./firestore";
import type {
  Building,
  BuildingDocument,
  BuildingEvent,
  BuildingSystem,
  Unit,
  WithId,
} from "./types";

// Read path (build step 2). Every reader degrades to empty when Firestore is
// unreachable so the shell still renders before setup.

function buildingRef() {
  return firestore()?.collection("buildings").doc(BUILDING_ID) ?? null;
}

export async function getBuilding(): Promise<Building | null> {
  try {
    const snap = await buildingRef()?.get();
    return snap?.exists ? (snap.data() as Building) : null;
  } catch (err) {
    console.warn("data: getBuilding failed", err);
    return null;
  }
}

async function getSubcollection<T>(name: string, orderBy?: string): Promise<WithId<T>[]> {
  try {
    const ref = buildingRef()?.collection(name);
    if (!ref) return [];
    const query = orderBy ? ref.orderBy(orderBy, "desc") : ref;
    const snap = await query.get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
  } catch (err) {
    console.warn(`data: reading ${name} failed`, err);
    return [];
  }
}

export function getUnits(): Promise<WithId<Unit>[]> {
  return getSubcollection<Unit>("units");
}

export function getSystems(): Promise<WithId<BuildingSystem>[]> {
  return getSubcollection<BuildingSystem>("systems");
}

export function getEvents(): Promise<WithId<BuildingEvent>[]> {
  return getSubcollection<BuildingEvent>("events", "date");
}

export function getDocuments(): Promise<WithId<BuildingDocument>[]> {
  return getSubcollection<BuildingDocument>("documents");
}
