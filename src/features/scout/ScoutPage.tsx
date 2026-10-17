import { useEffect, useReducer, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { DEMO_LISTING, DEMO_OUTREACH_DRAFT, DEMO_PROSPECTS } from "./fixtures";
import { DEFAULT_MANDATE, formatUsd } from "./domain/policy";
import { initialScoutState, scoutReducer } from "./domain/state";
import type { Prospect, ScoutCommand } from "./domain/types";
import {
  analyzeInstagramMedia,
  draftApprovedOutreach,
  getInstagramConnection,
  researchApprovedListing,
  type InstagramConnection,
  type InstagramMediaOption,
  type RemoteListingAnalysis,
  type RemoteOutreachDraft,
} from "./liveApi";
import "./ScoutPage.css";

const progressLabels = ["Listing", "Consent", "Facts", "Prospect", "Offer", "Receipt"];
type ScoutAction = ScoutCommand extends infer Command
  ? Command extends { id: string }
    ? Omit<Command, "id">
    : never
  : never;

function ConfidenceMark({ confidence }: { confidence: Prospect["confidence"] }) {
  return <span className={`scout-confidence scout-confidence--${confidence}`}>{confidence} confidence</span>;
}

function confidenceLabel(value: number): Prospect["confidence"] {
  if (value >= 0.75) return "high";
  if (value >= 0.45) return "medium";
  return "low";
}

function toProspect(item: {
  confidence: number;
  evidenceExcerpt: string;
  name: string;
  relevance: string;
  sourceUrl: string;
  uncertainty: string;
}, index: number): Prospect {
  let sourceLabel = "Public source";
  try { sourceLabel = new URL(item.sourceUrl).hostname.replace(/^www\./, ""); } catch { /* schema-rejected server responses are never shown */ }
  return {
    id: `live-prospect-${index}`,
    name: item.name,
    organizationType: "public organization",
    sourceUrl: item.sourceUrl,
    sourceLabel,
    excerpt: item.evidenceExcerpt,
    relevance: item.relevance,
    confidence: confidenceLabel(item.confidence),
    uncertainty: item.uncertainty,
  };
}

function listingFacts(media: InstagramMediaOption | null, analysis: RemoteListingAnalysis | null) {
  if (!media) return DEMO_LISTING;
  const firstFact = analysis?.keyFacts.at(0) ?? "Seller confirmation required";
  return {
    id: media.id,
    title: analysis?.title ?? "Role-authorized Instagram post",
    caption: media.caption || "No caption was provided for this selected post.",
    series: analysis?.denomination ?? "Unverified — seller review required",
    year: analysis?.year ?? "Unverified",
    grade: analysis?.conditionNotes.at(0) ?? "Unverified — seller review required",
    certification: analysis?.variety ?? analysis?.mintMark ?? firstFact,
    imageAlt: "Illustrated CoinScout marker for a selected role-authorized Instagram post",
  };
}

export function ScoutPage() {
  const [searchParams] = useSearchParams();
  const [state, dispatch] = useReducer(scoutReducer, initialScoutState);
  const [offerInput, setOfferInput] = useState("$510");
  const [instagramConnection, setInstagramConnection] = useState<InstagramConnection | null>(null);
  const [liveListing, setLiveListing] = useState<InstagramMediaOption | null>(null);
  const [liveAnalysis, setLiveAnalysis] = useState<RemoteListingAnalysis | null>(null);
  const [liveProspects, setLiveProspects] = useState<Prospect[] | null>(null);
  const [liveDraft, setLiveDraft] = useState<RemoteOutreachDraft | null>(null);
  const [liveStatus, setLiveStatus] = useState("");
  const [liveBusy, setLiveBusy] = useState<"analysis" | "research" | "draft" | null>(null);
  const isInstagramListing = Boolean(liveListing);
  const activeListing = listingFacts(liveListing, liveAnalysis);
  const prospects = isInstagramListing ? (liveProspects ?? []) : DEMO_PROSPECTS;
  const selectedProspect = prospects.find((prospect) => prospect.id === state.selectedProspectId);
  const counter = state.lastDecision?.kind === "counter" ? state.lastDecision : null;
  const currentProgress = [
    Boolean(state.selectedListingId),
    state.aiOptedIn,
    state.factsConfirmed,
    Boolean(state.selectedProspectId && state.outreachApproved),
    Boolean(state.lastDecision),
    state.labelSimulated,
  ];

  const command = (id: string, action: ScoutAction) => dispatch({ ...action, id } as ScoutCommand);

  useEffect(() => {
    if (searchParams.get("instagram") !== "connected") return;
    let active = true;
    void getInstagramConnection().then((connection) => {
      if (!active) return;
      setInstagramConnection(connection);
      setLiveStatus(connection?.connected
        ? `Connected as @${connection.profile?.username ?? "authorized test account"}. Select one post below.`
        : "The Instagram session is unavailable or expired. Reconnect before selecting a post.");
    });
    return () => { active = false; };
  }, [searchParams]);

  const selectInstagramMedia = (media: InstagramMediaOption) => {
    setLiveListing(media);
    setLiveAnalysis(null);
    setLiveProspects(null);
    setLiveDraft(null);
    setLiveStatus("Selected post is ready for seller-approved analysis.");
    command(`listing:instagram:${media.id}`, { type: "select_listing", listingId: media.id, source: "instagram" });
  };

  const approveAnalysis = () => {
    command("analysis:opt-in", { type: "opt_in_ai" });
    if (!liveListing) return;
    setLiveBusy("analysis");
    setLiveStatus("Analyzing only the selected post’s server-fetched content…");
    void analyzeInstagramMedia(liveListing.id).then((result) => {
      if (result?.analysis) {
        setLiveAnalysis(result.analysis);
        setLiveStatus("Analysis is ready for seller confirmation. Uncertainties remain visible.");
      } else {
        setLiveStatus("Analysis could not be completed. Pause and review the selected post; no sale action occurred.");
      }
      setLiveBusy(null);
    });
  };

  const confirmFacts = () => {
    command("facts:confirm", { type: "confirm_facts" });
    if (!liveListing) return;
    setLiveBusy("research");
    setLiveStatus("Researching up to three public, cited organizations…");
    void researchApprovedListing(activeListing.caption).then((result) => {
      if (result?.research?.prospects?.length) {
        setLiveProspects(result.research.prospects.map(toProspect));
        setLiveStatus("Cited research is ready for seller selection.");
      } else {
        setLiveProspects([]);
        setLiveStatus("No citable prospect result is available. Seller review is required.");
      }
      setLiveBusy(null);
    });
  };

  const selectProspect = (prospect: Prospect) => {
    command(`prospect:${prospect.id}`, { type: "select_prospect", prospectId: prospect.id });
    if (!liveListing) return;
    setLiveBusy("draft");
    setLiveStatus("Drafting a seller-review-only simulated note…");
    void draftApprovedOutreach(activeListing.caption, prospect).then((result) => {
      if (result?.draft) {
        setLiveDraft(result.draft);
        setLiveStatus("Draft ready for seller review. It contains no price or payment terms.");
      } else {
        setLiveStatus("A safe draft could not be produced. Seller review is required.");
      }
      setLiveBusy(null);
    });
  };

  return (
    <div className="scout page-width">
      <section className="scout__masthead" aria-labelledby="scout-title">
        <div>
          <Badge tone="brass">ATLAS SCOUT / CONTROLLED DEMO</Badge>
          <p className="eyebrow">A seller-guided, fixture-safe workflow</p>
          <h1 id="scout-title">A buyer path with the guardrails in view.</h1>
          <p className="scout__lede">Walk one graded coin from listing through a simulated, seller-controlled sale. The model boundary is visible; pricing and commitments stay deterministic.</p>
        </div>
        <aside className="scout__boundary" aria-label="Demo safety boundary">
          <span className="scout__boundary-mark" aria-hidden="true">◎</span>
          <div>
            <strong>Simulation is on</strong>
            <p>No DMs, payments, labels, listings, or inventory systems are touched by this demo.</p>
          </div>
        </aside>
      </section>

      <ol className="scout-progress" aria-label="Demo progress">
        {progressLabels.map((label, index) => (
          <li className={currentProgress[index] ? "is-complete" : ""} key={label}>
            <span aria-hidden="true">{currentProgress[index] ? "✓" : index + 1}</span>{label}
          </li>
        ))}
      </ol>

      <div className="scout-layout">
        <div className="scout-workflow">
          <article className={`scout-card ${state.selectedListingId ? "is-complete" : ""}`}>
            <div className="scout-card__heading">
              <span className="scout-step">01</span>
              <div>
                <p className="eyebrow">Listing intake</p>
                <h2>Choose one listing</h2>
              </div>
              {state.selectedListingId && <Badge tone="safe">Selected</Badge>}
            </div>
            <div className="scout-live-import">
              <div>
                <p className="scout-live-import__eyebrow">Optional live import</p>
                <p>Instagram Login is limited to a Meta role-authorized Business or Creator test account. Tokens stay server-side and the public launch stays fixture-safe.</p>
              </div>
              {!instagramConnection?.connected && !state.selectedListingId && <a className="button button--secondary" href="/api/instagram/start">Connect authorized Instagram</a>}
            </div>
            {searchParams.get("instagram") === "fixture" && <p className="scout-live-status">Instagram import is deliberately unavailable in fixture mode.</p>}
            {searchParams.get("instagram") === "denied" && <p className="scout-live-status scout-live-status--warning">Instagram authorization did not complete. No session was created.</p>}
            {liveStatus && <p className="scout-live-status" role="status">{liveStatus}</p>}
            {instagramConnection?.connected && !state.selectedListingId && (
              <div className="scout-media-picker" aria-label="Role-authorized Instagram posts">
                {instagramConnection.media?.length ? instagramConnection.media.map((media) => (
                  <article key={media.id}>
                    <p><b>{media.mediaType.replace("_", " ")}</b> · seller-visible metadata only</p>
                    <span>{media.caption || "No caption available"}</span>
                    <a href={media.permalink} target="_blank" rel="noreferrer">Open public post <span aria-hidden="true">↗</span></a>
                    <Button type="button" onClick={() => selectInstagramMedia(media)}>Use this authorized post</Button>
                  </article>
                )) : <p className="scout-live-status scout-live-status--warning">Connected, but no eligible image post is available for this short demo session.</p>}
              </div>
            )}
            <div className="scout-listing">
              <div className="scout-coin" aria-label={activeListing.imageAlt} role="img">
                <span>{isInstagramListing ? "LIVE" : "1921"}</span><b>{isInstagramListing ? "IG" : "AS"}</b><small>{isInstagramListing ? "POST" : "PEACE"}</small>
              </div>
              <div>
                <h3>{activeListing.title}</h3>
                <p>{activeListing.caption}</p>
                {!state.selectedListingId ? (
                  <Button type="button" onClick={() => command("listing:demo", { type: "select_listing", listingId: DEMO_LISTING.id, source: "demo" })}>
                    Use this demo listing <span aria-hidden="true">→</span>
                  </Button>
                ) : <p className="scout-card__confirmation">{isInstagramListing ? "Authorized post locked for this short, server-side session." : "Demo listing locked for this local walkthrough."}</p>}
              </div>
            </div>
          </article>

          <article className={`scout-card ${state.aiOptedIn ? "is-complete" : ""}`} aria-disabled={!state.selectedListingId}>
            <div className="scout-card__heading">
              <span className="scout-step">02</span>
              <div>
                <p className="eyebrow">Explicit consent</p>
                <h2>Approve listing analysis</h2>
              </div>
              {state.aiOptedIn && <Badge tone="safe">Approved</Badge>}
            </div>
            <div className="scout-consent">
              <div className="scout-consent__check" aria-hidden="true">{state.aiOptedIn ? "✓" : "○"}</div>
              <p><strong>Only seller-approved caption text and image bytes may be processed.</strong> Tokens, contacts, payment details, private floor rules, and cookies stay outside the model boundary. This walkthrough uses a local fixture and makes no request.</p>
            </div>
            {!state.aiOptedIn && <Button type="button" variant="secondary" disabled={!state.selectedListingId || liveBusy === "analysis"} onClick={approveAnalysis}>{liveBusy === "analysis" ? "Analyzing selected post…" : isInstagramListing ? "I approve selected-post analysis" : "I approve fixture analysis"}</Button>}
          </article>

          <article className={`scout-card ${state.factsConfirmed ? "is-complete" : ""}`} aria-disabled={!state.aiOptedIn}>
            <div className="scout-card__heading">
              <span className="scout-step">03</span>
              <div>
                <p className="eyebrow">Seller confirmation</p>
                <h2>Confirm extracted facts</h2>
              </div>
              {state.factsConfirmed && <Badge tone="safe">Confirmed</Badge>}
            </div>
            <dl className="scout-facts">
              <div><dt>Series</dt><dd>{activeListing.series}</dd></div>
              <div><dt>Year</dt><dd>{activeListing.year}</dd></div>
              <div><dt>Grade</dt><dd>{activeListing.grade}</dd></div>
              <div><dt>Certification</dt><dd>{activeListing.certification}</dd></div>
            </dl>
            {!state.factsConfirmed && <Button type="button" disabled={!state.aiOptedIn || liveBusy === "analysis" || liveBusy === "research"} onClick={confirmFacts}>{liveBusy === "research" ? "Researching public sources…" : "Confirm these facts"}</Button>}
          </article>

          <article className={`scout-card scout-card--mandate ${state.factsConfirmed ? "is-ready" : ""}`} aria-disabled={!state.factsConfirmed}>
            <div className="scout-card__heading">
              <span className="scout-step">04</span>
              <div>
                <p className="eyebrow">Pure negotiation policy</p>
                <h2>Set the shipped-price mandate</h2>
              </div>
              <Badge tone="warning">Never model-decided</Badge>
            </div>
            <div className="scout-mandate" aria-label="Seller pricing mandate">
              <div><span>Ask</span><strong>{formatUsd(DEFAULT_MANDATE.askCents)}</strong><small>shipped</small></div>
              <div><span>Auto-accept</span><strong>{formatUsd(DEFAULT_MANDATE.autoAcceptCents)}</strong><small>shipped</small></div>
              <div className="scout-mandate__private"><span>Private floor</span><strong>{formatUsd(DEFAULT_MANDATE.privateFloorCents)}</strong><small>seller only</small></div>
            </div>
            <div className="scout-ladder" aria-label="Bounded counter ladder">
              <span>Bounded counter ladder</span>
              {DEFAULT_MANDATE.counterLadderCents.map((amount, index) => <strong key={amount}>{formatUsd(amount)}{index < 2 && <i aria-hidden="true">→</i>}</strong>)}
            </div>
            <label className="scout-floor-control">
              <input type="checkbox" disabled={!state.factsConfirmed || state.reserved} checked={state.floorAuthorityEnabled} onChange={(event) => command(`floor-authority:${event.target.checked}`, { type: "set_floor_authority", enabled: event.target.checked })} />
              <span>Allow the final {formatUsd(DEFAULT_MANDATE.privateFloorCents)} rung only after explicit seller authority.</span>
            </label>
            <p className="scout-private-note">This rule remains in local sale policy. It is never included in an AI analysis or outreach prompt.</p>
          </article>

          <article className={`scout-card ${state.selectedProspectId ? "is-complete" : ""}`} aria-disabled={!state.factsConfirmed}>
            <div className="scout-card__heading">
              <span className="scout-step">05</span>
              <div>
                <p className="eyebrow">Public-source research</p>
                <h2>Choose one cited organization</h2>
              </div>
              {state.selectedProspectId && <Badge tone="safe">1 selected</Badge>}
            </div>
            <p className="scout-card__note">Demo fixture: each prospect is a public organization, not a claim that it wants to buy this coin.</p>
            <div className="scout-prospects">
              {prospects.map((prospect) => {
                const selected = state.selectedProspectId === prospect.id;
                return (
                  <article className={`scout-prospect ${selected ? "is-selected" : ""}`} key={prospect.id}>
                    <div className="scout-prospect__top">
                      <div><p>{prospect.organizationType}</p><h3>{prospect.name}</h3></div>
                      <ConfidenceMark confidence={prospect.confidence} />
                    </div>
                    <p>{prospect.relevance}</p>
                    <blockquote>“{prospect.excerpt}”</blockquote>
                    <a href={prospect.sourceUrl} target="_blank" rel="noreferrer">{prospect.sourceLabel} <span aria-hidden="true">↗</span></a>
                    <small><b>Uncertainty:</b> {prospect.uncertainty}</small>
                    <Button type="button" variant={selected ? "primary" : "secondary"} disabled={!state.factsConfirmed || liveBusy === "research" || liveBusy === "draft"} aria-pressed={selected} onClick={() => selectProspect(prospect)}>{selected ? "Selected for draft" : "Select prospect"}</Button>
                  </article>
                );
              })}
              {isInstagramListing && state.factsConfirmed && liveBusy === "research" && <p className="scout-live-status">Checking bounded public sources…</p>}
              {isInstagramListing && state.factsConfirmed && liveBusy !== "research" && prospects.length === 0 && <p className="scout-live-status scout-live-status--warning">No cited public prospect is available. The workflow stays paused for seller review.</p>}
            </div>
          </article>

          <article className={`scout-card ${state.outreachApproved ? "is-complete" : ""}`} aria-disabled={!selectedProspect}>
            <div className="scout-card__heading">
              <span className="scout-step">06</span>
              <div>
                <p className="eyebrow">Seller review</p>
                <h2>Approve simulated outreach</h2>
              </div>
              {state.outreachApproved && <Badge tone="safe">Approved</Badge>}
            </div>
            <div className="scout-draft">
              <div className="scout-draft__to">To: {selectedProspect?.name ?? "Choose an organization first"}</div>
              {liveDraft?.subject && <p className="scout-draft__subject">{liveDraft.subject}</p>}
              <p>{liveDraft?.body ?? (isInstagramListing ? "A safe seller-review draft will appear only after the selected organization has a valid, cited result." : DEMO_OUTREACH_DRAFT)}</p>
              <small>Drafting may summarize public facts; it cannot choose a price, send a message, or represent acceptance.</small>
            </div>
            {!state.outreachApproved && <Button type="button" disabled={!selectedProspect || (isInstagramListing && (!liveDraft || liveBusy === "draft"))} onClick={() => command("outreach:approve", { type: "approve_outreach" })}>{liveBusy === "draft" ? "Drafting…" : "Approve simulated draft"}</Button>}
            {state.outreachApproved && <p className="scout-card__confirmation">Approved for simulation only — no message was sent.</p>}
          </article>

          <article className={`scout-card ${state.lastDecision ? "is-complete" : ""}`} aria-disabled={!state.outreachApproved}>
            <div className="scout-card__heading">
              <span className="scout-step">07</span>
              <div>
                <p className="eyebrow">Deterministic decision</p>
                <h2>Evaluate a buyer offer</h2>
              </div>
              <Badge tone="warning">Policy only</Badge>
            </div>
            <form className="scout-offer-form" onSubmit={(event) => {
              event.preventDefault();
              command(`offer:${offerInput.trim()}:${state.events.length}`, { type: "evaluate_offer", rawOffer: offerInput });
            }}>
              <label htmlFor="scout-offer">Clean USD offer <span>no shipping or payment terms</span></label>
              <div>
                <input id="scout-offer" value={offerInput} onChange={(event) => setOfferInput(event.target.value)} disabled={!state.outreachApproved || state.reserved} inputMode="decimal" aria-describedby="scout-offer-help" />
                <Button type="submit" disabled={!state.outreachApproved || state.reserved}>Run policy</Button>
              </div>
              <p id="scout-offer-help"><button type="button" disabled={!state.outreachApproved || state.reserved} onClick={() => setOfferInput("$510")}>Load $510 demo</button> <button type="button" disabled={!state.outreachApproved || state.reserved} onClick={() => setOfferInput("$525")}>Load $525 threshold</button></p>
            </form>

            {state.lastDecision && <div className={`scout-decision scout-decision--${state.lastDecision.kind}`} role="status">
              <span className="scout-decision__label">{state.lastDecision.kind === "counter" ? "SIMULATED COUNTER" : state.lastDecision.kind === "accept" ? "SELLER REVIEW" : "REVIEW REQUIRED"}</span>
              {state.lastDecision.kind === "counter" && <h3>{formatUsd(state.lastDecision.offerCents)} becomes {formatUsd(state.lastDecision.responseCents)} shipped.</h3>}
              {state.lastDecision.kind === "accept" && <h3>{formatUsd(state.lastDecision.responseCents)} meets the mandate.</h3>}
              {state.lastDecision.kind === "review" && <h3>Pause the automated path.</h3>}
              <p>{state.lastDecision.reason}</p>
              {counter && !state.reserved && <Button type="button" onClick={() => command(`counter:accept:${counter.responseCents}`, { type: "buyer_accepts_counter" })}>Simulate buyer accepting {formatUsd(counter.responseCents)}</Button>}
            </div>}
          </article>

          <article className={`scout-card scout-card--settlement ${state.labelSimulated ? "is-complete" : ""}`} aria-disabled={!state.reserved}>
            <div className="scout-card__heading">
              <span className="scout-step">08</span>
              <div>
                <p className="eyebrow">Simulated settlement</p>
                <h2>Reserve, pay, label, receipt</h2>
              </div>
              {state.labelSimulated && <Badge tone="safe">Receipt ready</Badge>}
            </div>
            <div className="scout-settlement">
              <div className={state.reserved ? "is-done" : ""}><b>1</b><span>Reserve item</span><small>{state.reserved ? "Simulated reservation" : "Waiting on buyer acceptance"}</small></div>
              <div className={state.paymentSimulated ? "is-done" : ""}><b>2</b><span>Confirm payment</span><small>{state.paymentSimulated ? "Simulated payment" : "No processor connected"}</small></div>
              <div className={state.labelSimulated ? "is-done" : ""}><b>3</b><span>Unlock label</span><small>{state.labelSimulated ? "Simulated label" : "No carrier connected"}</small></div>
            </div>
            <div className="button-row">
              {!state.paymentSimulated && <Button type="button" disabled={!state.reserved} onClick={() => command("payment:simulate", { type: "simulate_payment" })}>Simulate payment</Button>}
              {!state.labelSimulated && <Button type="button" variant="secondary" disabled={!state.paymentSimulated} onClick={() => command("label:simulate", { type: "simulate_label" })}>Simulate shipping label</Button>}
            </div>
            {state.labelSimulated && <div className="scout-receipt">
              <div><Badge tone="safe">SIMULATED AUDIT RECEIPT</Badge><strong>ATLAS-DEMO-1921-063</strong></div>
              <p>One local walkthrough · {state.events.length} append-only events · no external record created.</p>
            </div>}
          </article>
        </div>

        <aside className="scout-audit" aria-labelledby="audit-title">
          <div className="scout-audit__head">
            <div><p className="eyebrow">Local demo ledger</p><h2 id="audit-title">Decision receipt</h2></div>
            <button type="button" onClick={() => { dispatch({ id: "demo:restart", type: "restart_demo" }); setOfferInput("$510"); setLiveListing(null); setLiveAnalysis(null); setLiveProspects(null); setLiveDraft(null); setLiveStatus(""); }}>Restart</button>
          </div>
          <p>Every material action becomes a compact, simulated audit event. Replayed command IDs are ignored.</p>
          {state.events.length === 0 ? <div className="scout-audit__empty">Start with the demo listing to create a local trail.</div> : <ol>
            {state.events.map((event) => <li key={event.id}><span>{String(event.sequence).padStart(2, "0")}</span><div><b>{event.kind.replace(".", " · ")}</b><p>{event.summary}</p></div></li>)}
          </ol>}
          <div className="scout-audit__rules">
            <strong>Hard boundaries</strong>
            <ul><li>Prices come from pure policy.</li><li>Outreach never sends itself.</li><li>Payment precedes a simulated label.</li></ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
