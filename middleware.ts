import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/pricing" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/proposals/");

  if (!isPublicRoute) {
    const hasAuthCookie = request.cookies
      .getAll()
      .some(
        (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
      );

    if (!hasAuthCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon-light-32x32.png|icon-dark-32x32.png|icon.svg|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
