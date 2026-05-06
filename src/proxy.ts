import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isBoardOrAdminRole } from "@/lib/roles";

const MEMBER_ROUTES = ["/dashboard", "/calendar", "/announcements", "/forum", "/profile", "/my-commitments", "/members"];
const ADMIN_ROUTES = ["/admin"];

export async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  const secureToken = await getToken({
    req,
    secret,
    cookieName: "__Secure-authjs.session-token",
  });

  const localToken = secureToken
    ? null
    : await getToken({
        req,
        secret,
        cookieName: "authjs.session-token",
      });

  const token = secureToken ?? localToken;
  const tokenSource = secureToken ? "__Secure-authjs.session-token" : localToken ? "authjs.session-token" : null;

  console.error("[auth] Proxy token check", {
    pathname: nextUrl.pathname,
    hasToken: Boolean(token),
    tokenSource,
    hasSecureCookie: req.cookies.has("__Secure-authjs.session-token"),
    hasLocalCookie: req.cookies.has("authjs.session-token"),
    role: token?.role ?? null,
  });

  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

  const isMemberRoute = MEMBER_ROUTES.some((r) => nextUrl.pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => nextUrl.pathname.startsWith(r));

  if (isAdminRoute) {
    if (!isLoggedIn || !isBoardOrAdminRole(role)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (isMemberRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role === "PENDING") {
      return NextResponse.redirect(new URL("/pending-approval", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/calendar/:path*",
    "/announcements/:path*",
    "/forum/:path*",
    "/profile/:path*",
    "/my-commitments/:path*",
    "/members/:path*",
    "/admin/:path*",
  ],
};
