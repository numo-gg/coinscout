import { z } from "zod";

import type { RuntimeConfig } from "./env";

const API_BASE = "https://api.deepseek.com";
const USER_AGENT = "CoinScout/1.0 (+https://coinscout.live)";

class UpstreamError extends Error {}

export class TimeoutError extends UpstreamError {}

export class InvalidUpstreamResponseError extends UpstreamError {}

function deadlineSignal(timeoutMs: number): AbortSignal {
  return AbortSignal.timeout(timeoutMs);
}

async function checkedJson(response: Response): Promise<unknown> {
  if (!response.ok) throw new UpstreamError("upstream_request_failed");
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new InvalidUpstreamResponseError("invalid_upstream_json");
  }
}

function authorization(config: RuntimeConfig): Record<string, string> {
  if (!config.deepSeekApiKey) throw new UpstreamError("missing_provider_configuration");
  return {
    Authorization: `Bearer ${config.deepSeekApiKey}`,
    "Content-Type": "application/json",
    "User-Agent": USER_AGENT,
  };
}

export async function createStructuredResponse(
  config: RuntimeConfig,
  request: {
    input: Array<Record<string, unknown>>;
    instructions: string;
    schema: Record<string, unknown>;
    schemaName: string;
  },
): Promise<unknown> {
  try {
    const response = await fetch(`${API_BASE}/responses`, {
      method: "POST",
      headers: authorization(config),
      signal: deadlineSignal(20_000),
      body: JSON.stringify({
        model: config.deepSeekModel,
        input: request.input,
        instructions: request.instructions,
        max_output_tokens: 900,
        reasoning: { effort: "none" },
        store: false,
        stream: false,
        text: {
          format: {
            type: "json_schema",
            name: request.schemaName,
            schema: request.schema,
          },
        },
      }),
    });
    return checkedJson(response);
  } catch (caught) {
    if ((caught as { name?: string }).name === "TimeoutError") throw new TimeoutError("upstream_timeout");
    throw caught;
  }
}

const responsesEnvelope = z
  .object({
    output: z.array(
      z
        .object({
          type: z.string(),
          content: z
            .array(
              z
                .object({
                  type: z.string(),
                  text: z.string().optional(),
                })
                .passthrough(),
            )
            .optional(),
        })
        .passthrough(),
    ),
    status: z.string(),
  })
  .passthrough();

export function responseJsonPayload(response: unknown): unknown | null {
  const parsed = responsesEnvelope.safeParse(response);
  if (!parsed.success || parsed.data.status !== "completed") return null;
  const text = parsed.data.output
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((part) => part.type === "output_text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("");

  if (!text || text.length > 24_000) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

const searchResultSchema = z
  .object({
    authority: z.number().optional(),
    content: z.string().optional(),
    rerank_score: z.number().optional(),
    site_name: z.string().nullable().optional(),
    snippet: z.string(),
    summary: z.string(),
    title: z.string(),
    url: z.string().url(),
  })
  .passthrough();

const searchResponseSchema = z.object({ results: z.array(searchResultSchema) }).passthrough();

export type SearchResult = z.infer<typeof searchResultSchema>;

export async function searchPublicPages(config: RuntimeConfig, searchQuery: string): Promise<SearchResult[]> {
  if (searchQuery.length === 0 || searchQuery.length > 128) throw new InvalidUpstreamResponseError("invalid_search_query");

  try {
    const response = await fetch(`${API_BASE}/v1/tools/search`, {
      method: "POST",
      headers: authorization(config),
      signal: deadlineSignal(12_000),
      body: JSON.stringify({ count: 3, need_content: false, ori_question: searchQuery, query: searchQuery }),
    });
    const parsed = searchResponseSchema.safeParse(await checkedJson(response));
    if (!parsed.success) throw new InvalidUpstreamResponseError("invalid_search_response");
    return parsed.data.results;
  } catch (caught) {
    if ((caught as { name?: string }).name === "TimeoutError") throw new TimeoutError("search_timeout");
    throw caught;
  }
}

const fetchResponseSchema = z
  .object({
    content: z.string().optional(),
    markdown: z.string().optional(),
    text: z.string().optional(),
    title: z.string().optional(),
    url: z.string().url().optional(),
  })
  .passthrough();

export interface FetchedPage {
  content: string;
  title: string;
  url: string;
}

/** Fetches only URLs selected from DeepSeek Search; it never follows user-supplied URLs. */
export async function fetchPublicPage(config: RuntimeConfig, url: string): Promise<FetchedPage> {
  try {
    const response = await fetch(`${API_BASE}/v1/tools/fetch`, {
      method: "POST",
      headers: authorization(config),
      signal: deadlineSignal(12_000),
      body: JSON.stringify({ url }),
    });
    const parsed = fetchResponseSchema.safeParse(await checkedJson(response));
    if (!parsed.success) throw new InvalidUpstreamResponseError("invalid_fetch_response");
    const content = (parsed.data.content ?? parsed.data.markdown ?? parsed.data.text ?? "").trim();
    if (!content) throw new InvalidUpstreamResponseError("empty_fetch_response");
    return {
      content: content.slice(0, 4_000),
      title: (parsed.data.title ?? "Public page").slice(0, 180),
      url: parsed.data.url ?? url,
    };
  } catch (caught) {
    if ((caught as { name?: string }).name === "TimeoutError") throw new TimeoutError("fetch_timeout");
    throw caught;
  }
}

function hostIsPublic(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return false;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) return false;
  if (host.includes(":")) return false;
  return !["instagram.com", "facebook.com", "tiktok.com", "x.com", "twitter.com"].some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
}

export function isAllowedResearchUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && hostIsPublic(parsed.hostname) && value.length <= 2_048;
  } catch {
    return false;
  }
}

export async function instagramImageDataUrl(value: string): Promise<string | null> {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  const isInstagramCdn = host.endsWith(".cdninstagram.com") || host.endsWith(".fbcdn.net") || host.endsWith(".instagram.com");
  if (parsed.protocol !== "https:" || !isInstagramCdn) return null;

  try {
    const response = await fetch(parsed, {
      headers: { Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8", "User-Agent": USER_AGENT },
      redirect: "error",
      signal: deadlineSignal(12_000),
    });
    const contentType = response.headers.get("content-type")?.split(";")[0]?.toLowerCase();
    const length = Number(response.headers.get("content-length") ?? "0");
    if (!response.ok || !contentType?.startsWith("image/") || length > 4_000_000) return null;

    const reader = response.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { done, value: chunk } = await reader.read();
      if (done) break;
      if (!chunk) continue;
      received += chunk.byteLength;
      if (received > 4_000_000) {
        await reader.cancel();
        return null;
      }
      chunks.push(chunk);
    }
    return `data:${contentType};base64,${Buffer.concat(chunks).toString("base64")}`;
  } catch {
    return null;
  }
}
