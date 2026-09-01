const COOKIE_NAME = "erkanoglu_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

const textEncoder = new TextEncoder();

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) throw new Error("ADMIN_PASSWORD is not configured.");
  return password;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getAdminPassword()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, textEncoder.encode(value)));
}

async function sha256(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", textEncoder.encode(value)));
}

function equalBytes(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

export async function passwordMatches(candidate: string) {
  if (!candidate) return false;
  const [candidateHash, expectedHash] = await Promise.all([sha256(candidate), sha256(getAdminPassword())]);
  return equalBytes(candidateHash, expectedHash);
}

export async function createAdminToken() {
  const issuedAt = Math.floor(Date.now() / 1000);
  const signature = await hmac(String(issuedAt));
  return `${issuedAt}.${toBase64Url(signature)}`;
}

export async function verifyAdminToken(token: string | undefined) {
  if (!token) return false;

  try {
    const separator = token.indexOf(".");
    if (separator <= 0) return false;

    const issuedAt = Number(token.slice(0, separator));
    if (!Number.isSafeInteger(issuedAt) || issuedAt <= 0) return false;

    const now = Math.floor(Date.now() / 1000);
    if (issuedAt > now + 60 || now - issuedAt > SESSION_TTL_SECONDS) return false;

    const signature = fromBase64Url(token.slice(separator + 1));
    const expected = await hmac(String(issuedAt));
    return equalBytes(signature, expected);
  } catch {
    return false;
  }
}

export { COOKIE_NAME, SESSION_TTL_SECONDS };
