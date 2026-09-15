import type { NextRequest } from "next/server";
import { auth } from "./auth";

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const START_PAGE = "/dashboard";
const LOGIN_PAGE = "/login";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/_error" ||
    pathname === "/_not-found" ||
    pathname === "/404" ||
    pathname === "/500"
  ) {
    return;
  }

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isApiI18nRoute = pathname.startsWith("/api/i18n");
  const isStatic = /\.(.*)$/.test(pathname);

  if (isApiAuthRoute || isApiI18nRoute || isStatic) return;

  const session = await auth();
  const isLoggedIn = !!session?.user;

  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return Response.redirect(new URL(START_PAGE, request.nextUrl));
  }

  if (!isLoggedIn && !isPublic) {
    const url = new URL(LOGIN_PAGE, request.nextUrl);
    url.searchParams.set("callbackUrl", pathname);
    return Response.redirect(url);
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
