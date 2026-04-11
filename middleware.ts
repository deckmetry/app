import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
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
    pathname.startsWith("/proposals/") ||
    pathname.startsWith("/embed/") ||
    pathname.startsWith("/bom/") ||
    pathname.startsWith("/estimate") ||
    pathname.startsWith("/projects/accept/") ||
    pathname.startsWith("/for/") ||
    pathname === "/features";

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

    // Role-based dashboard access — redirect to correct dashboard if wrong role
    const isDashboardRoute =
      pathname.startsWith("/homeowner") ||
      pathname.startsWith("/contractor") ||
      pathname.startsWith("/supplier");

    if (isDashboardRoute) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabase = createServerClient(supabaseUrl, supabaseKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        });

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Master admins can access any dashboard via role switcher cookie
          const adminView = request.cookies.get("deckmetry-admin-view")?.value;
          if (adminView) {
            // Master admin with active view set — allow access to that dashboard
            // (Actual master admin verification happens in dashboard layout)
            return response;
          }

          const role = (user.user_metadata?.role as string) ?? "homeowner";
          const correctBasePath = `/${role}`;

          // If user is on wrong dashboard, redirect to their correct one
          if (
            (pathname.startsWith("/homeowner") && role !== "homeowner") ||
            (pathname.startsWith("/contractor") && role !== "contractor") ||
            (pathname.startsWith("/supplier") && role !== "supplier")
          ) {
            return NextResponse.redirect(new URL(correctBasePath, request.url));
          }
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon-light-32x32.png|icon-dark-32x32.png|icon.svg|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
