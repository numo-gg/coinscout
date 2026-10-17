import { z } from "zod";

import type { RuntimeConfig } from "./env";
import type { InstagramMedia, InstagramSession } from "./security";

const tokenResponseSchema = z.object({
  access_token: z.string().min(1).max(2_048),
  user_id: z.union([z.string(), z.number()]),
});

const profileResponseSchema = z.object({
  user_id: z.union([z.string(), z.number()]).optional(),
  id: z.union([z.string(), z.number()]).optional(),
  username: z.string().min(1).max(120),
});

const rawMediaSchema = z.object({
  caption: z.string().optional(),
  id: z.union([z.string(), z.number()]),
  media_type: z.enum(["CAROUSEL_ALBUM", "IMAGE", "VIDEO"]),
  media_url: z.string().url().optional(),
  permalink: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  timestamp: z.string().optional(),
});

const mediaResponseSchema = z.object({ data: z.array(rawMediaSchema).max(50) });

function authorizationError(): Error {
  // Purposefully generic: the caller must not learn whether a code/token was valid.
  return new Error("instagram_authorization_failed");
}

function validInstagramMediaUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    const normalized = parsed.toString();
    return parsed.protocol === "https:" && normalized.length <= 800 && (host.endsWith(".cdninstagram.com") || host.endsWith(".fbcdn.net"))
      ? normalized
      : undefined;
  } catch {
    return undefined;
  }
}

function stripControlCharacters(value: string, max: number): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function sanitizeMedia(raw: z.infer<typeof rawMediaSchema>): InstagramMedia {
  const imageUrl = raw.media_type === "VIDEO" ? validInstagramMediaUrl(raw.thumbnail_url) : validInstagramMediaUrl(raw.media_url);
  return {
    id: String(raw.id),
    // This encrypted cookie is intentionally short-lived and must remain below browser cookie limits.
    caption: stripControlCharacters(raw.caption ?? "", 600),
    imageUrl,
    mediaType: raw.media_type,
    permalink: raw.permalink.slice(0, 500),
    timestamp: raw.timestamp,
  };
}

async function checkedJson(response: Response): Promise<unknown> {
  if (!response.ok) throw authorizationError();
  try {
    return (await response.json()) as unknown;
  } catch {
    throw authorizationError();
  }
}

export async function createInstagramSession(code: string, config: RuntimeConfig): Promise<InstagramSession> {
  if (!config.instagramAppId || !config.instagramAppSecret || !config.instagramRedirectUri || !config.metaGraphApiVersion) {
    throw authorizationError();
  }

  const exchangeBody = new URLSearchParams({
    client_id: config.instagramAppId,
    client_secret: config.instagramAppSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.instagramRedirectUri,
  });

  let token: z.infer<typeof tokenResponseSchema>;
  try {
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: exchangeBody,
      signal: AbortSignal.timeout(15_000),
    });
    const parsed = tokenResponseSchema.safeParse(await checkedJson(tokenResponse));
    if (!parsed.success) throw authorizationError();
    token = parsed.data;
  } catch {
    throw authorizationError();
  }

  const graphBase = `https://graph.instagram.com/${encodeURIComponent(config.metaGraphApiVersion)}`;
  const profileUrl = new URL(`${graphBase}/me`);
  profileUrl.searchParams.set("fields", "user_id,username");
  profileUrl.searchParams.set("access_token", token.access_token);

  let profile: z.infer<typeof profileResponseSchema>;
  try {
    const profileResponse = await fetch(profileUrl, { signal: AbortSignal.timeout(12_000) });
    const parsed = profileResponseSchema.safeParse(await checkedJson(profileResponse));
    if (!parsed.success) throw authorizationError();
    profile = parsed.data;
  } catch {
    throw authorizationError();
  }

  const profileId = String(profile.user_id ?? profile.id ?? token.user_id);
  const mediaUrl = new URL(`${graphBase}/${encodeURIComponent(profileId)}/media`);
  mediaUrl.searchParams.set("fields", "id,caption,media_type,media_url,permalink,timestamp,thumbnail_url");
  mediaUrl.searchParams.set("limit", "10");
  mediaUrl.searchParams.set("access_token", token.access_token);

  let media: InstagramMedia[] = [];
  try {
    const mediaResponse = await fetch(mediaUrl, { signal: AbortSignal.timeout(12_000) });
    const parsed = mediaResponseSchema.safeParse(await checkedJson(mediaResponse));
    if (!parsed.success) throw authorizationError();
    // Atlas imports one seller-selected post per short session. Retaining more would risk exceeding
    // the browser's cookie limit and is unnecessary for the stated flow.
    media = parsed.data.data.map(sanitizeMedia).filter((item) => Boolean(item.imageUrl)).slice(0, 1);
  } catch {
    // A successful role-authorized login may have no eligible import media. Preserve the login
    // session but do not surface Graph diagnostics or tokens to the browser.
    media = [];
  }

  return {
    accessToken: token.access_token,
    expiresAt: Date.now() + 15 * 60 * 1_000,
    media,
    profile: { id: profileId, username: stripControlCharacters(profile.username, 120) },
    version: 1,
  };
}
