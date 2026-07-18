"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { BUILDING_ID } from "@/lib/constants";
import { requireFirestore } from "@/lib/firestore";
import type { BuildingDocument, DocumentCategory } from "@/lib/types";

const CATEGORIES: DocumentCategory[] = [
  "declaration",
  "bylaws",
  "rules",
  "insurance",
  "minutes",
  "other",
];

function documentsRef() {
  return requireFirestore()
    .collection("buildings")
    .doc(BUILDING_ID)
    .collection("documents");
}

export async function addDocument(formData: FormData) {
  const title = String(formData.get("title") ?? "").replace(/\s+/g, " ").trim();
  const category = String(formData.get("category") ?? "") as DocumentCategory;
  const url = String(formData.get("url") ?? "").trim();

  if (!title || title.length > 120) redirect("/documents?error=title");
  if (!CATEGORIES.includes(category)) redirect("/documents?error=category");
  // Link is optional; when present it must be a real http(s) URL.
  if (url && !/^https?:\/\/\S+$/i.test(url)) redirect("/documents?error=url");

  const doc: BuildingDocument = {
    category,
    title,
    url,
    uploadedAt: new Date().toISOString().slice(0, 10),
  };
  await documentsRef().doc(randomUUID()).set(doc);
  redirect("/documents");
}

export async function removeDocument(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) await documentsRef().doc(id).delete();
  redirect("/documents");
}
