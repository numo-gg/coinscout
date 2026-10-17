import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DEMO_LISTING, DEMO_PROSPECTS } from "./fixtures";
import {
  getInstagramConnection,
  researchApprovedListing,
  type InstagramConnection,
  type InstagramMediaOption,
  type RemoteProspect,
} from "./liveApi";
import "./ScoutPage.css";

type ProspectResult = {
  confidence: "high" | "medium" | "low";
  excerpt: string;
  id: string;
  name: string;
  relevance: string;
  sourceLabel: string;
  sourceUrl: string;
  uncertainty: string;
};

const DEMO_POST: InstagramMediaOption = {
  id: DEMO_LISTING.id,
  caption: DEMO_LISTING.caption,
  mediaType: "IMAGE",
  permalink: "https://www.instagram.com/",
};

function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Public source";
  }
}

function confidenceLabel(value: number): ProspectResult["confidence"] {
  if (value >= 0.75) return "high";
  if (value >= 0.45) return "medium";
  return "low";
}

function mapRemoteProspect(prospect: RemoteProspect, index: number): ProspectResult {
  return {
    confidence: confidenceLabel(prospect.confidence),
    excerpt: prospect.evidenceExcerpt,
    id: `research-${index}-${prospect.name}`,
    name: prospect.name,
    relevance: prospect.relevance,
    sourceLabel: sourceLabel(prospect.sourceUrl),
    sourceUrl: prospect.sourceUrl,
    uncertainty: prospect.uncertainty,
  };
}

const demoProspects: ProspectResult[] = DEMO_PROSPECTS.map((prospect) => ({
  confidence: prospect.confidence,
  excerpt: prospect.excerpt,
  id: prospect.id,
  name: prospect.name,
  relevance: prospect.relevance,
  sourceLabel: prospect.sourceLabel,
  sourceUrl: prospect.sourceUrl,
  uncertainty: prospect.uncertainty,
}));

function moneyValue(value: string): number {
  return Number(value.replace(/[$,\s]/g, ""));
}

function compactCaption(caption: string): string {
  const normalized = caption.trim();
  if (!normalized) return "This post has no seller-visible caption.";
  return normalized.length > 180 ? `${normalized.slice(0, 177)}…` : normalized;
}

export function ScoutPage() {
  const [searchParams] = useSearchParams();
  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<InstagramMediaOption | null>(null);
  const [ask, setAsk] = useState("550");
  const [floor, setFloor] = useState("500");
  const [results, setResults] = useState<ProspectResult[] | null>(null);
  const [researching, setResearching] = useState(false);
  const [resultsAreFixture, setResultsAreFixture] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    void getInstagramConnection()
      .then((session) => {
        if (!active) return;
        setConnection(session);
        if (session?.connected) {
          setStatus(`Connected as @${session.profile?.username ?? "authorized account"}. Choose one post to search.`);
        }
      })
      .finally(() => {
        if (active) setConnectionLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const hasConnectedInstagram = connection?.connected === true;
  const posts = useMemo(
    () => (hasConnectedInstagram ? connection?.media ?? [] : [DEMO_POST]),
    [connection?.media, hasConnectedInstagram],
  );
  const askValue = moneyValue(ask);
  const floorValue = moneyValue(floor);
  const validRange = Number.isFinite(askValue)
    && Number.isFinite(floorValue)
    && askValue > 0
    && floorValue >= 0
    && askValue >= floorValue;
  const instagramDenied = searchParams.get("instagram") === "denied";

  function selectPost(post: InstagramMediaOption) {
    setSelectedPost(post);
    setResults(null);
    setResultsAreFixture(false);
    setStatus(`${hasConnectedInstagram ? "Post" : "Demo post"} selected. Set your range, then search public sources.`);
  }

  function searchProspects() {
    if (!selectedPost) {
      setStatus("Choose one Instagram post before starting a search.");
      return;
    }
    if (!validRange) {
      setStatus("Enter a valid range: asking price must be at least the floor.");
      return;
    }
    if (!selectedPost.caption.trim()) {
      setStatus("Choose a post with a seller-visible caption before starting a search.");
      return;
    }

    setResearching(true);
    setResults(null);
    setStatus("Searching up to three public sources for cited research leads…");

    // The selected caption is the sole client-supplied model input. Seller pricing stays local.
    void researchApprovedListing(selectedPost.caption.trim()).then((response) => {
      if (response?.research?.prospects?.length) {
        setResults(response.research.prospects.map(mapRemoteProspect));
        setResultsAreFixture(response.mode === "fixture");
        setStatus(response.mode === "fixture"
          ? "Demo research leads are ready. Review their public citations."
          : "Cited research leads are ready. Review their public citations.");
      } else {
        setResults(demoProspects);
        setResultsAreFixture(true);
        setStatus(response
          ? "Research needs seller review, so compact demo citations are shown for this walkthrough."
          : "Live research is unavailable, so compact demo citations are shown for this walkthrough.");
      }
      setResearching(false);
    });
  }

  return (
    <main className="scout" aria-labelledby="scout-title">
      <div className="scout-shell">
        <header className="scout-topbar">
          <a className="scout-secondary scout-topbar__brand" href="/" aria-label="CoinScout home">
            <span aria-hidden="true">◉</span> CoinScout
          </a>
          <span className="scout-topbar__tag">Atlas Scout</span>
        </header>

        <section className="scout-flow">
          <div className="scout-flow__intro">
            <p className="scout-note">Collector market research</p>
            <h1 id="scout-title">Select a listing. Set your range. Find leads.</h1>
            <p>CoinScout searches cited public sources for relevant collector-market research. It never messages anyone or commits inventory.</p>
          </div>

          <section className="scout-step" aria-labelledby="sign-in-title">
            <div className="scout-step__number" aria-hidden="true">01</div>
            <div className="scout-panel">
              <div className="scout-panel__heading">
                <div>
                  <p className="scout-note">Instagram</p>
                  <h2 id="sign-in-title">Sign in with Instagram</h2>
                </div>
                {hasConnectedInstagram && <span className="scout-step__state">Connected</span>}
              </div>
              <p>Connect the Business or Creator account that owns the listing you want to search.</p>
              {connectionLoading ? (
                <p className="scout-status" role="status">Checking your Instagram session…</p>
              ) : hasConnectedInstagram ? (
                <p className="scout-status" role="status">@{connection?.profile?.username ?? "authorized account"} is ready.</p>
              ) : (
                <div className="scout-panel__actions">
                  <a className="scout-primary" href="/api/instagram/start">Connect Instagram</a>
                  <p className="scout-note">Instagram Login is limited to Meta role-authorized Business or Creator test accounts for now.</p>
                </div>
              )}
              {instagramDenied && <p className="scout-status scout-status--warning" role="status">Instagram sign-in did not complete. No session was created.</p>}
            </div>
          </section>

          <section className="scout-step" aria-labelledby="post-title">
            <div className="scout-step__number" aria-hidden="true">02</div>
            <div className="scout-panel">
              <div className="scout-panel__heading">
                <div>
                  <p className="scout-note">Your inventory</p>
                  <h2 id="post-title">Select a post</h2>
                </div>
                {!hasConnectedInstagram && !connectionLoading && <span className="scout-step__state">Demo mode</span>}
              </div>
              {hasConnectedInstagram && posts.length === 0 ? (
                <div className="scout-empty">No eligible posts are available in this authorized session. Choose another post in Instagram, then reconnect.</div>
              ) : (
                <div className="scout-posts" aria-label="Instagram posts">
                  {posts.map((post) => {
                    const selected = selectedPost?.id === post.id;
                    return (
                      <article className={`scout-post ${selected ? "scout-post--selected" : ""}`} key={post.id}>
                        <div className="scout-post__meta">
                          <span>{post.mediaType.replace(/_/g, " ")}</span>
                          {!hasConnectedInstagram && <span>Demo listing</span>}
                        </div>
                        <p>{compactCaption(post.caption)}</p>
                        <div className="scout-post__actions">
                          <button className={selected ? "scout-primary" : "scout-secondary"} type="button" aria-pressed={selected} onClick={() => selectPost(post)}>
                            {selected ? "Selected" : "Select post"}
                          </button>
                          {hasConnectedInstagram && post.permalink && <a className="scout-secondary" href={post.permalink} target="_blank" rel="noreferrer">View post ↗</a>}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              {!hasConnectedInstagram && !connectionLoading && <p className="scout-note">A single demo post is available while an authorized Instagram session is not connected.</p>}
            </div>
          </section>

          <section className="scout-step" aria-labelledby="range-title">
            <div className="scout-step__number" aria-hidden="true">03</div>
            <div className="scout-panel">
              <div className="scout-panel__heading">
                <div>
                  <p className="scout-note">Seller criteria</p>
                  <h2 id="range-title">Set your range</h2>
                </div>
                <span className="scout-step__state">Local only</span>
              </div>
              <div className="scout-range">
                <label>
                  <span>Asking price</span>
                  <div><b aria-hidden="true">$</b><input value={ask} onChange={(event) => setAsk(event.target.value)} inputMode="decimal" aria-label="Asking price" aria-invalid={ask !== "" && !Number.isFinite(askValue)} /></div>
                </label>
                <span className="scout-range__connector" aria-hidden="true">to</span>
                <label>
                  <span>Range floor</span>
                  <div><b aria-hidden="true">$</b><input value={floor} onChange={(event) => setFloor(event.target.value)} inputMode="decimal" aria-label="Range floor" aria-invalid={floor !== "" && !Number.isFinite(floorValue)} /></div>
                </label>
                <div className="scout-range__autoclose"><span>Auto-close</span><strong>$525</strong></div>
              </div>
              {!validRange && <p className="scout-status scout-status--warning" role="alert">The asking price must be at least the floor.</p>}
              <p className="scout-note">Your range stays in this browser. It is never sent with the search request.</p>
            </div>
          </section>

          <section className="scout-step" aria-labelledby="search-title">
            <div className="scout-step__number" aria-hidden="true">04</div>
            <div className="scout-panel">
              <div className="scout-panel__heading">
                <div>
                  <p className="scout-note">Public market research</p>
                  <h2 id="search-title">Search on your behalf</h2>
                </div>
              </div>
              <p>CoinScout uses only the selected post’s caption to find up to three cited public research leads.</p>
              <button className="scout-primary" type="button" disabled={!selectedPost || !validRange || researching} onClick={searchProspects}>
                {researching ? "Searching public sources…" : "Find collector-market leads"}
              </button>
              <p className="scout-note">Search only — it will not message anyone, send an offer, or reserve your item.</p>

              {status && <p className="scout-status" role="status">{status}</p>}

              {results && (
                <div className="scout-results" aria-live="polite">
                  <div className="scout-results__heading">
                    <h3>{resultsAreFixture ? "Demo cited leads" : "Cited research leads"}</h3>
                    <p>These are research leads, not claims that anyone wants to buy this item.</p>
                  </div>
                  {results.map((prospect) => (
                    <article className="scout-result" key={prospect.id}>
                      <div className="scout-result__heading">
                        <div>
                          <h4>{prospect.name}</h4>
                          <p>{prospect.relevance}</p>
                        </div>
                        <span className={`scout-result__confidence scout-result__confidence--${prospect.confidence}`}>{prospect.confidence} confidence</span>
                      </div>
                      <blockquote>“{prospect.excerpt}”</blockquote>
                      <a href={prospect.sourceUrl} target="_blank" rel="noreferrer">{prospect.sourceLabel} ↗</a>
                      <p className="scout-note"><strong>Uncertainty:</strong> {prospect.uncertainty}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
