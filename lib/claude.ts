import Anthropic from "@anthropic-ai/sdk";
import { cached } from "./cache";

// Pinned by CLAUDE.md.
const MODEL = "claude-sonnet-4-6";

export interface DisclosureNarrative {
  capital: string;
  reserves: string;
}

/**
 * Plain-language paragraphs for disclosure sections 3–4. Facts come only from
 * the JSON provided; the model writes "not on file" for anything missing.
 * Returns null (caller falls back to deterministic sentences) without a key
 * or on any failure — the disclosure never blocks on the model.
 */
export async function disclosureNarrative(
  data: unknown,
): Promise<DisclosureNarrative | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    return await cached({ kind: "disclosure-narrative", model: MODEL, data }, async () => {
      const client = new Anthropic();
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 600,
        temperature: 0.2,
        system:
          "You draft plain-language paragraphs for an Illinois Section 22.1 condominium disclosure. " +
          "Use ONLY facts present in the JSON the user provides; write \"not on file\" for anything missing. " +
          "Never speculate, never advise, no exclamation points. Sentence case. " +
          'Respond with JSON only, no code fences: {"capital": "<paragraph on anticipated capital expenditures>", "reserves": "<paragraph on reserve fund status>"}',
        messages: [{ role: "user", content: JSON.stringify(data) }],
      });
      const text = message.content[0]?.type === "text" ? message.content[0].text : "";
      const parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
      if (typeof parsed.capital !== "string" || typeof parsed.reserves !== "string") {
        throw new Error("narrative: unexpected shape");
      }
      return parsed as DisclosureNarrative;
    });
  } catch (err) {
    console.warn("narrative: falling back to deterministic text", err);
    return null;
  }
}
