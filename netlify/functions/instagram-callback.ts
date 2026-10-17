import { appUrl, hasInstagramConfiguration, runtimeConfig } from "./_shared/env";
import { createInstagramSession } from "./_shared/instagram";
import { methodNotAllowed, query, redirect, type NetlifyHandler } from "./_shared/http";
import { clearStateCookie, consumeOAuthState, sessionCookie } from "./_shared/security";

function scoutLocation(config: ReturnType<typeof runtimeConfig>, result: string): string {
  return appUrl(config, `/scout?instagram=${encodeURIComponent(result)}`);
}

export const handler: NetlifyHandler = async (event) => {
  if (event.httpMethod !== "GET") return methodNotAllowed("GET");

  const config = runtimeConfig();
  const receivedState = query(event, "state");
  const code = query(event, "code");
  const stateIsValid = consumeOAuthState(event, receivedState, config);
  const callbackHeaders = { "Set-Cookie": clearStateCookie() };

  if (!stateIsValid || !hasInstagramConfiguration(config) || !code || code.length > 2_048) {
    return redirect(scoutLocation(config, "denied"), 303, callbackHeaders);
  }

  try {
    const session = await createInstagramSession(code, config);
    const encryptedCookie = sessionCookie(session, config);
    if (!encryptedCookie) return redirect(scoutLocation(config, "unavailable"), 303, callbackHeaders);

    return {
      ...redirect(scoutLocation(config, "connected")),
      multiValueHeaders: { "Set-Cookie": [clearStateCookie(), encryptedCookie] },
    };
  } catch {
    return redirect(scoutLocation(config, "denied"), 303, callbackHeaders);
  }
};
