import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { FIREBASE_PROJECT_ID } from "./constants";

let db: Firestore | null | undefined;

/** Firestore Admin handle, or null when no credentials are configured. */
export function firestore(): Firestore | null {
  if (db !== undefined) return db;
  try {
    const app =
      getApps()[0] ??
      initializeApp({
        credential: process.env.FIREBASE_SERVICE_ACCOUNT
          ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
          : applicationDefault(),
        projectId: FIREBASE_PROJECT_ID,
      });
    db = getFirestore(app);
  } catch (err) {
    console.warn("firestore: not configured — see .env.example", err);
    db = null;
  }
  return db;
}

/** Same, but throws with setup instructions — for scripts that need the db. */
export function requireFirestore(): Firestore {
  const handle = firestore();
  if (!handle) {
    throw new Error(
      "Firestore is not configured. Download a service-account key " +
        "(Firebase console → Project settings → Service accounts → Generate new private key), " +
        "save it as service-account.json in the repo root, and set " +
        "GOOGLE_APPLICATION_CREDENTIALS=./service-account.json in .env.local.",
    );
  }
  return handle;
}
