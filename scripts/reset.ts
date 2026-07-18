// Wipes the building record so sign-in starts onboarding from scratch.
// Keeps the cache collection (demo insurance). Run with: npm run reset
// Restore the crafted demo building afterward with: npm run seed
import { BUILDING_ID } from "../lib/constants";
import { requireFirestore } from "../lib/firestore";

async function main() {
  const db = requireFirestore();
  const ref = db.collection("buildings").doc(BUILDING_ID);
  for (const name of ["units", "systems", "events", "documents"]) {
    const docs = await ref.collection(name).listDocuments();
    await Promise.all(docs.map((d) => d.delete()));
    console.log(`cleared ${name} (${docs.length})`);
  }
  await ref.delete();
  console.log("record wiped — sign in to start onboarding from scratch");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
