import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";
import { type NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check portal auth (except login page)
  const portalPattern = /^\/(?:vi|en)\/portal(?!\/(login))(\/|$)/;
  if (portalPattern.test(pathname)) {
    const session = request.cookies.get("nuedu_session");
    if (!session?.value) {
      const locale = pathname.split("/")[1] ?? "vi";
      const loginUrl = new URL(`/${locale}/portal/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)"],
};
