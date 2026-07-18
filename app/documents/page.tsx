import Link from "next/link";
import { redirect } from "next/navigation";
import { getBuilding, getDocuments } from "@/lib/data";
import type { DocumentCategory } from "@/lib/types";
import { addDocument, removeDocument } from "./actions";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  title: "Give the document a title, under 120 characters.",
  category: "Pick a category.",
  url: "A link must start with http:// or https://.",
};

// Ordered for the §22.1 package: governing docs first, then the rest.
const CATEGORY_ORDER: { key: DocumentCategory; label: string; note: string }[] = [
  { key: "declaration", label: "Declaration", note: "§22.1 — governing document" },
  { key: "bylaws", label: "Bylaws", note: "§22.1 — governing document" },
  { key: "rules", label: "Rules & regulations", note: "§22.1 — governing document" },
  { key: "insurance", label: "Insurance", note: "§22.1 — evidence of coverage" },
  { key: "minutes", label: "Meeting minutes", note: "Decisions & votes on file" },
  { key: "other", label: "Other", note: "Receipts, contracts, correspondence" },
];

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, building, documents] = await Promise.all([
    searchParams,
    getBuilding(),
    getDocuments(),
  ]);
  if (!building) redirect("/setup");

  const byCategory = new Map(CATEGORY_ORDER.map((c) => [c.key, [] as typeof documents]));
  for (const doc of documents) {
    (byCategory.get(doc.category) ?? byCategory.get("other"))!.push(doc);
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-[28px] font-semibold">Documents</h1>
        <Link href="/" className="text-[14px] text-muted underline">
          Back to record
        </Link>
      </div>
      <p className="mt-2 text-muted">
        The building&rsquo;s vault — minutes, receipts, insurance, and the
        governing documents. What&rsquo;s here feeds the Seller&rsquo;s Packet;
        what&rsquo;s missing shows up as an honest gap.
      </p>

      {error && ERRORS[error] && (
        <div className="mt-4 rounded border border-stamp bg-stamp-bg p-3 text-[13px] text-stamp">
          {ERRORS[error]}
        </div>
      )}

      <form
        action={addDocument}
        className="mt-6 rounded-md border border-line bg-card p-4"
      >
        <p className="label-caps text-muted">Add a document</p>
        <div className="mt-3 flex flex-col gap-3">
          <input
            name="title"
            required
            maxLength={120}
            placeholder="e.g. Certificate of insurance 2026"
            className="rounded border border-line bg-card px-3 py-2 text-[14px] outline-none focus:border-ink"
          />
          <div className="flex flex-wrap gap-3">
            <select
              name="category"
              defaultValue="minutes"
              className="rounded border border-line bg-card px-3 py-2 text-[14px] outline-none focus:border-ink"
            >
              {CATEGORY_ORDER.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              name="url"
              inputMode="url"
              placeholder="Link · optional (Drive, Dropbox…)"
              className="data-mono min-w-0 flex-1 rounded border border-line bg-card px-3 py-2 text-[13px] outline-none focus:border-ink"
            />
          </div>
          <div>
            <button
              type="submit"
              className="rounded bg-ink px-4 py-2 text-[14px] font-medium text-paper"
            >
              Add to vault
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 flex flex-col gap-6">
        {CATEGORY_ORDER.map(({ key, label, note }) => {
          const docs = byCategory.get(key) ?? [];
          return (
            <section key={key}>
              <div className="mortar flex items-baseline justify-between pb-1.5">
                <h2 className="font-display text-base font-medium">{label}</h2>
                <span className="label-caps text-muted">{note}</span>
              </div>
              {docs.length === 0 ? (
                <p className="mt-2 text-[14px] text-muted">Nothing on file.</p>
              ) : (
                <ul className="mt-2 divide-y divide-line rounded-md border border-line bg-card">
                  {docs.map((doc) => (
                    <li key={doc.id} className="flex items-baseline gap-3 p-3">
                      <span className="data-mono shrink-0 text-muted">
                        {doc.uploadedAt}
                      </span>
                      <span className="min-w-0 flex-1">
                        {doc.url ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            {doc.title}
                          </a>
                        ) : (
                          doc.title
                        )}
                      </span>
                      <form action={removeDocument}>
                        <input type="hidden" name="id" value={doc.id} />
                        <button
                          type="submit"
                          className="shrink-0 text-[13px] text-muted underline"
                        >
                          Remove
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
