import { describe, expect, it } from "vitest";
import type { RuntimeConfig } from "./env";
import {
  consumeOAuthState,
  createOAuthState,
  readInstagramSession,
  sessionCookie,
} from "./security";
import { redactForModel } from "./fixtures";

const config: RuntimeConfig = {
  appOrigin: "https://coinscout.live",
  deepSeekApiKey: null,
  deepSeekModel: "deepseek-flash",
  instagramAppId: "test-app",
  instagramAppSecret: "test-secret",
  instagramRedirectUri: "https://coinscout.live/api/instagram/callback",
  metaGraphApiVersion: "v1.0",
  oauthSessionEncryptionKey: "test-encryption-key",
  oauthStateSecret: "test-state-secret",
  mode: "fixture",
};

describe("OAuth session boundaries", () => {
  it("accepts a matching, fresh state only once", () => {
    const state = createOAuthState(config);
    expect(state).not.toBeNull();
    const event = {
      httpMethod: "GET",
      headers: { cookie: state!.cookie.split(";")[0] },
    };

    expect(consumeOAuthState(event, state!.value, config)).toBe(true);
    expect(consumeOAuthState(event, state!.value, config)).toBe(false);
    expect(consumeOAuthState(event, "tampered", config)).toBe(false);
  });

  it("keeps an Instagram token inside an encrypted HttpOnly session", () => {
    const cookie = sessionCookie(
      {
        accessToken: "never-client-visible",
        expiresAt: Date.now() + 60_000,
        media: [],
        profile: { id: "123", username: "authorized_test_account" },
        version: 1,
      },
      config,
    );

    expect(cookie).toContain("HttpOnly");
    expect(cookie).not.toContain("never-client-visible");
    const restored = readInstagramSession(
      { httpMethod: "GET", headers: { cookie: cookie!.split(";")[0] } },
      config,
    );
    expect(restored?.profile.username).toBe("authorized_test_account");
  });
});

it("redacts prices and contact details before a model payload is formed", () => {
  const safe = redactForModel("$510 shipped; email seller@example.com or call +1 212 555 0199");
  expect(safe).not.toMatch(/510|seller@example\.com|212/);
});
