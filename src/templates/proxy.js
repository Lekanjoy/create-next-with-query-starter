import { NextResponse } from "next/server";

const publicRoutes = ["/login"];

export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const hasAccessToken = Boolean(request.cookies.get("accessToken")?.value);
  const hasRefreshToken = Boolean(request.cookies.get("refreshToken")?.value);
  const isAuthenticated = hasAccessToken && hasRefreshToken;

  const isPublicRoute = publicRoutes.includes(pathname);

  if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*", "/login"],
};
