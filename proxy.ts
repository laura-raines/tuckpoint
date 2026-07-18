import { NextResponse, type NextRequest } from "next/server";

// Fake logged-in steward (per CLAUDE.md, real auth is out of scope): a plain
// session cookie gates the pages. Signed out, the root serves the landing
// page and everything else returns to it.
export function proxy(request: NextRequest) {
  if (request.cookies.has("steward")) return NextResponse.next();
  if (request.nextUrl.pathname === "/") return NextResponse.next();
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  // Everything except the login page, API routes, and static assets.
  matcher: ["/((?!login|api|_next|.*\\..*).*)"],
};
