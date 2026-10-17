import { runtimeConfig } from "./_shared/env";
import { error, formValue, json, methodNotAllowed, type NetlifyHandler } from "./_shared/http";
import { clearInstagramSessionCookie, clearStateCookie, signedRequestUserId } from "./_shared/security";

export const handler: NetlifyHandler = async (event) => {
  if (event.httpMethod !== "POST") return methodNotAllowed("POST");

  const config = runtimeConfig();
  const userId = signedRequestUserId(formValue(event, "signed_request"), config.instagramAppSecret);
  if (config.mode === "live" && !userId) return error(400, "invalid_deauthorization_request");

  // Atlas has no database, token refresh, or durable Instagram profile store. The only possible
  // client-side remnant is an encrypted, 15-minute HttpOnly session, which this response clears.
  return {
    ...json(200, { success: true }),
    multiValueHeaders: { "Set-Cookie": [clearInstagramSessionCookie(), clearStateCookie()] },
  };
};
