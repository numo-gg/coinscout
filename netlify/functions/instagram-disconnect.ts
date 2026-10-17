import { json, methodNotAllowed, type NetlifyHandler } from "./_shared/http";
import { clearInstagramSessionCookie, clearStateCookie } from "./_shared/security";

export const handler: NetlifyHandler = async (event) => {
  if (event.httpMethod !== "POST") return methodNotAllowed("POST");
  return {
    ...json(200, { disconnected: true }),
    multiValueHeaders: { "Set-Cookie": [clearInstagramSessionCookie(), clearStateCookie()] },
  };
};
