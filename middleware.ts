// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = new Set<string>(["/", "/login", "/register"]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/auth/") || // NextAuth endpoints must stay public
    pathname === "/favicon.ico"
  )
    return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  const token = await getToken({ req });
  const isAuthed = !!token?.sub;

  if (!isAuthed) {
    if (pathname.startsWith("/api/")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/auth).*)"],
};
