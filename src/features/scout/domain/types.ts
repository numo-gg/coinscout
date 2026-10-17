/**
 * The Scout domain deliberately has no model or network concepts. Money, authority,
 * inventory, and settlement decisions are made from these small deterministic types.
 */
export type Cents = number;

export type ListingFacts = {
  id: string;
  title: string;
  caption: string;
  series: string;
  year: string;
  grade: string;
  certification: string;
  imageAlt: string;
};

export type Prospect = {
  id: string;
  name: string;
  organizationType: string;
  sourceUrl: string;
  sourceLabel: string;
  excerpt: string;
  relevance: string;
  confidence: "high" | "medium" | "low";
  uncertainty: string;
};

export type Mandate = {
  askCents: Cents;
  autoAcceptCents: Cents;
  privateFloorCents: Cents;
  counterLadderCents: readonly Cents[];
  priceBasis: "shipped";
};

export type SaleGuard = {
  paused?: boolean;
  cancelled?: boolean;
  reserved?: boolean;
  stale?: boolean;
};

export type OfferDecision =
  | {
      kind: "accept";
      offerCents: Cents;
      responseCents: Cents;
      reason: string;
    }
  | {
      kind: "counter";
      offerCents: Cents;
      responseCents: Cents;
      ladderIndex: number;
      reason: string;
    }
  | {
      kind: "review";
      reason: string;
    };

export type ParsedOffer =
  | { kind: "valid"; cents: Cents; normalized: string }
  | { kind: "review"; reason: string };

export type ScoutEventKind =
  | "listing.selected"
  | "ai.opted_in"
  | "facts.confirmed"
  | "floor.authority_changed"
  | "prospect.selected"
  | "outreach.approved"
  | "offer.evaluated"
  | "counter.accepted"
  | "reservation.created"
  | "payment.simulated"
  | "label.simulated";

export type ScoutEvent = {
  id: string;
  kind: ScoutEventKind;
  summary: string;
  sequence: number;
};

export type ScoutState = {
  selectedListingId: string | null;
  aiOptedIn: boolean;
  factsConfirmed: boolean;
  floorAuthorityEnabled: boolean;
  selectedProspectId: string | null;
  outreachApproved: boolean;
  lastDecision: OfferDecision | null;
  reserved: boolean;
  paymentSimulated: boolean;
  labelSimulated: boolean;
  events: ScoutEvent[];
  processedCommandIds: string[];
};

export type ScoutCommand =
  | { id: string; type: "select_listing"; listingId: string; source: "demo" | "instagram" }
  | { id: string; type: "opt_in_ai" }
  | { id: string; type: "confirm_facts" }
  | { id: string; type: "set_floor_authority"; enabled: boolean }
  | { id: string; type: "select_prospect"; prospectId: string }
  | { id: string; type: "approve_outreach" }
  | { id: string; type: "evaluate_offer"; rawOffer: string }
  | { id: string; type: "buyer_accepts_counter" }
  | { id: string; type: "simulate_payment" }
  | { id: string; type: "simulate_label" }
  | { id: string; type: "restart_demo" };
