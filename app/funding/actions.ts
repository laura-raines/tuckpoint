"use server";

import { redirect } from "next/navigation";
import { BUILDING_ID } from "@/lib/constants";
import { requireFirestore } from "@/lib/firestore";
import type { AllocationMethod, Building } from "@/lib/types";

const METHODS: AllocationMethod[] = ["ownership", "equal", "custom"];

export async function saveFundingPolicy(formData: FormData) {
  const reservePct = Number(formData.get("reservePct"));
  const method = String(formData.get("allocationMethod")) as AllocationMethod;
  const balance = Number(formData.get("reserveBalance"));
  const asOf = String(formData.get("reserveAsOf") ?? "");

  if (!Number.isInteger(reservePct) || reservePct < 0 || reservePct > 100) {
    redirect("/funding?error=pct");
  }
  if (!METHODS.includes(method)) redirect("/funding?error=method");
  if (!Number.isFinite(balance) || balance < 0) redirect("/funding?error=balance");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) redirect("/funding?error=date");

  const ref = requireFirestore().collection("buildings").doc(BUILDING_ID);
  const snap = await ref.get();
  if (!snap.exists) redirect("/setup");

  if (method === "custom") {
    const unitsSnap = await ref.collection("units").get();
    const updates: Array<{ id: string; pct: number }> = [];
    let sum = 0;
    for (const doc of unitsSnap.docs) {
      const pct = Number(formData.get(`custom-${doc.id}`));
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        redirect("/funding?error=custom");
      }
      sum += pct;
      updates.push({ id: doc.id, pct });
    }
    if (Math.abs(sum - 100) > 0.01) redirect("/funding?error=custom");
    await Promise.all(
      updates.map((u) =>
        ref.collection("units").doc(u.id).update({ customAllocationPct: u.pct }),
      ),
    );
  }

  const update: Pick<Building, "fundingPolicy" | "reserves"> = {
    fundingPolicy: {
      reservePct,
      assessmentPct: 100 - reservePct,
      allocationMethod: method,
    },
    reserves: { balance, asOf },
  };
  await ref.update(update);
  redirect("/");
}
