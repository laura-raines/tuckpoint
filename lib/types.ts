// Mirrors the Firestore data model in CLAUDE.md. Dates are ISO strings
// (YYYY-MM-DD) — they sort correctly and skip Timestamp conversion friction.

export type AllocationMethod = "ownership" | "equal" | "custom";

export interface FundingPolicy {
  reservePct: number;
  assessmentPct: number;
  allocationMethod: AllocationMethod;
}

export interface Building {
  address: string;
  streetNumber: string;
  streetName: string;
  unitCount: number;
  yearBuilt: number | null;
  pin: string | null;
  fundingPolicy: FundingPolicy;
  reserves: { balance: number; asOf: string };
}

export interface Unit {
  label: string;
  ownershipPct: number;
  customAllocationPct?: number;
  ownerName: string;
  arrears: number;
}

export type SystemStatus = "documented" | "unknown";
export type InstallSource = "permit" | "manual" | null;

export interface BuildingSystem {
  name: string;
  category: string;
  installYear: number | null;
  installSource: InstallSource;
  material: string | null;
  typicalLifeMin: number | null;
  typicalLifeMax: number | null;
  estCostLow: number | null;
  estCostHigh: number | null;
  status: SystemStatus;
  // Health-card fields — schema only for the weekend; detail view is backlog.
  lastInspection?: string;
  conditionPhotoUrl?: string;
  warrantyDocUrl?: string;
  lastVendor?: string;
}

export type EventType = "permit" | "maintenance" | "decision" | "assessment";
export type EventSource = "city" | "manual" | "extracted";
export type WorkStatus = "requested" | "scheduled" | "done";

export interface BuildingEvent {
  type: EventType;
  date: string;
  systemId?: string;
  title: string;
  cost?: number;
  contractor?: string;
  source: EventSource;
  permitNumber?: string;
  docUrl?: string;
  decision?: { summary: string; vote: string; status: "filed" };
  workStatus?: WorkStatus; // absent means "done"; ticket workflow is post-weekend
}

export type DocumentCategory =
  | "declaration"
  | "bylaws"
  | "rules"
  | "insurance"
  | "minutes"
  | "other";

export interface BuildingDocument {
  category: DocumentCategory;
  title: string;
  url: string;
  uploadedAt: string;
}

export type WithId<T> = T & { id: string };
