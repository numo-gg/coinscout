import { appUrl, runtimeConfig } from "./_shared/env";
import { error, formValue, json, methodNotAllowed, type NetlifyHandler } from "./_shared/http";
import { clearInstagramSessionCookie, clearStateCookie, deletionCode, signedRequestUserId } from "./_shared/security";

export const handler: NetlifyHandler = async (event) => {
  if (event.httpMethod === "GET") {
    return json(200, {
      data_retention: "CoinScout does not retain Instagram access tokens or listing data after the encrypted 15-minute session ends.",
      status: "See /data-deletion for the public deletion instructions.",
    });
  }
  if (event.httpMethod !== "POST") return methodNotAllowed("GET", "POST");

  const config = runtimeConfig();
  const userId = signedRequestUserId(formValue(event, "signed_request"), config.instagramAppSecret);
  if (config.mode === "live" && !userId) return error(400, "invalid_deletion_request");

  const code = userId && config.oauthStateSecret ? deletionCode(userId, config.oauthStateSecret) : "fixture-no-persistent-data";
  const confirmationUrl = appUrl(config, `/data-deletion?confirmation_code=${encodeURIComponent(code)}`);
  return {
    ...json(200, { confirmation_code: code, url: confirmationUrl }),
    multiValueHeaders: { "Set-Cookie": [clearInstagramSessionCookie(), clearStateCookie()] },
  };
};
