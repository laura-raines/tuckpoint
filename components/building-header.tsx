import { cookies } from "next/headers";
import Link from "next/link";
import { signOut } from "@/app/login/actions";

export default async function BuildingHeader() {
  const signedIn = (await cookies()).has("steward");

  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-5xl items-baseline justify-between px-6 py-3">
        <Link href="/" className="font-display text-xl font-semibold">
          Tuckpoint
        </Link>
        {signedIn && (
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-muted underline">
              Sign out
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
