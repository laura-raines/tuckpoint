import { NextResponse, type NextRequest } from "next/server";

// Fake logged-in steward (per CLAUDE.md, real auth is out of scope): a plain
// session cookie gates the pages so the demo has a front door.
export function proxy(request: NextRequest) {
  if (request.cookies.has("steward")) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Everything except the login page, API routes, and static assets.
  matcher: ["/((?!login|api|_next|.*\\..*).*)"],
};
