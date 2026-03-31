import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MEMBER_ROUTES = ["/dashboard", "/calendar", "/announcements", "/forum", "/profile"];
const ADMIN_ROUTES = ["/admin"];

export async function proxy(req: NextRequest) {
  const { nextUrl } = req;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

  const isMemberRoute = MEMBER_ROUTES.some((r) => nextUrl.pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => nextUrl.pathname.startsWith(r));

  if (isAdminRoute) {
    if (!isLoggedIn || (role !== "ADMIN" && role !== "OFFICER")) {
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
    "/admin/:path*",
  ],
};
