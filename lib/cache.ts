import { createHash } from "node:crypto";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Demo insurance (CLAUDE.md): every external call goes through here, responses
// land in Firestore cache/{hash}, and reads hit the cache first so the demo
// runs with wifi off. Until Firebase is wired (build step 2), calls pass
// through uncached with a warning.

let db: Firestore | null | undefined;

function cacheDb(): Firestore | null {
  if (db !== undefined) return db;
  try {
    const app =
      getApps()[0] ??
      initializeApp({
        credential: process.env.FIREBASE_SERVICE_ACCOUNT
          ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
          : applicationDefault(),
      });
    db = getFirestore(app);
  } catch (err) {
    console.warn("cache: Firestore not configured — external calls are uncached", err);
    db = null;
  }
  return db;
}

/**
 * Run `fn` unless a cached response exists for `key`. Use for non-URL calls
 * (Claude); key on everything that changes the output (model, prompt, input).
 */
export async function cached<T>(key: unknown, fn: () => Promise<T>): Promise<T> {
  const keyString = JSON.stringify(key);
  const hash = createHash("sha256").update(keyString).digest("hex");
  const ref = cacheDb()?.collection("cache").doc(hash);

  if (ref) {
    try {
      const snap = await ref.get();
      const raw = snap.get("response");
      if (typeof raw === "string") return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`cache: read failed for ${hash}, fetching live`, err);
    }
  }

  const response = await fn();

  if (ref) {
    try {
      // Stored as a JSON string: Firestore rejects nested arrays and
      // undefined, both common in raw API responses.
      await ref.set({
        url: keyString,
        response: JSON.stringify(response),
        fetchedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn(`cache: write failed for ${hash}`, err);
    }
  }

  return response;
}

/** Cache-first JSON fetch for URL-based calls (Socrata). */
export async function cachedFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  return cached<T>({ url, body: init?.body?.toString() ?? null }, async () => {
    const res = await fetch(url, init);
    if (!res.ok) {
      throw new Error(`fetch failed (${res.status}) for ${url}`);
    }
    return (await res.json()) as T;
  });
}
