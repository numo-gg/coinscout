type ApiEnvelope = {
  mode?: "fixture" | "live";
  reason?: string;
  status?: string;
};

export type InstagramMediaOption = {
  id: string;
  caption: string;
  mediaType: "CAROUSEL_ALBUM" | "IMAGE" | "VIDEO";
  permalink: string;
  timestamp?: string;
};

export type InstagramConnection = ApiEnvelope & {
  connected: boolean;
  media?: InstagramMediaOption[];
  profile?: { username: string };
};

export type RemoteListingAnalysis = {
  conditionNotes: string[];
  confidence: number;
  denomination: string | null;
  keyFacts: string[];
  mintMark: string | null;
  title: string;
  uncertainties: string[];
  variety: string | null;
  year: string | null;
};

export type RemoteProspect = {
  confidence: number;
  evidenceExcerpt: string;
  name: string;
  relevance: string;
  sourceUrl: string;
  uncertainty: string;
};

export type RemoteOutreachDraft = { subject: string; body: string };

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(path, {
      credentials: "same-origin",
      headers: init?.body ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
      ...init,
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function getInstagramConnection(): Promise<InstagramConnection | null> {
  return request<InstagramConnection>("/api/instagram/session");
}

export function analyzeInstagramMedia(mediaId: string): Promise<(ApiEnvelope & { analysis?: RemoteListingAnalysis }) | null> {
  return request("/api/ai/analyze", {
    method: "POST",
    body: JSON.stringify({ approved: true, mediaId }),
  });
}

export function researchApprovedListing(listingDescription: string): Promise<(ApiEnvelope & { research?: { prospects: RemoteProspect[]; summary: string } }) | null> {
  return request("/api/ai/research", {
    method: "POST",
    body: JSON.stringify({ approved: true, listingDescription }),
  });
}

export function draftApprovedOutreach(
  listingDescription: string,
  prospect: { name: string; sourceUrl: string },
): Promise<(ApiEnvelope & { draft?: RemoteOutreachDraft }) | null> {
  return request("/api/ai/draft", {
    method: "POST",
    body: JSON.stringify({ approved: true, listingDescription, prospect }),
  });
}
