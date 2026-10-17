import type { ListingFacts, Prospect } from "./domain/types";

export const DEMO_LISTING: ListingFacts = {
  id: "1921-peace-pcgs-ms63",
  title: "1921 Peace Dollar · PCGS MS63",
  caption: "Freshly certified 1921 Peace Dollar, PCGS MS63. Lustrous surfaces and a strong strike. Shipped, tracked, and fully insured.",
  series: "Peace Dollar",
  year: "1921",
  grade: "MS63",
  certification: "PCGS",
  imageAlt: "Illustrated silver dollar marked 1921 and Atlas Scout",
};

/**
 * Fixtures model the evidence contract used by the live research function. They do
 * not claim that an organization wants this specific coin.
 */
export const DEMO_PROSPECTS: Prospect[] = [
  {
    id: "stacks-bowers",
    name: "Stack's Bowers Galleries",
    organizationType: "auction house",
    sourceUrl: "https://stacksbowers.com/",
    sourceLabel: "Stack's Bowers public site",
    excerpt: "Public auction and numismatics organization with rare-coin categories and collector-facing sale information.",
    relevance: "A visible venue for certified United States coin material.",
    confidence: "medium",
    uncertainty: "This public source does not establish interest in this individual coin.",
  },
  {
    id: "greatcollections",
    name: "GreatCollections",
    organizationType: "auction house",
    sourceUrl: "https://www.greatcollections.com/",
    sourceLabel: "GreatCollections public site",
    excerpt: "Public online auction organization presenting certified rare coins to registered collectors.",
    relevance: "Its public focus overlaps with graded U.S. coin collectors.",
    confidence: "medium",
    uncertainty: "Availability of a public category is not buyer intent or a buying commitment.",
  },
  {
    id: "david-lawrence",
    name: "David Lawrence Rare Coins",
    organizationType: "dealer",
    sourceUrl: "https://www.davidlawrence.com/",
    sourceLabel: "David Lawrence public site",
    excerpt: "Public rare-coin dealer site with United States coin inventory and collector resources.",
    relevance: "A potential organization to research for a certified Peace Dollar conversation.",
    confidence: "low",
    uncertainty: "Public inventory alone cannot show current demand, budget, or interest.",
  },
];

export const DEMO_OUTREACH_DRAFT = `Hello — I’m sharing a seller-approved 1921 Peace Dollar, PCGS MS63. The seller has confirmed the listing facts and is open to a conversation if it fits your collecting or acquisition focus. Would a concise condition summary and public listing link be useful?`;
