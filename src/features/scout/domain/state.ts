import { DEMO_LISTING, DEMO_PROSPECTS } from "../fixtures";
import { DEFAULT_MANDATE, evaluateOffer, formatUsd, parseCleanOffer } from "./policy";
import type { ScoutCommand, ScoutEventKind, ScoutState } from "./types";

export const initialScoutState: ScoutState = {
  selectedListingId: null,
  aiOptedIn: false,
  factsConfirmed: false,
  floorAuthorityEnabled: false,
  selectedProspectId: null,
  outreachApproved: false,
  lastDecision: null,
  reserved: false,
  paymentSimulated: false,
  labelSimulated: false,
  events: [],
  processedCommandIds: [],
};

function appendEvent(state: ScoutState, kind: ScoutEventKind, summary: string): ScoutState {
  const sequence = state.events.length + 1;
  return {
    ...state,
    events: [...state.events, { id: `atlas-demo-${sequence}`, kind, summary, sequence }],
  };
}

function markProcessed(state: ScoutState, commandId: string): ScoutState {
  return { ...state, processedCommandIds: [...state.processedCommandIds, commandId] };
}

function commandIsAlreadyProcessed(state: ScoutState, commandId: string): boolean {
  return state.processedCommandIds.includes(commandId);
}

/**
 * Small append-only state machine for the demo. Duplicate command ids are no-ops,
 * which mirrors the idempotency rule required by the eventual server workflow.
 */
export function scoutReducer(state: ScoutState, command: ScoutCommand): ScoutState {
  if (command.type === "restart_demo") return initialScoutState;
  if (commandIsAlreadyProcessed(state, command.id)) return state;

  let next: ScoutState | null = null;

  switch (command.type) {
    case "select_listing": {
      if (state.selectedListingId) return state;
      const summary = command.source === "instagram"
        ? "Role-authorized Instagram post selected for seller-controlled analysis."
        : "Demo listing selected.";
      next = appendEvent({ ...state, selectedListingId: command.listingId }, "listing.selected", summary);
      break;
    }
    case "opt_in_ai": {
      if (!state.selectedListingId || state.aiOptedIn) return state;
      next = appendEvent({ ...state, aiOptedIn: true }, "ai.opted_in", "Seller opted into fixture analysis for the selected listing.");
      break;
    }
    case "confirm_facts": {
      if (!state.aiOptedIn || state.factsConfirmed) return state;
      next = appendEvent({ ...state, factsConfirmed: true }, "facts.confirmed", "Seller confirmed listing facts before any prospect research.");
      break;
    }
    case "set_floor_authority": {
      if (!state.factsConfirmed || state.reserved) return state;
      if (state.floorAuthorityEnabled === command.enabled) return state;
      next = appendEvent(
        { ...state, floorAuthorityEnabled: command.enabled },
        "floor.authority_changed",
        command.enabled
          ? "Seller enabled explicit authority for the final private-floor counter only."
          : "Seller withdrew final private-floor counter authority.",
      );
      break;
    }
    case "select_prospect": {
      if (!state.factsConfirmed || state.outreachApproved || state.reserved || !DEMO_PROSPECTS.some((prospect) => prospect.id === command.prospectId)) return state;
      next = appendEvent({ ...state, selectedProspectId: command.prospectId }, "prospect.selected", "Seller selected one cited organization for a simulated outreach draft.");
      break;
    }
    case "approve_outreach": {
      if (!state.selectedProspectId || state.outreachApproved) return state;
      next = appendEvent({ ...state, outreachApproved: true }, "outreach.approved", "Seller approved a simulated outreach draft. No message was sent.");
      break;
    }
    case "evaluate_offer": {
      if (!state.outreachApproved || state.reserved) return state;
      const parsed = parseCleanOffer(command.rawOffer);
      const decision = parsed.kind === "review"
        ? { kind: "review" as const, reason: parsed.reason }
        : evaluateOffer({
            offerCents: parsed.cents,
            mandate: DEFAULT_MANDATE,
            counterIndex: state.lastDecision?.kind === "counter" ? state.lastDecision.ladderIndex + 1 : 0,
            floorAuthorityEnabled: state.floorAuthorityEnabled,
          });
      const summary = decision.kind === "review"
        ? `Offer held for review: ${decision.reason}`
        : decision.kind === "accept"
          ? `Clean offer evaluated; seller-controlled acceptance is available at ${formatUsd(decision.responseCents)} shipped.`
          : `Offer evaluated by pure policy; simulated counter: ${formatUsd(decision.responseCents)} shipped.`;
      next = appendEvent({ ...state, lastDecision: decision }, "offer.evaluated", summary);
      break;
    }
    case "buyer_accepts_counter": {
      if (state.lastDecision?.kind !== "counter" || state.reserved) return state;
      next = appendEvent(
        appendEvent({ ...state, reserved: true }, "counter.accepted", `Buyer accepted the simulated ${formatUsd(state.lastDecision.responseCents)} counter.`),
        "reservation.created",
        "Item reserved in this local demo. No inventory system was changed.",
      );
      break;
    }
    case "simulate_payment": {
      if (!state.reserved || state.paymentSimulated) return state;
      next = appendEvent({ ...state, paymentSimulated: true }, "payment.simulated", "Simulated payment recorded. No payment processor was contacted.");
      break;
    }
    case "simulate_label": {
      if (!state.paymentSimulated || state.labelSimulated) return state;
      next = appendEvent({ ...state, labelSimulated: true }, "label.simulated", "Simulated insured shipping label unlocked. No carrier label was created.");
      break;
    }
  }

  return next ? markProcessed(next, command.id) : state;
}
