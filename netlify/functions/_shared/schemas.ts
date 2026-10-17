import { z } from "zod";

const approved = z.literal(true);
const cleanText = (max: number) => z.string().trim().min(1).max(max);
const publicUrl = z.string().url().max(2_048).refine((value) => value.startsWith("https://"), "HTTPS URL required");

export const ListingAnalysisRequestSchema = z
  .object({
    approved: approved,
    caption: cleanText(6_000).optional(),
    mediaId: z.string().trim().min(1).max(160).optional(),
  })
  .strict()
  .refine((input) => Boolean(input.caption || input.mediaId), "Choose a listing or provide an approved caption");

export const ListingAnalysisSchema = z
  .object({
    conditionNotes: z.array(cleanText(240)).max(6),
    confidence: z.number().min(0).max(1),
    denomination: cleanText(120).nullable(),
    keyFacts: z.array(cleanText(240)).min(1).max(8),
    mintMark: cleanText(32).nullable(),
    title: cleanText(180),
    uncertainties: z.array(cleanText(240)).max(6),
    variety: cleanText(120).nullable(),
    year: cleanText(16).nullable(),
  })
  .strict();

export const ProspectResearchRequestSchema = z
  .object({
    approved: approved,
    listingDescription: cleanText(1_200),
    marketFocus: cleanText(180).optional(),
  })
  .strict();

export const ProspectSchema = z
  .object({
    confidence: z.number().min(0).max(1),
    evidenceExcerpt: cleanText(360),
    name: cleanText(140),
    relevance: cleanText(300),
    sourceUrl: publicUrl,
    uncertainty: cleanText(240),
  })
  .strict();

export const ProspectResearchSchema = z
  .object({
    prospects: z.array(ProspectSchema).min(1).max(3),
    summary: cleanText(360),
  })
  .strict();

export const OutreachDraftRequestSchema = z
  .object({
    approved: approved,
    listingDescription: cleanText(1_200),
    prospect: z
      .object({
        name: cleanText(140),
        sourceUrl: publicUrl,
      })
      .strict(),
  })
  .strict();

export const OutreachDraftSchema = z
  .object({
    body: cleanText(1_000),
    subject: cleanText(160),
  })
  .strict();

export type ListingAnalysis = z.infer<typeof ListingAnalysisSchema>;
export type ProspectResearch = z.infer<typeof ProspectResearchSchema>;
export type OutreachDraft = z.infer<typeof OutreachDraftSchema>;

export const listingAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "year", "denomination", "mintMark", "variety", "conditionNotes", "keyFacts", "confidence", "uncertainties"],
  properties: {
    title: { type: "string", minLength: 1, maxLength: 180 },
    year: { type: ["string", "null"], maxLength: 16 },
    denomination: { type: ["string", "null"], maxLength: 120 },
    mintMark: { type: ["string", "null"], maxLength: 32 },
    variety: { type: ["string", "null"], maxLength: 120 },
    conditionNotes: { type: "array", items: { type: "string", minLength: 1, maxLength: 240 }, maxItems: 6 },
    keyFacts: { type: "array", items: { type: "string", minLength: 1, maxLength: 240 }, minItems: 1, maxItems: 8 },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    uncertainties: { type: "array", items: { type: "string", minLength: 1, maxLength: 240 }, maxItems: 6 },
  },
} as const;

export const prospectResearchJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "prospects"],
  properties: {
    summary: { type: "string", minLength: 1, maxLength: 360 },
    prospects: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "sourceUrl", "evidenceExcerpt", "relevance", "confidence", "uncertainty"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 140 },
          sourceUrl: { type: "string", minLength: 8, maxLength: 2048 },
          evidenceExcerpt: { type: "string", minLength: 1, maxLength: 360 },
          relevance: { type: "string", minLength: 1, maxLength: 300 },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          uncertainty: { type: "string", minLength: 1, maxLength: 240 },
        },
      },
    },
  },
} as const;

export const outreachDraftJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["subject", "body"],
  properties: {
    subject: { type: "string", minLength: 1, maxLength: 160 },
    body: { type: "string", minLength: 1, maxLength: 1000 },
  },
} as const;
