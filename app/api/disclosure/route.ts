import { createElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { buildDisclosureData } from "@/lib/disclosure";
import DisclosureDocument from "@/lib/disclosure-pdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const data = await buildDisclosureData();
  if (!data) {
    return new Response("No building on file — run setup first.", { status: 404 });
  }

  const element = createElement(DisclosureDocument, { data }) as ReactElement<DocumentProps>;
  const pdf = await renderToBuffer(element);
  const slug = data.building.address.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="section-22-1-${slug}.pdf"`,
    },
  });
}
