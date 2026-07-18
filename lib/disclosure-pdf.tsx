import path from "node:path";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Svg,
  Line,
  Text,
  View,
} from "@react-pdf/renderer";
import { pendingItems, type DisclosureData } from "./disclosure";
import { windowLabel } from "./timeline";

const font = (file: string) => path.join(process.cwd(), "public/fonts", file);

Font.register({
  family: "Zilla Slab",
  fonts: [
    { src: font("zilla-slab-500.ttf"), fontWeight: 500 },
    { src: font("zilla-slab-600.ttf"), fontWeight: 600 },
  ],
});
Font.register({
  family: "Public Sans",
  fonts: [
    { src: font("public-sans-400.ttf"), fontWeight: 400 },
    { src: font("public-sans-500.ttf"), fontWeight: 500 },
  ],
});
Font.register({
  family: "IBM Plex Mono",
  fonts: [
    { src: font("plex-mono-400.ttf"), fontWeight: 400 },
    { src: font("plex-mono-500.ttf"), fontWeight: 500 },
  ],
});
Font.registerHyphenationCallback((word) => [word]);

const INK = "#1F2A3D";
const MUTED = "#77716A";
const LINE = "#DDD9CF";

const s = StyleSheet.create({
  page: {
    paddingTop: 64,
    paddingBottom: 76,
    paddingHorizontal: 64,
    fontFamily: "Public Sans",
    fontSize: 10,
    color: INK,
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 64,
    right: 64,
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    color: MUTED,
    fontSize: 7.5,
  },
  mono: { fontFamily: "IBM Plex Mono" },
  muted: { color: MUTED },
  h2: {
    fontFamily: "Zilla Slab",
    fontWeight: 600,
    fontSize: 13,
    marginTop: 18,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: INK,
  },
  para: { marginTop: 4 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    paddingVertical: 3,
  },
  headRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: INK,
    paddingBottom: 2,
    marginTop: 6,
  },
  headCell: { fontSize: 7.5, letterSpacing: 0.8, textTransform: "uppercase", color: MUTED },
});

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text>
        Prepared from records maintained by the association. This document is
        not legal advice.
      </Text>
      <Text
        style={s.mono}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

function Hatch() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" style={{ marginRight: 6, marginTop: 1.5 }}>
      {[0, 4, 8, 12].map((offset) => (
        <Line
          key={offset}
          x1={offset - 6}
          y1={12}
          x2={offset + 6}
          y2={0}
          stroke={LINE}
          strokeWidth={1.5}
        />
      ))}
      <Line x1={0.5} y1={0.5} x2={11.5} y2={0.5} stroke={LINE} strokeWidth={1} />
      <Line x1={0.5} y1={11.5} x2={11.5} y2={11.5} stroke={LINE} strokeWidth={1} />
      <Line x1={0.5} y1={0.5} x2={0.5} y2={11.5} stroke={LINE} strokeWidth={1} />
      <Line x1={11.5} y1={0.5} x2={11.5} y2={11.5} stroke={LINE} strokeWidth={1} />
    </Svg>
  );
}

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function DisclosureDocument({ data }: { data: DisclosureData }) {
  const { building, units, documents, decisions, recentMoney, twoYearWindows, narrative } =
    data;
  const govDocs = documents.filter((d) =>
    ["declaration", "bylaws", "rules"].includes(d.category),
  );
  const insuranceDocs = documents.filter((d) => d.category === "insurance");
  const pending = pendingItems(data);

  return (
    <Document
      title={`Section 22.1 Disclosure Statement — ${building.address}`}
      author="Prepared via Tuckpoint from association records"
    >
      {/* Cover */}
      <Page size="LETTER" style={s.page}>
        <Footer />
        <View style={{ marginTop: 150 }}>
          <Text style={{ fontFamily: "Zilla Slab", fontWeight: 600, fontSize: 26, lineHeight: 1.2 }}>
            {building.address}
          </Text>
          <Text style={[s.mono, s.muted, { fontSize: 9, marginTop: 10 }]}>
            CHICAGO, ILLINOIS · {building.unitCount} UNITS
            {building.yearBuilt != null ? ` · BUILT ${building.yearBuilt}` : ""}
            {building.pin ? ` · PIN ${building.pin}` : ""}
          </Text>
          <View style={{ borderBottomWidth: 1.5, borderBottomColor: INK, marginVertical: 22 }} />
          <Text style={{ fontFamily: "Zilla Slab", fontWeight: 500, fontSize: 17 }}>
            Section 22.1 Disclosure Statement
          </Text>
          <Text style={[s.muted, { marginTop: 4 }]}>
            Illinois Condominium Property Act, 765 ILCS 605/22.1
          </Text>
          <Text style={[s.mono, { fontSize: 9, marginTop: 30 }]}>
            Generated {data.generatedAt}
          </Text>
          <Text style={[s.muted, { marginTop: 4 }]}>
            Prepared via Tuckpoint from association records.
          </Text>
        </View>
      </Page>

      {/* Body */}
      <Page size="LETTER" style={s.page}>
        <Footer />
        <Text style={s.h2}>1 · Declaration, bylaws, and rules</Text>
        {govDocs.length > 0 ? (
          govDocs.map((d) => (
            <View key={d.id} style={s.row}>
              <Text style={{ flex: 1 }}>{d.title}</Text>
              <Text style={[s.mono, { fontSize: 9 }]}>{d.category}</Text>
            </View>
          ))
        ) : (
          <Text style={[s.para, s.muted]}>
            No governing documents on file with Tuckpoint. Copies are available
            from the association upon request.
          </Text>
        )}

        <Text style={s.h2}>2 · Liens and unit account</Text>
        <View style={s.headRow}>
          <Text style={[s.headCell, { flex: 2 }]}>Unit</Text>
          <Text style={[s.headCell, { flex: 2 }]}>Owner of record</Text>
          <Text style={[s.headCell, { flex: 1, textAlign: "right" }]}>Ownership</Text>
          <Text style={[s.headCell, { flex: 1, textAlign: "right" }]}>Unpaid balance</Text>
        </View>
        {units.map((u) => (
          <View key={u.id} style={s.row}>
            <Text style={{ flex: 2 }}>{u.label}</Text>
            <Text style={{ flex: 2 }}>{u.ownerName || "not on file"}</Text>
            <Text style={[s.mono, { flex: 1, fontSize: 9, textAlign: "right" }]}>
              {u.ownershipPct}%
            </Text>
            <Text style={[s.mono, { flex: 1, fontSize: 9, textAlign: "right" }]}>
              {dollars.format(u.arrears)}
            </Text>
          </View>
        ))}
        <Text style={[s.para, s.muted]}>No liens on file.</Text>

        <Text style={s.h2}>3 · Anticipated capital expenditures (next two years)</Text>
        {twoYearWindows.length > 0 && (
          <>
            <View style={s.headRow}>
              <Text style={[s.headCell, { flex: 2 }]}>System</Text>
              <Text style={[s.headCell, { flex: 1 }]}>Window</Text>
              <Text style={[s.headCell, { flex: 2, textAlign: "right" }]}>Estimated cost</Text>
              <Text style={[s.headCell, { flex: 1.4, textAlign: "right" }]}>From reserves</Text>
              <Text style={[s.headCell, { flex: 1.4, textAlign: "right" }]}>Assessed</Text>
            </View>
            {twoYearWindows.map((w) => (
              <View key={w.system.id} style={s.row}>
                <Text style={{ flex: 2 }}>{w.system.name}</Text>
                <Text style={[s.mono, { flex: 1, fontSize: 9 }]}>{windowLabel(w.window)}</Text>
                <Text style={[s.mono, { flex: 2, fontSize: 9, textAlign: "right" }]}>
                  {dollars.format(w.system.estCostLow ?? 0)}–{dollars.format(w.system.estCostHigh ?? 0)}
                </Text>
                <Text style={[s.mono, { flex: 1.4, fontSize: 9, textAlign: "right" }]}>
                  {dollars.format(w.reserveDraw)}
                </Text>
                <Text style={[s.mono, { flex: 1.4, fontSize: 9, textAlign: "right" }]}>
                  {dollars.format(w.assessmentTotal)}
                </Text>
              </View>
            ))}
          </>
        )}
        <Text style={s.para}>{narrative.capital}</Text>
        {decisions.length > 0 && (
          <>
            <Text style={[s.para, { fontWeight: 500 }]}>Approved decisions on file:</Text>
            {decisions.map((d) => (
              <View key={d.id} style={{ flexDirection: "row", marginTop: 2 }}>
                <Text style={[s.mono, { fontSize: 9, marginRight: 8 }]}>{d.date}</Text>
                <Text style={{ flex: 1 }}>
                  {d.decision?.summary ?? d.title}
                  {d.decision?.vote ? ` (voted ${d.decision.vote}, filed)` : ""}
                </Text>
              </View>
            ))}
          </>
        )}
        <Text style={[s.para, s.muted, { fontSize: 8.5 }]}>
          A projection from public records and typical lifespans — not an
          inspection.
        </Text>

        <Text style={s.h2}>4 · Reserve fund status</Text>
        <Text style={[s.mono, { fontSize: 11, marginTop: 4 }]}>
          {dollars.format(building.reserves.balance)}
          <Text style={[s.muted, { fontSize: 9 }]}>  as of {building.reserves.asOf}</Text>
        </Text>
        <Text style={s.para}>{narrative.reserves}</Text>

        <Text style={s.h2}>5 · Receipts and disbursements (trailing twelve months)</Text>
        {recentMoney.length > 0 ? (
          recentMoney.map((e) => (
            <View key={e.id} style={s.row}>
              <Text style={[s.mono, { fontSize: 9, marginRight: 8 }]}>{e.date}</Text>
              <Text style={{ flex: 1 }}>{e.title}</Text>
              <Text style={[s.mono, { fontSize: 9 }]}>{dollars.format(e.cost ?? 0)}</Text>
            </View>
          ))
        ) : (
          <Text style={[s.para, s.muted]}>
            No costed activity recorded in the trailing twelve months.
          </Text>
        )}
        <Text style={[s.para, s.muted]}>
          Recorded activity only; the complete ledger is maintained by the
          association.
        </Text>

        <Text style={s.h2}>6 · Pending suits and judgments</Text>
        <Text style={s.para}>
          None known to the association as of the generation date.
        </Text>

        <Text style={s.h2}>7 · Insurance</Text>
        {insuranceDocs.length > 0 ? (
          insuranceDocs.map((d) => (
            <View key={d.id} style={s.row}>
              <Text style={{ flex: 1 }}>{d.title}</Text>
              <Text style={[s.mono, { fontSize: 9 }]}>on file</Text>
            </View>
          ))
        ) : (
          <Text style={[s.para, s.muted]}>
            Certificate of insurance — not on file. Evidence of coverage is
            available from the association.
          </Text>
        )}
      </Page>

      {/* Items pending confirmation */}
      <Page size="LETTER" style={s.page}>
        <Footer />
        <Text style={s.h2}>Items pending association confirmation</Text>
        <Text style={[s.para, s.muted]}>
          Listed so nothing is silently omitted. Each item stays visible here
          until the association confirms it.
        </Text>
        <View style={{ marginTop: 8 }}>
          {pending.map((item) => (
            <View key={item} style={{ flexDirection: "row", marginTop: 5 }}>
              <Hatch />
              <Text style={{ flex: 1 }}>{item}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
