import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import type { RuntimeConfig } from "./env";
import { header, type NetlifyEvent } from "./http";

const OAUTH_STATE_COOKIE = "atlas_oauth_state";
const INSTAGRAM_SESSION_COOKIE = "atlas_instagram_session";
const STATE_TTL_SECONDS = 10 * 60;
const SESSION_TTL_SECONDS = 15 * 60;
const consumedStates = new Map<string, number>();

export interface InstagramMedia {
  caption: string;
  id: string;
  imageUrl?: string;
  mediaType: "CAROUSEL_ALBUM" | "IMAGE" | "VIDEO";
  permalink: string;
  timestamp?: string;
}

export interface InstagramSession {
  accessToken: string;
  expiresAt: number;
  media: InstagramMedia[];
  profile: {
    id: string;
    username: string;
  };
  version: 1;
}

function base64UrlEncode(value: Buffer | string): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Buffer | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  } catch {
    return null;
  }
}

function equal(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function cookieValue(event: NetlifyEvent, name: string): string | undefined {
  const cookieHeader = header(event, "cookie");
  if (!cookieHeader) return undefined;

  return cookieHeader.split(";").reduce<string | undefined>((found, part) => {
    if (found) return found;
    const separator = part.indexOf("=");
    if (separator < 1) return undefined;
    const key = part.slice(0, separator).trim();
    if (key !== name) return undefined;
    return part.slice(separator + 1).trim();
  }, undefined);
}

function cookie(name: string, value: string, maxAge: number, path: string): string {
  return `${name}=${value}; Max-Age=${maxAge}; Path=${path}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearStateCookie(): string {
  return cookie(OAUTH_STATE_COOKIE, "", 0, "/api/instagram/callback");
}

export function clearInstagramSessionCookie(): string {
  return cookie(INSTAGRAM_SESSION_COOKIE, "", 0, "/api");
}

export function createOAuthState(config: RuntimeConfig): { cookie: string; value: string } | null {
  if (!config.oauthStateSecret) return null;
  const issuedAt = Math.floor(Date.now() / 1000);
  const nonce = base64UrlEncode(randomBytes(32));
  const payload = `${issuedAt}.${nonce}`;
  const signature = base64UrlEncode(createHmac("sha256", config.oauthStateSecret).update(payload).digest());
  const value = `${payload}.${signature}`;

  return { cookie: cookie(OAUTH_STATE_COOKIE, value, STATE_TTL_SECONDS, "/api/instagram/callback"), value };
}

function purgeConsumedStates(now: number): void {
  for (const [nonce, expiresAt] of consumedStates) {
    if (expiresAt <= now) consumedStates.delete(nonce);
  }
}

/** Validates a signed, double-submit, short-lived OAuth state and consumes it once. */
export function consumeOAuthState(event: NetlifyEvent, received: string | undefined, config: RuntimeConfig): boolean {
  if (!received || !config.oauthStateSecret || !equal(received, cookieValue(event, OAUTH_STATE_COOKIE) ?? "")) {
    return false;
  }

  const pieces = received.split(".");
  if (pieces.length !== 3) return false;
  const [issuedAtRaw, nonce, signature] = pieces;
  if (!/^\d{10}$/.test(issuedAtRaw) || !nonce || !signature) return false;

  const issuedAt = Number(issuedAtRaw);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(issuedAt) || issuedAt > now + 30 || now - issuedAt > STATE_TTL_SECONDS) return false;

  const expected = base64UrlEncode(
    createHmac("sha256", config.oauthStateSecret).update(`${issuedAtRaw}.${nonce}`).digest(),
  );
  if (!equal(signature, expected)) return false;

  purgeConsumedStates(now);
  if (consumedStates.has(nonce)) return false;
  consumedStates.set(nonce, now + STATE_TTL_SECONDS);
  return true;
}

function sessionKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

export function encryptInstagramSession(session: InstagramSession, config: RuntimeConfig): string | null {
  if (!config.oauthSessionEncryptionKey) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", sessionKey(config.oauthSessionEncryptionKey), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(session), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${base64UrlEncode(iv)}.${base64UrlEncode(tag)}.${base64UrlEncode(encrypted)}`;
}

export function sessionCookie(session: InstagramSession, config: RuntimeConfig): string | null {
  const encrypted = encryptInstagramSession(session, config);
  if (!encrypted) return null;
  const serialized = cookie(INSTAGRAM_SESSION_COOKIE, encrypted, SESSION_TTL_SECONDS, "/api");
  // Browsers commonly reject cookies above 4096 bytes. Fail closed rather than silently
  // truncating an encrypted token-bearing session.
  return Buffer.byteLength(serialized, "utf8") <= 3_800 ? serialized : null;
}

function validMedia(value: unknown): value is InstagramMedia {
  if (!value || typeof value !== "object") return false;
  const media = value as Partial<InstagramMedia>;
  return (
    typeof media.id === "string" &&
    typeof media.caption === "string" &&
    typeof media.permalink === "string" &&
    (media.mediaType === "IMAGE" || media.mediaType === "VIDEO" || media.mediaType === "CAROUSEL_ALBUM") &&
    (media.imageUrl === undefined || typeof media.imageUrl === "string")
  );
}

function validSession(value: unknown): value is InstagramSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<InstagramSession>;
  return (
    session.version === 1 &&
    typeof session.accessToken === "string" &&
    typeof session.expiresAt === "number" &&
    session.expiresAt > Date.now() &&
    Array.isArray(session.media) &&
    session.media.every(validMedia) &&
    Boolean(session.profile && typeof session.profile.id === "string" && typeof session.profile.username === "string")
  );
}

/** Returns only server-side session data; callers must never serialize this object. */
export function readInstagramSession(event: NetlifyEvent, config: RuntimeConfig): InstagramSession | null {
  const encrypted = cookieValue(event, INSTAGRAM_SESSION_COOKIE);
  if (!encrypted || !config.oauthSessionEncryptionKey) return null;
  const pieces = encrypted.split(".");
  if (pieces.length !== 4 || pieces[0] !== "v1") return null;
  const iv = base64UrlDecode(pieces[1]);
  const tag = base64UrlDecode(pieces[2]);
  const ciphertext = base64UrlDecode(pieces[3]);
  if (!iv || !tag || !ciphertext || iv.length !== 12 || tag.length !== 16) return null;

  try {
    const decipher = createDecipheriv("aes-256-gcm", sessionKey(config.oauthSessionEncryptionKey), iv);
    decipher.setAuthTag(tag);
    const raw = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
    const parsed: unknown = JSON.parse(raw);
    return validSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function signedRequestUserId(signedRequest: string | undefined, appSecret: string | null): string | null {
  if (!signedRequest || !appSecret) return null;
  const [signature, payload] = signedRequest.split(".");
  if (!signature || !payload || signedRequest.split(".").length !== 2) return null;
  const expected = base64UrlEncode(createHmac("sha256", appSecret).update(payload).digest());
  if (!equal(signature, expected)) return null;

  const decoded = base64UrlDecode(payload);
  if (!decoded) return null;
  try {
    const parsed: unknown = JSON.parse(decoded.toString("utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    const userId = (parsed as { user_id?: unknown }).user_id;
    return typeof userId === "string" && userId.length <= 128 ? userId : null;
  } catch {
    return null;
  }
}

export function deletionCode(userId: string, secret: string): string {
  return base64UrlEncode(createHmac("sha256", secret).update(`delete:${userId}`).digest()).slice(0, 24);
}
