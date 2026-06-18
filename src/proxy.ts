import { NextResponse } from "next/server";
import { auth } from "@/auth";

const protectedPrefixes = [
  "/dashboard",
  "/training",
  "/play",
  "/pao",
  "/cards",
  "/routes",
  "/palaces",
  "/my-memory-palace",
  "/build-palace",
  "/history",
  "/sessions",
  "/leaderboard",
  "/leaderboard-dashboard",
  "/reviews",
  "/profile",
  "/settings"
];

const authPages = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const isAuthPage = authPages.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", `${req.nextUrl.pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && req.auth) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)"
  ]
};
