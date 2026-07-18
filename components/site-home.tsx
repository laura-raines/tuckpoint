import { signIn } from "@/app/login/actions";
import KilnCanvas from "./kiln-canvas";

// Marketing homepage — ported faithfully from design/tuckpoint-home.html.
// Scoped under `.site` so its warmer palette + Source Serif 4 never touch app
// routes. The address CTA and "Start your record" route into onboarding.

function Mark({ className }: { className?: string }) {
  return (
    <span className={`mark ${className ?? ""}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export default function SiteHome() {
  return (
    <div className="site">
      <nav>
        <a className="wordmark" href="#top">
          <Mark />
          Tuckpoint
        </a>
        <div className="links">
          <a href="#reveal">How it works</a>
          <a href="#timeline">The timeline</a>
          <a href="#packet">Seller&rsquo;s Packet</a>
          <a href="#pricing">Pricing</a>
          <form action={signIn}>
            <button className="btn" type="submit">
              Start your record
            </button>
          </form>
        </div>
      </nav>

      <header id="top">
        <KilnCanvas />
        <div className="hero-veil" />
        <div className="hero-inner">
          <p className="kicker">
            The building&rsquo;s memory · for Chicago&rsquo;s self-managed condos
          </p>
          <div className="hero-sig">
            <Mark />
            <h1>Tuckpoint</h1>
          </div>
          <p className="hero-sub">
            The shared record for two-, three-, and six-flats with no property
            manager — what&rsquo;s been done, what&rsquo;s due next, what each
            owner&rsquo;s share will be, and the Seller&rsquo;s Packet the day
            anyone sells.
          </p>
          <form className="addr" action={signIn}>
            <input
              type="text"
              placeholder="2847 W PALMER ST"
              aria-label="Building address"
            />
            <button type="submit">Find my building</button>
          </form>
          <p className="addr-note">
            We start with Chicago&rsquo;s public permit records — the city
            already knows your roof.
          </p>
        </div>
      </header>

      <section id="reveal">
        <div className="rule-head">
          <h2>The record writes itself first</h2>
          <span className="no">01 — CITY RECORDS</span>
        </div>
        <div className="reveal-grid">
          <div className="reveal-copy">
            <h3>Type your address. We do the archaeology.</h3>
            <p>
              Chicago publishes every building permit going back decades.
              Tuckpoint reads them before asking you for anything — so your
              building&rsquo;s maintenance history arrives mostly written, and
              you just confirm it.
            </p>
            <p>
              No blank forms. No hunting through a previous owner&rsquo;s email.
              The record starts full.
            </p>
          </div>
          <div className="permit-card">
            <p className="ph">2847 W Palmer St · 3 units · b. 1908</p>
            <div className="permit-row found">
              <span className="dt">2014.06</span>
              <span className="what">Roof — modified bitumen</span>
              <span className="amt">$18,400</span>
            </div>
            <div className="permit-row found">
              <span className="dt">2008.04</span>
              <span className="what">Masonry repair, north wall</span>
              <span className="amt">$9,200</span>
            </div>
            <div className="permit-row">
              <span className="dt">2025.10</span>
              <span className="what">Boiler serviced — added by Unit 1</span>
              <span className="amt">$340</span>
            </div>
            <div className="permit-row">
              <span className="dt">2026.05</span>
              <span className="what">Voted 3–0: defer porch to 2027</span>
              <span className="amt" style={{ color: "var(--filed)" }}>
                FILED
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="timeline">
        <div className="rule-head">
          <h2>See the next big expense coming</h2>
          <span className="no">02 — CAPITAL TIMELINE</span>
        </div>
        <div className="tl-wrap">
          <div className="tl-years">
            <span>2008</span>
            <span>2016</span>
            <span>2024</span>
            <span>2032</span>
            <span>2040</span>
          </div>
          <div className="tl-row">
            <span className="lbl">Roof</span>
            <div className="tl-track">
              <span className="today" style={{ left: "56%" }} />
              <div className="bar solid" style={{ left: "19%", width: "37%" }}>
                Roof &rsquo;14
              </div>
              <div className="bar proj" style={{ left: "75%", width: "14%" }}>
                &rsquo;32–36
              </div>
            </div>
          </div>
          <div className="tl-row">
            <span className="lbl">Masonry</span>
            <div className="tl-track">
              <div
                className="bar solid older"
                style={{ left: 0, width: "56%" }}
              >
                Masonry &rsquo;08
              </div>
              <div
                className="bar proj near"
                style={{ left: "62%", width: "12%" }}
              >
                &rsquo;28–31
              </div>
            </div>
          </div>
          <div className="tl-row">
            <span className="lbl">Boiler</span>
            <div className="tl-track">
              <div className="bar solid" style={{ left: "22%", width: "34%" }}>
                Boiler &rsquo;15
              </div>
              <div className="bar proj" style={{ left: "69%", width: "13%" }}>
                &rsquo;33–37
              </div>
            </div>
          </div>
          <div className="tl-row">
            <span className="lbl">Porch</span>
            <div className="tl-track">
              <div className="bar gap" style={{ left: 0, width: "38%" }}>
                no permit record — add date
              </div>
            </div>
          </div>
          <p className="tl-note">
            Solid = documented · dashed = projected window · hatched = honest
            gap. A projection from public records and typical lifespans — not an
            inspection.
          </p>
        </div>
      </section>

      <section id="math">
        <div className="rule-head">
          <h2>Turn a scary assessment into a monthly number</h2>
          <span className="no">03 — FUNDING MATH</span>
        </div>
        <div className="math-grid">
          <div className="math-cell">
            <p className="k">Projected — tuckpointing</p>
            <p className="v due">~$22,000</p>
            <p className="d">
              Window 2028–2031, from permit history and typical masonry life.
            </p>
          </div>
          <div className="math-cell">
            <p className="k">Your building&rsquo;s policy</p>
            <p className="v">50 / 50</p>
            <p className="d">
              Half from reserves, half by special assessment — split by
              ownership %, equally, or however your building agreed.
            </p>
          </div>
          <div className="math-cell">
            <p className="k">Unit 2&rsquo;s share</p>
            <p className="v">
              $95
              <span style={{ fontSize: "15px", color: "var(--muted)" }}>
                /mo
              </span>
            </p>
            <p className="d">
              ~$3,740 total — calm and planned, starting now instead of all at
              once in 2029.
            </p>
          </div>
        </div>
        <p className="math-line">
          Every projection becomes <span className="mono">your number</span> —
          so the big repair arrives as a plan, never an ambush.
        </p>
      </section>

      <section id="packet">
        <div className="rule-head">
          <h2>Sellable in one click</h2>
          <span className="no">04 — SELLER&rsquo;S PACKET</span>
        </div>
        <div className="packet">
          <div className="doc">
            <p className="dh">Section 22.1 Disclosure Statement</p>
            <div className="di">
              <span>Declaration, bylaws &amp; rules</span>
              <span>ON FILE</span>
            </div>
            <div className="di">
              <span>Liens &amp; unit account statement</span>
              <span>CURRENT</span>
            </div>
            <div className="di">
              <span>Anticipated capital expenditures</span>
              <span>COMPUTED</span>
            </div>
            <div className="di">
              <span>Reserve fund status</span>
              <span>$14,200</span>
            </div>
            <div className="di">
              <span>Receipts &amp; disbursements</span>
              <span>FY 2025</span>
            </div>
            <div className="di pending">
              <span>Pending suits or judgments</span>
              <span>NONE</span>
            </div>
            <p className="stampline">
              Generated 2026.07.18 · 14:32 · from records maintained by the
              association. Not legal advice.
            </p>
          </div>
          <div className="packet-copy">
            <h3>When a unit sells, Illinois gives you 10 business days.</h3>
            <p>
              Every condo resale requires the association to produce a §22.1
              disclosure — and self-managed buildings have no manager to make
              one. Tuckpoint generates it from your living record in minutes:
              computed, current, and honest about anything unknown.
            </p>
            <p>
              Not a folder of old PDFs — a document assembled from the
              building&rsquo;s actual state, the day it&rsquo;s needed.
            </p>
            <span className="price-tag">
              $149–249 per packet · paid by the selling owner
            </span>
          </div>
        </div>
      </section>

      <section id="pricing">
        <div className="rule-head">
          <h2>Priced under the &ldquo;call a meeting&rdquo; threshold</h2>
          <span className="no">05 — PRICING</span>
        </div>
        <div className="price-grid">
          <div className="price-card feature">
            <p className="pn">The Building Record</p>
            <p className="pv">
              $50<small> / building / year</small>
            </p>
            <p style={{ color: "var(--ink-soft)", fontSize: "15px" }}>
              One owner can just expense it. The association owns the record
              forever.
            </p>
            <ul>
              <li>Permit history auto-imported from city records</li>
              <li>Capital timeline with projected windows &amp; cost ranges</li>
              <li>Funding policy &amp; per-unit share math</li>
              <li>Decisions, votes &amp; minutes that survive owner turnover</li>
              <li>Document vault &amp; monthly owner digest</li>
            </ul>
          </div>
          <div className="price-card">
            <p className="pn">Seller&rsquo;s Packet</p>
            <p className="pv">
              $149<small> when a unit sells</small>
            </p>
            <p style={{ color: "var(--ink-soft)", fontSize: "15px" }}>
              Generated from the live record. Paid by the selling owner,
              delivered in minutes.
            </p>
            <ul>
              <li>Complete §22.1 statutory structure</li>
              <li>Capital expenditures computed, not remembered</li>
              <li>Timestamped record of what the association affirmed</li>
              <li>Gap page for anything honestly unknown</li>
            </ul>
          </div>
        </div>
      </section>

      <footer>
        <div className="foot-inner">
          <div>
            <p
              className="slab"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Mark className="foot-mark" />
              Tuckpoint
            </p>
            <p className="fm" style={{ marginTop: "8px" }}>
              The building&rsquo;s memory. Chicago, IL.
            </p>
          </div>
          <p className="fm">
            BUILT ON CHICAGO OPEN DATA
            <br />
            PREPARED FROM ASSOCIATION RECORDS · NOT LEGAL ADVICE
            <br />© 2026 TUCKPOINT
          </p>
        </div>
      </footer>
    </div>
  );
}
