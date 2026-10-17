import { describe, expect, it } from "vitest";
import { DEFAULT_MANDATE, evaluateOffer, parseCleanOffer } from "./policy";
import { initialScoutState, scoutReducer } from "./state";
import { DEMO_LISTING } from "../fixtures";

describe("Scout deterministic offer policy", () => {
  it("counters a clean $510 offer at $525 shipped", () => {
    expect(evaluateOffer({ offerCents: 51_000 })).toMatchObject({
      kind: "counter",
      responseCents: 52_500,
      ladderIndex: 0,
    });
  });

  it("accepts a clean offer at the automatic threshold", () => {
    expect(evaluateOffer({ offerCents: DEFAULT_MANDATE.autoAcceptCents })).toMatchObject({
      kind: "accept",
      responseCents: 52_500,
    });
  });

  it("requires review for a conditional offer and an unapproved floor rung", () => {
    expect(parseCleanOffer("$510 plus shipping")).toMatchObject({ kind: "review" });
    expect(evaluateOffer({ offerCents: 51_000, counterIndex: 2 })).toMatchObject({ kind: "review" });
  });

  it("blocks sale activity once an item is reserved", () => {
    expect(evaluateOffer({ offerCents: 51_000, guard: { reserved: true } })).toMatchObject({ kind: "review" });
  });
});

describe("Scout demo state machine", () => {
  it("is idempotent for duplicated command ids", () => {
    const command = { id: "choose-demo", type: "select_listing" as const, listingId: DEMO_LISTING.id, source: "demo" as const };
    const once = scoutReducer(initialScoutState, command);
    const twice = scoutReducer(once, command);
    expect(twice).toBe(once);
    expect(once.events).toHaveLength(1);
  });

  it("moves the $510 fixture through a $525 counter into a simulated reservation", () => {
    const commands = [
      { id: "listing", type: "select_listing" as const, listingId: DEMO_LISTING.id, source: "demo" as const },
      { id: "consent", type: "opt_in_ai" as const },
      { id: "facts", type: "confirm_facts" as const },
      { id: "prospect", type: "select_prospect" as const, prospectId: "stacks-bowers" },
      { id: "outreach", type: "approve_outreach" as const },
      { id: "offer", type: "evaluate_offer" as const, rawOffer: "$510" },
      { id: "accept", type: "buyer_accepts_counter" as const },
    ];
    const finalState = commands.reduce(scoutReducer, initialScoutState);
    expect(finalState.lastDecision).toMatchObject({ kind: "counter", responseCents: 52_500 });
    expect(finalState.reserved).toBe(true);
    expect(finalState.events.map((event) => event.kind)).toContain("reservation.created");
  });
});
