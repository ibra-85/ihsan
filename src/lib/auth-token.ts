/**
 * Token d'authentification signé HMAC-SHA256.
 *
 * Format : `<username-encodé>.<signature-hex>`. La signature dépend du
 * username + d'un secret côté serveur (AUTH_SECRET). Un attaquant ne peut
 * pas forger un token sans connaître le secret.
 *
 * Utilise uniquement Web Crypto API → compatible Edge runtime (middleware).
 */

const enc = new TextEncoder();

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) return new Uint8Array();
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return arr;
}

export const AUTH_COOKIE = "ihsan-auth";

export async function createAuthToken(username: string, secret: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(username));
  return `${encodeURIComponent(username)}.${toHex(sig)}`;
}

export async function verifyAuthToken(token: string, secret: string): Promise<string | null> {
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const encodedUser = token.slice(0, dot);
  const sigHex = token.slice(dot + 1);
  let username: string;
  try {
    username = decodeURIComponent(encodedUser);
  } catch {
    return null;
  }
  const sig = fromHex(sigHex);
  if (sig.byteLength === 0) return null;
  const key = await hmacKey(secret);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sig as unknown as ArrayBuffer,
    enc.encode(username),
  );
  return valid ? username : null;
}
