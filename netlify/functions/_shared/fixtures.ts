import type { ListingAnalysis, OutreachDraft, ProspectResearch } from "./schemas";

export const fixtureListingAnalysis: ListingAnalysis = {
  title: "1881 Morgan Dollar — seller-confirmed demo",
  year: "1881",
  denomination: "Morgan dollar",
  mintMark: null,
  variety: null,
  conditionNotes: ["Demo image and caption only; condition needs seller confirmation."],
  keyFacts: ["Silver dollar format", "Seller-provided listing text reviewed before analysis"],
  confidence: 0.62,
  uncertainties: ["This fixture does not establish authenticity, grade, mint mark, or variety attribution."],
};

export const fixtureProspectResearch: ProspectResearch = {
  summary: "Fixture-only public-organization examples. They are research leads, not claims of purchase interest.",
  prospects: [
    {
      name: "PCGS CoinFacts",
      sourceUrl: "https://www.pcgs.com/coinfacts",
      evidenceExcerpt: "PCGS CoinFacts is a public reference for United States coins and related market research.",
      relevance: "A public reference point for confirming which attributes matter to collectors.",
      confidence: 0.58,
      uncertainty: "Not a buyer lead and does not indicate interest in this item.",
    },
    {
      name: "NGC Coin Explorer",
      sourceUrl: "https://www.ngccoin.com/price-guide/world/",
      evidenceExcerpt: "NGC publishes public coin-reference and collecting resources.",
      relevance: "A public collecting organization that can help frame attribution research.",
      confidence: 0.52,
      uncertainty: "Not a buyer lead and does not indicate interest in this item.",
    },
  ],
};

export const fixtureOutreachDraft: OutreachDraft = {
  subject: "Seller-approved coin listing to review",
  body:
    "Hello — I’m sharing a seller-approved coin listing that may fit your public collecting focus. If it is relevant, would you like the public listing details? This is a simulated draft; nothing has been sent.",
};

/**
 * Captions can contain accidental payment details, contact information, or instructions
 * aimed at a downstream model. Retain item facts while suppressing those categories.
 */
export function redactForModel(input: string): string {
  return input
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email redacted]")
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, "[phone redacted]")
    .replace(/https?:\/\/[^\s<>{}"']+/gi, "[url redacted]")
    .replace(/(^|\s)@[a-z0-9_]{2,}/gi, "$1[handle redacted]")
    .replace(/(?:\$\s*\d[\d,]*(?:\.\d{1,2})?|\bUSD\s*\d[\d,]*(?:\.\d{1,2})?\b)/gi, "[amount redacted]")
    .replace(/\b(?:private\s+floor|auto[-\s]?accept|reserve\s+price|minimum\s+price|payment\s+details?)\b[^\n.]{0,100}/gi, "[private rule redacted]")
    .replace(/\0/g, "")
    .slice(0, 6_000);
}

export function containsPricingOrPaymentLanguage(input: string): boolean {
  return /(?:\$\s*\d|\bUSD\s*\d|\bprice\b|\bfloor\b|\bcounter[-\s]?offer\b|\bpayment\b|\bwire\b|\bvenmo\b|\bpaypal\b)/i.test(input);
}

export function hasPromptInjectionSignal(input: string): boolean {
  return /(?:ignore\s+(?:all\s+)?(?:previous|above|system)|(?:reveal|show)\s+(?:the\s+)?(?:system|developer)\s+(?:prompt|message)|jailbreak|api[\s_-]?key|tool\s+call)/i.test(
    input,
  );
}
