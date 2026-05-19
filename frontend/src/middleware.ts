import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getStoredToken, getCurrentTenant } from "@/lib/auth/store";
import { parseJWT, isSuperuser } from "@/lib/auth/jwt";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth needed
  if (pathname === "/login" || pathname === "/login/tenant-select") {
    return NextResponse.next();
  }

  // Get token from localStorage (client-side)
  // For SSR, we use cookies — but for MVP we redirect to login if no token
  const token = getStoredToken();

  // Superuser routes
  if (pathname.startsWith("/superuser")) {
    if (!token || !isSuperuser(token)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Admin routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const payload = parseJWT(token);
    if (payload.role === "resident") {
      return NextResponse.redirect(new URL("/resident", request.url));
    }
    if (!getCurrentTenant()) {
      return NextResponse.redirect(new URL("/login/tenant-select", request.url));
    }
    return NextResponse.next();
  }

  // Resident routes
  if (pathname.startsWith("/resident")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const payload = parseJWT(token);
    if (payload.role !== "resident") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Vigilancia routes
  if (pathname.startsWith("/vigilancia")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const payload = parseJWT(token);
    if (payload.role !== "vigilancia" && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/resident", request.url));
    }
    return NextResponse.next();
  }

  // Default: redirect to login
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/superuser/:path*",
    "/dashboard/:path*",
    "/resident/:path*",
    "/vigilancia/:path*",
  ],
};
