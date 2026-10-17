import type { Cents, Mandate, OfferDecision, ParsedOffer, SaleGuard } from "./types";

export const DEFAULT_MANDATE: Mandate = {
  askCents: 55_000,
  autoAcceptCents: 52_500,
  privateFloorCents: 50_000,
  counterLadderCents: [52_500, 51_500, 50_000],
  priceBasis: "shipped",
};

const MONEY_INPUT = /^\s*\$?([0-9]{1,4})(?:\.([0-9]{1,2}))?\s*$/;
const AMBIGUOUS_TERMS = /\b(ship(?:ping|ped)?|postage|plus|trade|payment|installment|return|condition|hold|pickup|cashapp|venmo|zelle)\b/i;

export function formatUsd(cents: Cents): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Only a single, unqualified USD amount can move into deterministic policy. */
export function parseCleanOffer(rawOffer: string): ParsedOffer {
  if (AMBIGUOUS_TERMS.test(rawOffer)) {
    return { kind: "review", reason: "The offer changes shipping, payment, timing, trade, or another sale term." };
  }

  const match = rawOffer.match(MONEY_INPUT);
  if (!match) {
    return { kind: "review", reason: "Use one clear USD amount, such as $510. Multi-price or conditional offers need seller review." };
  }

  const dollars = Number(match[1]);
  const centsPart = (match[2] ?? "").padEnd(2, "0");
  const cents = dollars * 100 + Number(centsPart || "0");

  if (!Number.isSafeInteger(cents) || cents <= 0) {
    return { kind: "review", reason: "That amount is not a valid positive USD offer." };
  }

  return { kind: "valid", cents, normalized: formatUsd(cents) };
}

export function evaluateOffer({
  offerCents,
  mandate = DEFAULT_MANDATE,
  counterIndex = 0,
  floorAuthorityEnabled = false,
  guard = {},
}: {
  offerCents: Cents;
  mandate?: Mandate;
  counterIndex?: number;
  floorAuthorityEnabled?: boolean;
  guard?: SaleGuard;
}): OfferDecision {
  if (guard.paused || guard.cancelled || guard.reserved || guard.stale) {
    return { kind: "review", reason: "The sale is paused, cancelled, reserved, or stale. Seller review is required." };
  }

  if (!Number.isSafeInteger(offerCents) || offerCents <= 0) {
    return { kind: "review", reason: "The offer amount is invalid." };
  }

  if (offerCents >= mandate.askCents) {
    return {
      kind: "accept",
      offerCents,
      responseCents: mandate.askCents,
      reason: `A clean offer at or above the ask is accepted at ${formatUsd(mandate.askCents)} shipped.`,
    };
  }

  if (offerCents >= mandate.autoAcceptCents) {
    return {
      kind: "accept",
      offerCents,
      responseCents: offerCents,
      reason: `The offer meets the seller's automatic acceptance threshold for the shipped-price mandate.`,
    };
  }

  if (offerCents < mandate.privateFloorCents) {
    return { kind: "review", reason: "The offer is below the private floor. No automated reply is permitted." };
  }

  const nextRung = mandate.counterLadderCents[counterIndex];
  if (nextRung === undefined) {
    return { kind: "review", reason: "The bounded counter ladder is exhausted. Seller review is required." };
  }

  if (nextRung === mandate.privateFloorCents && !floorAuthorityEnabled) {
    return { kind: "review", reason: "The final private-floor rung requires the seller to enable explicit floor authority." };
  }

  // Never counter below a buyer's clear offer. The rung is a lower bound, while the
  // seller's ladder remains finite and deterministic.
  const responseCents = Math.max(offerCents, nextRung);
  return {
    kind: "counter",
    offerCents,
    responseCents,
    ladderIndex: counterIndex,
    reason: `Counter ${counterIndex + 1} of ${mandate.counterLadderCents.length}: ${formatUsd(responseCents)} shipped.`,
  };
}
