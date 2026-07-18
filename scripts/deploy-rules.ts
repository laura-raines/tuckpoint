// Deploys firestore.rules via the Firebase Rules REST API, authenticated with
// the service-account key. Exists because the firebase CLI prefers its
// logged-in user (a different Google account) over GOOGLE_APPLICATION_CREDENTIALS.
// Run with: npm run deploy:rules
import { readFileSync } from "node:fs";
import { GoogleAuth } from "google-auth-library";
import { FIREBASE_PROJECT_ID } from "../lib/constants";

const API = "https://firebaserules.googleapis.com/v1";

async function main() {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const project = `projects/${FIREBASE_PROJECT_ID}`;

  const rulesetRes = await fetch(`${API}/${project}/rulesets`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      source: {
        files: [
          {
            name: "firestore.rules",
            content: readFileSync("firestore.rules", "utf8"),
          },
        ],
      },
    }),
  });
  if (!rulesetRes.ok) throw new Error(`ruleset create failed: ${await rulesetRes.text()}`);
  const ruleset = (await rulesetRes.json()) as { name: string };

  const releaseName = `${project}/releases/cloud.firestore`;
  const patchRes = await fetch(`${API}/${releaseName}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      release: { name: releaseName, rulesetName: ruleset.name },
    }),
  });
  if (patchRes.ok) {
    console.log(`released ${ruleset.name} to cloud.firestore`);
    return;
  }
  // No release yet (first deploy): create instead of patch.
  const createRes = await fetch(`${API}/${project}/releases`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: releaseName, rulesetName: ruleset.name }),
  });
  if (!createRes.ok) throw new Error(`release failed: ${await createRes.text()}`);
  console.log(`created release cloud.firestore with ${ruleset.name}`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
