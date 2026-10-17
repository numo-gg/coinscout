export interface NetlifyEvent {
  body?: string | null;
  headers: Record<string, string | undefined>;
  httpMethod: string;
  isBase64Encoded?: boolean;
  queryStringParameters?: Record<string, string | undefined> | null;
}

export interface NetlifyContext {
  clientContext?: unknown;
}

export interface NetlifyResponse {
  body: string;
  headers?: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  statusCode: number;
}

export type NetlifyHandler = (
  event: NetlifyEvent,
  context: NetlifyContext,
) => Promise<NetlifyResponse> | NetlifyResponse;

const JSON_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

export function json(statusCode: number, body: unknown, headers: Record<string, string> = {}): NetlifyResponse {
  return {
    statusCode,
    headers: { ...JSON_HEADERS, ...headers },
    body: JSON.stringify(body),
  };
}

export function empty(statusCode = 204, headers: Record<string, string> = {}): NetlifyResponse {
  return {
    statusCode,
    headers: { "Cache-Control": "no-store, max-age=0", ...headers },
    body: "",
  };
}

export function redirect(location: string, statusCode = 303, headers: Record<string, string> = {}): NetlifyResponse {
  return {
    statusCode,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      Location: location,
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
    body: "",
  };
}

export function error(statusCode: number, code: string, retryAfterSeconds?: number): NetlifyResponse {
  return retryAfterSeconds
    ? json(statusCode, { error: code }, { "Retry-After": String(retryAfterSeconds) })
    : json(statusCode, { error: code });
}

export function methodNotAllowed(...methods: string[]): NetlifyResponse {
  return json(405, { error: "method_not_allowed" }, { Allow: methods.join(", ") });
}

/** Reads a header without relying on Netlify's header casing. */
export function header(event: NetlifyEvent, name: string): string | undefined {
  const expected = name.toLowerCase();
  return Object.entries(event.headers).find(([key]) => key.toLowerCase() === expected)?.[1];
}

export function query(event: NetlifyEvent, name: string): string | undefined {
  return event.queryStringParameters?.[name];
}

export function requestBody(event: NetlifyEvent, maxBytes = 32_768): string | null {
  const raw = event.body ?? "";
  // Base64 can be ~4/3 larger than the decoded payload.
  if (raw.length > maxBytes * 1.5 + 8) return null;

  try {
    const decoded = event.isBase64Encoded ? Buffer.from(raw, "base64").toString("utf8") : raw;
    return Buffer.byteLength(decoded, "utf8") <= maxBytes ? decoded : null;
  } catch {
    return null;
  }
}

export function requestJson(event: NetlifyEvent, maxBytes = 32_768): unknown | null {
  const body = requestBody(event, maxBytes);
  if (!body) return null;

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}

export function formValue(event: NetlifyEvent, name: string): string | undefined {
  const body = requestBody(event, 16_384);
  if (!body) return undefined;
  try {
    return new URLSearchParams(body).get(name) ?? undefined;
  } catch {
    return undefined;
  }
}

export function clientIp(event: NetlifyEvent): string {
  // Netlify sets this header at the edge. Do not fall back to caller-controlled forwarding chains.
  const direct = header(event, "x-nf-client-connection-ip");
  if (direct && direct.length <= 64) return direct;
  return "unknown";
}
