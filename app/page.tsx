export default function Home() {
  return (
    <>
      <h1 className="font-display text-[28px] font-semibold">
        The building&rsquo;s record
      </h1>
      <p className="mt-2 text-muted">
        Permit history, capital timeline, and §22.1 disclosures.
      </p>

      <section className="mt-10">
        <h2 className="mortar pb-2 font-display text-xl font-medium">
          Capital timeline
        </h2>
        <div className="mt-4 rounded-md border border-line bg-card p-4">
          <p className="label-caps text-muted">Coming in build step 3</p>
          <p className="mt-2">
            Seed data and the timeline land next. This shell carries the fonts,
            tokens, and layout rules they build on.
          </p>
          <p className="data-mono mt-3 text-muted">
            Roof &rsquo;14 · Masonry &rsquo;08 · Boiler &rsquo;15 · Porch —
          </p>
        </div>
      </section>
    </>
  );
}
