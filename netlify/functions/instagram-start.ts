import { appUrl, hasInstagramConfiguration, runtimeConfig } from "./_shared/env";
import { methodNotAllowed, redirect, type NetlifyHandler } from "./_shared/http";
import { createOAuthState } from "./_shared/security";

export const handler: NetlifyHandler = async (event) => {
  if (event.httpMethod !== "GET") return methodNotAllowed("GET");

  const config = runtimeConfig();
  if (config.mode !== "live" || !hasInstagramConfiguration(config)) {
    return redirect(appUrl(config, "/scout?instagram=fixture"));
  }

  const state = createOAuthState(config);
  if (!state || !config.instagramAppId || !config.instagramRedirectUri) {
    return redirect(appUrl(config, "/scout?instagram=unavailable"));
  }

  const authorize = new URL("https://www.instagram.com/oauth/authorize");
  authorize.searchParams.set("client_id", config.instagramAppId);
  authorize.searchParams.set("redirect_uri", config.instagramRedirectUri);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "instagram_business_basic");
  authorize.searchParams.set("state", state.value);
  // These flags keep the app in the documented Instagram Login flow rather than Facebook Login.
  authorize.searchParams.set("enable_fb_login", "0");
  authorize.searchParams.set("force_authentication", "1");

  return redirect(authorize.toString(), 303, { "Set-Cookie": state.cookie });
};
