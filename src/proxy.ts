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
  if (!secret) {
    // En dev local : mode permissif pour ne pas casser le DX avant que les
    // vars d'env soient configurées.
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.next();
    }
    // En production : on REFUSE l'accès. Sans secret, le cookie ne peut pas
    // être validé → laisser passer reviendrait à désactiver silencieusement
    // l'authentification.
    return new NextResponse(
      "Configuration d'authentification manquante côté serveur. " +
      "Définissez AUTH_USERNAME, AUTH_PASSWORD et AUTH_SECRET dans les " +
      "variables d'environnement Vercel, puis redéployez.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
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
