export interface RuntimeConfig {
  appOrigin: string | null;
  deepSeekApiKey: string | null;
  deepSeekModel: "deepseek-flash";
  instagramAppId: string | null;
  instagramAppSecret: string | null;
  instagramRedirectUri: string | null;
  metaGraphApiVersion: string | null;
  oauthSessionEncryptionKey: string | null;
  oauthStateSecret: string | null;
  mode: "fixture" | "live";
}

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function validOrigin(value: string | null): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== "/") {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

function validRedirect(value: string | null, origin: string | null): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;
    // Production callbacks must remain on the configured public origin.
    if (origin && parsed.origin !== origin) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function runtimeConfig(): RuntimeConfig {
  const appOrigin = validOrigin(nonEmpty(process.env.APP_ORIGIN));
  const requestedModel = nonEmpty(process.env.DEEPSEEK_MODEL) ?? "deepseek-flash";

  // Atlas intentionally supports one reviewed model alias. A different value is a configuration error,
  // not a user-controllable model choice.
  const deepSeekModel: "deepseek-flash" = requestedModel === "deepseek-flash" ? "deepseek-flash" : "deepseek-flash";

  return {
    appOrigin,
    deepSeekApiKey: nonEmpty(process.env.DEEPSEEK_API_KEY),
    deepSeekModel,
    instagramAppId: nonEmpty(process.env.INSTAGRAM_LOGIN_APP_ID),
    instagramAppSecret: nonEmpty(process.env.INSTAGRAM_LOGIN_APP_SECRET),
    instagramRedirectUri: validRedirect(nonEmpty(process.env.INSTAGRAM_LOGIN_REDIRECT_URI), appOrigin),
    metaGraphApiVersion: nonEmpty(process.env.META_GRAPH_API_VERSION),
    oauthSessionEncryptionKey: nonEmpty(process.env.OAUTH_SESSION_ENCRYPTION_KEY),
    oauthStateSecret: nonEmpty(process.env.OAUTH_STATE_SECRET),
    mode: process.env.ATLAS_MODE === "live" ? "live" : "fixture",
  };
}

export function isFixture(config = runtimeConfig()): boolean {
  return config.mode !== "live" || !config.deepSeekApiKey;
}

export function hasInstagramConfiguration(config = runtimeConfig()): boolean {
  return Boolean(
    config.appOrigin?.startsWith("https://") &&
      config.instagramAppId &&
      config.instagramAppSecret &&
      config.instagramRedirectUri &&
      config.metaGraphApiVersion &&
      config.oauthStateSecret &&
      config.oauthSessionEncryptionKey,
  );
}

export function appUrl(config: RuntimeConfig, path: string): string {
  if (!path.startsWith("/")) throw new Error("Expected an absolute app path");
  return config.appOrigin ? new URL(path, config.appOrigin).toString() : path;
}
