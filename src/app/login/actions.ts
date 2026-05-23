"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, createAuthToken } from "@/lib/auth-token";

const ONE_MONTH = 60 * 60 * 24 * 30;

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const nextRaw = String(formData.get("next") || "/");
  // Empêche les redirections ouvertes (open redirect) vers un domaine externe
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";

  const expectedUser = process.env.AUTH_USERNAME;
  const expectedPass = process.env.AUTH_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!expectedUser || !expectedPass || !secret) {
    return { error: "Configuration d'authentification manquante côté serveur." };
  }

  // Comparaison en temps constant pour ne pas leaker via timing.
  const userOk = constantTimeEq(username, expectedUser);
  const passOk = constantTimeEq(password, expectedPass);
  if (!userOk || !passOk) {
    return { error: "Identifiants invalides." };
  }

  const token = await createAuthToken(username, secret);
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_MONTH,
  });

  redirect(next);
}

function constantTimeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
