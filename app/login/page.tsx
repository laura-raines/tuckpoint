import { signIn } from "./actions";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="w-full max-w-sm rounded-md border border-line bg-card p-8 text-center">
        <p className="font-display text-[28px] font-semibold">Tuckpoint</p>
        <p className="mt-2 text-muted">
          The building&rsquo;s record — permit history, capital timeline, and
          the seller&rsquo;s packet.
        </p>
        <form action={signIn} className="mt-6">
          <button
            type="submit"
            className="w-full rounded bg-ink px-4 py-2.5 text-[14px] font-medium text-paper"
          >
            Sign in as steward
          </button>
        </form>
        <p className="mt-3 text-[12px] text-muted">
          Demo session — no password.
        </p>
      </div>
    </div>
  );
}
