import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth-token";

// Routes accessibles sans authentification (page de login, endpoints d'auth).
const PUBLIC_PATHS = ["/login", "/api/login", "/api/logout"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques : accès libre
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET;
  // Si la config d'auth n'est pas définie, on laisse passer (mode permissif
  // pour ne pas casser le développement local avant que les vars d'env
  // soient configurées). En prod, AUTH_SECRET DOIT être défini.
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[auth] AUTH_SECRET non défini en production — accès libre");
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const username = token ? await verifyAuthToken(token, secret) : null;

  if (!username) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Conserve la cible originale pour rediriger après login
    if (pathname !== "/") url.searchParams.set("next", pathname + request.nextUrl.search);
    else url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Exclut les assets statiques et le service worker du matcher.
  matcher: [
    "/((?!_next/static|_next/image|icons/|manifest\\.json|sw\\.js|favicon\\.ico|file\\.svg|globe\\.svg|next\\.svg|vercel\\.svg|window\\.svg).*)",
  ],
};
