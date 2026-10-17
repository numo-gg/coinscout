import { hasInstagramConfiguration, runtimeConfig } from "./_shared/env";
import { json, methodNotAllowed, type NetlifyHandler } from "./_shared/http";
import { readInstagramSession } from "./_shared/security";

/**
 * Returns only the short, seller-visible media metadata needed to choose a post.
 * The access token and token-bearing media URL stay encrypted server-side.
 */
export const handler: NetlifyHandler = async (event) => {
  if (event.httpMethod !== "GET") return methodNotAllowed("GET");

  const config = runtimeConfig();
  if (config.mode !== "live" || !hasInstagramConfiguration(config)) {
    return json(200, { connected: false, mode: "fixture" });
  }

  const session = readInstagramSession(event, config);
  if (!session) return json(200, { connected: false, mode: "live" });

  return json(200, {
    connected: true,
    mode: "live",
    profile: { username: session.profile.username },
    media: session.media.map(({ id, caption, mediaType, permalink, timestamp }) => ({
      id,
      caption,
      mediaType,
      permalink,
      timestamp,
    })),
  });
};
