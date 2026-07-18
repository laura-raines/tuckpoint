import { cachedFetchJson } from "./cache";

// Chicago Building Permits (data.cityofchicago.org, resource ydr8-5enu).
const DATASET_URL = "https://data.cityofchicago.org/resource/ydr8-5enu.json";

export interface SocrataPermit {
  id?: string;
  permit_?: string;
  permit_type?: string;
  work_description?: string;
  issue_date?: string; // "2014-06-17T00:00:00.000"
  reported_cost?: string;
  street_number?: string;
  street_direction?: string;
  street_name?: string;
  suffix?: string;
  pin1?: string;
}

export async function fetchPermits(
  streetNumber: string,
  streetName: string,
): Promise<SocrataPermit[]> {
  // Inputs are validated upstream; quotes stripped anyway to keep SoQL intact.
  const num = streetNumber.replace(/['"%]/g, "");
  const name = streetName.toUpperCase().replace(/['"%]/g, "");
  const params = new URLSearchParams({
    $where: `street_number='${num}' AND street_name like '%${name}%'`,
    $order: "issue_date DESC",
    $limit: "100",
  });
  if (process.env.SOCRATA_APP_TOKEN) {
    params.set("$$app_token", process.env.SOCRATA_APP_TOKEN);
  }
  return cachedFetchJson<SocrataPermit[]>(`${DATASET_URL}?${params.toString()}`);
}

// Keyword → system mapping per CLAUDE.md. Unmatched permits still become
// timeline events, only without a system.
const SYSTEM_KEYWORDS: Array<[RegExp, string]> = [
  [/ROOF/i, "Roof"],
  [/TUCKPOINT|MASONRY|BRICK/i, "Masonry"],
  [/PORCH/i, "Porch"],
  [/BOILER|FURNACE|HVAC/i, "Boiler"],
  [/ELECTRIC/i, "Electrical"],
];

export function systemForPermit(p: SocrataPermit): string | null {
  const text = `${p.permit_type ?? ""} ${p.work_description ?? ""}`;
  for (const [re, name] of SYSTEM_KEYWORDS) {
    if (re.test(text)) return name;
  }
  return null;
}

// Typical lifespans and rough replacement ranges for imported/baseline
// systems. Honest wide ranges — false precision is the enemy.
export const SYSTEM_DEFAULTS: Record<
  string,
  { category: string; typicalLifeMin: number; typicalLifeMax: number; estCostLow: number; estCostHigh: number }
> = {
  Roof: { category: "roof", typicalLifeMin: 18, typicalLifeMax: 22, estCostLow: 18000, estCostHigh: 26000 },
  Masonry: { category: "masonry", typicalLifeMin: 20, typicalLifeMax: 25, estCostLow: 16000, estCostHigh: 26000 },
  Porch: { category: "porch", typicalLifeMin: 15, typicalLifeMax: 20, estCostLow: 15000, estCostHigh: 30000 },
  Boiler: { category: "heating", typicalLifeMin: 25, typicalLifeMax: 30, estCostLow: 9000, estCostHigh: 14000 },
  Electrical: { category: "electrical", typicalLifeMin: 30, typicalLifeMax: 40, estCostLow: 8000, estCostHigh: 15000 },
  "Water heater": { category: "plumbing", typicalLifeMin: 10, typicalLifeMax: 15, estCostLow: 1800, estCostHigh: 3500 },
};

/** Case-insensitive defaults lookup for manually added items. */
export function defaultsForName(name: string) {
  const key = Object.keys(SYSTEM_DEFAULTS).find(
    (k) => k.toLowerCase() === name.toLowerCase(),
  );
  return key ? { name: key, ...SYSTEM_DEFAULTS[key] } : null;
}

// Every building shows these rows; anything without a record is an honest gap.
export const BASELINE_SYSTEMS = ["Roof", "Masonry", "Porch", "Boiler"];

export function permitTitle(p: SocrataPermit): string {
  const raw = (p.work_description ?? p.permit_type ?? "Permit").replace(/\s+/g, " ").trim();
  const lower = raw.toLowerCase();
  const sentence = lower.charAt(0).toUpperCase() + lower.slice(1);
  return sentence.length > 90 ? `${sentence.slice(0, 87)}…` : sentence;
}

export function permitYear(p: SocrataPermit): number | null {
  const y = Number(p.issue_date?.slice(0, 4));
  return Number.isInteger(y) && y > 1870 ? y : null;
}

/** 14-digit Cook County PIN → XX-XX-XXX-XXX-XXXX. */
export function formatPin(pin: string | undefined): string | null {
  const digits = pin?.replace(/\D/g, "") ?? "";
  if (digits.length !== 14) return null;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 10)}-${digits.slice(10)}`;
}
