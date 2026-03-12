import { NextRequest, NextResponse } from "next/server";

const SITE_PASSWORD = process.env.SITE_PASSWORD || "ppw2026";

export function middleware(request: NextRequest) {
  // Skip password check for API routes and static assets
  if (
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get("ppw-auth");
  if (authCookie?.value === "authenticated") {
    return NextResponse.next();
  }

  // Check if this is a login POST
  if (
    request.nextUrl.pathname === "/login" &&
    request.method === "GET"
  ) {
    return NextResponse.next();
  }

  // Redirect to login page if not authenticated
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /login (the login page itself)
     * - /api/auth (the auth endpoint)
     * - /_next (Next.js internals)
     * - /favicon.ico, /icons, etc.
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
