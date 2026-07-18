"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getBuilding } from "@/lib/data";

export async function signIn() {
  (await cookies()).set("steward", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  // The permit import is the first-run experience: an empty record goes
  // straight to setup, an existing one to the timeline.
  const building = await getBuilding();
  redirect(building ? "/" : "/setup");
}

export async function signOut() {
  (await cookies()).delete("steward");
  redirect("/");
}
